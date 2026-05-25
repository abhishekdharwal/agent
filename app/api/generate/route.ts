import { NextRequest, NextResponse } from "next/server";
import { writeBlogPost } from "@/lib/agent";
import { saveDraft } from "@/lib/storage";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { topic, angle } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const result = await writeBlogPost(topic, angle);
    const now = new Date().toISOString();
    const draft = {
      id: `draft_${Date.now()}`,
      topic,
      angle,
      content: result.draft,
      sources: result.sources,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
      tokensUsed: result.tokensUsed,
    };
    await saveDraft(draft);
    return NextResponse.json(draft);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}