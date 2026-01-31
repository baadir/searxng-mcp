# searxng-mcp

MCP tool that wraps a local SearXNG instance.

## Prereqs
- SearXNG running at http://localhost:8080 (override with `SEARXNG_BASE`)

## Run (stdio MCP server)
```bash
node server.js
```

## Example call via mcporter
```bash
mcporter call --stdio "node /home/baadir/.openclaw/workspace/searxng-mcp/server.js" \
  searxng_search query="ai agents" limit:=5 language="en" time_range="day"
```

## Example raw
```bash
SEARXNG_BASE=http://localhost:8080 node server.js
```

## If you are an OpenClaw assistant
### Quick setup
```bash
git clone https://github.com/baadir/searxng-mcp.git
cd searxng-mcp
npm install
```

Add this MCP server to your OpenClaw config (example):

```json
{
  "mcpServers": {
    "searxng": {
      "command": "node",
      "args": ["/ABS/PATH/TO/searxng-mcp/server.js"],
      "env": {
        "SEARXNG_BASE": "http://localhost:8080"
      }
    }
  }
}
```

Then restart OpenClaw:
```bash
openclaw gateway restart
```

Test from OpenClaw:
```bash
mcporter call --stdio "node /ABS/PATH/TO/searxng-mcp/server.js" \
  searxng_search query="ai agents" limit:=5 language="en" time_range="day"
```
