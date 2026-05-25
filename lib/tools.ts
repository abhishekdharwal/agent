export async function tavilySearch(query: string, maxResults = 5) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: maxResults,
      search_depth: "advanced",
      include_raw_content: false,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  const data = await res.json();
  return data.results.map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description:
        "Search the web for current information about React Native, libraries, best practices, or any technical topic. Use this to gather facts before writing.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query, 3–8 words, specific",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function runTool(name: string, args: any) {
  if (name === "web_search") {
    const results = await tavilySearch(args.query, 5);
    return { results };
  }
  return { error: `Unknown tool: ${name}` };
}