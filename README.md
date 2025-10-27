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
mcp-server-mysql mysql://user:password@localhost:3306/database
```

### NPX

```bash
npx -y @modelcontextprotocol/server-mysql mysql://user:password@localhost:3306/database
```

## Usage with Claude Desktop

Add to `claude_desktop_config.json`:

### Using Docker

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
