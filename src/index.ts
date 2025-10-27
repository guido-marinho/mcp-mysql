#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";

const server = new Server(
  {
    name: "mysql-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Get default database URL from environment variable or command line argument
const defaultDatabaseUrl = process.env.DATABASE_URL || process.argv.slice(2)[0];

// Cache of connection pools for different databases
const poolCache = new Map<string, mysql.Pool>();

// Function to get or create a connection pool
function getPool(databaseUrl: string): mysql.Pool {
  if (!poolCache.has(databaseUrl)) {
    poolCache.set(
      databaseUrl,
      mysql.createPool({
        uri: databaseUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      })
    );
  }
  return poolCache.get(databaseUrl)!;
}

// Variables to be initialized in runServer
let defaultPool: mysql.Pool;
let resourceBaseUrl: URL;

const SCHEMA_PATH = "schema";

// List available resources (tables)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const connection = await defaultPool.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    const tables = rows as Array<{ TABLE_NAME: string }>;

    return {
      resources: tables.map((table) => ({
        uri: `${resourceBaseUrl.href}${SCHEMA_PATH}/${table.TABLE_NAME}`,
        mimeType: "application/json",
        name: `"${table.TABLE_NAME}" database schema`,
      })),
    };
  } finally {
    connection.release();
  }
});

// Read a specific resource (table schema)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const resourceUrl = new URL(request.params.uri);
  const pathComponents = resourceUrl.pathname.split("/");
  const tableName = pathComponents.pop();
  const schema = pathComponents.pop();

  if (schema !== SCHEMA_PATH) {
    throw new Error("Invalid resource URI");
  }

  const connection = await defaultPool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable,
        COLUMN_KEY as column_key,
        COLUMN_DEFAULT as column_default,
        EXTRA as extra
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
      [tableName]
    );

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(rows, null, 2),
        },
      ],
    };
  } finally {
    connection.release();
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query",
        description: "Run a read-only SQL query against the MySQL database",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description: "The SQL query to execute (SELECT statements only)",
            },
          },
          required: ["sql"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "query") {
    const sql = request.params.arguments?.sql as string;

    if (!sql) {
      throw new Error("SQL query is required");
    }

    // Basic validation to ensure it's a read-only query
    const trimmedSql = sql.trim().toUpperCase();
    if (
      !trimmedSql.startsWith("SELECT") &&
      !trimmedSql.startsWith("SHOW") &&
      !trimmedSql.startsWith("DESCRIBE") &&
      !trimmedSql.startsWith("EXPLAIN")
    ) {
      throw new Error(
        "Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed"
      );
    }

    const connection = await defaultPool.getConnection();
    try {
      // Start a read-only transaction
      await connection.query("START TRANSACTION READ ONLY");

      const [rows] = await connection.query(sql);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rows, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      await connection.query("ROLLBACK").catch((rollbackError) => {
        console.warn("Could not roll back transaction:", rollbackError);
      });

      throw error;
    } finally {
      connection.release();
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start the server
async function runServer() {
  // Validate DATABASE_URL
  if (!defaultDatabaseUrl) {
    console.error("ERROR: Missing database connection URL");
    console.error("Please provide a MySQL connection URL in one of these ways:");
    console.error("  1. Set DATABASE_URL environment variable");
    console.error("  2. Pass as command line argument");
    console.error("");
    console.error("Example: DATABASE_URL=mysql://user:password@localhost:3306/database");
    process.exit(1);
  }

  try {
    // Initialize connection pool
    defaultPool = getPool(defaultDatabaseUrl);

    // Create resource base URL
    resourceBaseUrl = new URL(defaultDatabaseUrl);
    resourceBaseUrl.protocol = "mysql:";
    resourceBaseUrl.password = "";

    // Test database connection
    console.error("Testing database connection...");
    const connection = await defaultPool.getConnection();
    await connection.ping();
    connection.release();
    console.error("Database connection successful!");
  } catch (error) {
    console.error("ERROR: Failed to connect to database");
    console.error("Database URL:", defaultDatabaseUrl.replace(/:[^:@]+@/, ':****@'));
    console.error("Error details:", error);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MySQL MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});