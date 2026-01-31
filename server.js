import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const SEARXNG_BASE = process.env.SEARXNG_BASE || "http://localhost:8080";

const server = new Server(
  { name: "searxng-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "searxng_search",
        description: "Search via local SearXNG (returns top results)",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            limit: { type: "integer", minimum: 1, maximum: 50 },
            language: { type: "string" },
            time_range: { type: "string" },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name !== "searxng_search") {
    throw new Error(`Unknown tool: ${name}`);
  }

  const query = String(args?.query || "").trim();
  if (!query) throw new Error("Missing query");

  const limit = Math.min(Math.max(Number(args?.limit || 10), 1), 50);
  const language = args?.language ? String(args.language) : "all";
  const time_range = args?.time_range ? String(args.time_range) : undefined;

  const url = new URL("/search", SEARXNG_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("safesearch", "1");
  url.searchParams.set("language", language);
  if (time_range) url.searchParams.set("time_range", time_range);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`SearXNG error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results.slice(0, limit) : [];

  const formatted = results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content,
    engine: r.engine,
    score: r.score,
    publishedDate: r.publishedDate,
  }));

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ query, count: formatted.length, results: formatted }, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
