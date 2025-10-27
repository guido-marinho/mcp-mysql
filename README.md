# MySQL MCP Server

A Model Context Protocol server that provides read-only access to MySQL databases.

## Features

### Tools

- **query** - Execute read-only SQL queries (SELECT, SHOW, DESCRIBE, EXPLAIN)
  - All queries run within READ ONLY transactions

### Resources

- **Table schemas** - Automatic discovery of tables and columns with their types, keys, and constraints

## Installation

### Docker

```bash
docker build -t mcp/mysql .
docker run -i --rm mcp/mysql mysql://user:password@host:3306/database
```

### NPM

```bash
npm install -g @modelcontextprotocol/server-mysql
```

### NPX

```bash
npx -y @modelcontextprotocol/server-mysql mysql://user:password@localhost:3306/database
```

## Usage

Add to your MCP's config:

### Using Docker image (recommended)

```bash
docker pull guidomarinho/mcp-mysql
```

```json
{
  "mcpServers": {
    "your_mcp": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "guidomarinho/mcp-mysql:latest",
        "mysql://root:password@host.docker.internal:3306/you_db"
      ],
      "env": {}
    }
  }
}
```

### Using local Docker

```json
{
  "mcpServers": {
    "mysql": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "mcp/mysql",
        "mysql://root:password@host.docker.internal:3306/database"
      ]
    }
  }
}
```

### Using NPX

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-mysql",
        "mysql://user:password@localhost:3306/database"
      ]
    }
  }
}
```

**Note**: When using Docker to connect to a MySQL server on your host machine, use `host.docker.internal` instead of `localhost`.

## Connection String Format

```
mysql://username:password@host:port/database
```

## Development

```bash
npm install
npm run build
node dist/index.js mysql://user:password@localhost:3306/database
```

## License

MIT
