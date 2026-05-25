import OpenAI from "openai";
import { toolDefinitions, runTool } from "./tools";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const SYSTEM_PROMPT = `You are a writing assistant for ${process.env.YOUR_NAME}, a React Native developer.

Bio: ${process.env.YOUR_BIO}

Your job: write a LinkedIn post on the given topic that sounds like a real engineer sharing real insight — not corporate fluff.

VOICE RULES (critical):
- First person, conversational, direct
- NO "I'm excited to share", "thrilled to announce", "let's dive in"
- NO empty hype words: "game-changer", "revolutionary", "unlock", "leverage"
- NO emoji spam — max 1-2, only if natural
- Concrete > abstract. Real numbers, real examples, real code
- Show opinion. Engineers respect strong takes backed by reasoning
- If you don't have a real story, don't fake one — make it about the technical content

STRUCTURE:
- Hook in first 2 lines (LinkedIn truncates at ~210 chars before "see more")
- 3-5 short paragraphs, mobile-readable
- One concrete code snippet OR specific example if relevant
- One genuine takeaway
- One question that drives comments (not generic "what do you think?")
- 3-5 relevant hashtags at the very end

LENGTH: 1300-1900 characters total. Count carefully.

PROCESS:
1. Search the web 2-3 times to gather current facts about the topic
2. Verify any version numbers, library names, or claims you make
3. Write the post
4. Self-check: does it sound like a human engineer or marketing copy? Revise if needed.

Return ONLY the final post text. No preamble, no "here's your post:", no explanation.`;

export interface AgentResult {
  draft: string;
  sources: { title: string; url: string }[];
  iterations: number;
  tokensUsed: number;
}

export async function writeBlogPost(topic: string, angle?: string): Promise<AgentResult> {
  const userMessage = angle
    ? `Topic: ${topic}\n\nSuggested angle: ${angle}\n\nResearch and write the LinkedIn post.`
    : `Topic: ${topic}\n\nResearch and write the LinkedIn post.`;

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  const sources: { title: string; url: string }[] = [];
  let iterations = 0;
  let totalTokens = 0;
  const MAX_ITERATIONS = 8;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client.chat.completions.create({
      model: "deepseek-v4-pro",
      messages,
      tools: toolDefinitions,
      temperature: 0.7,
    });

    totalTokens += response.usage?.total_tokens ?? 0;
    const msg = response.choices[0].message;
    messages.push(msg);

    // No tool calls = final answer
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return {
        draft: msg.content ?? "",
        sources,
        iterations,
        tokensUsed: totalTokens,
      };
    }

    // Execute every tool call
    for (const call of msg.tool_calls) {
      const args = JSON.parse(call.function.arguments);
      const result = await runTool(call.function.name, args);

      if (call.function.name === "web_search" && result.results) {
        for (const r of result.results) {
          if (!sources.find((s) => s.url === r.url)) {
            sources.push({ title: r.title, url: r.url });
          }
        }
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error(`Agent exceeded ${MAX_ITERATIONS} iterations without finishing`);
}