import fs from "fs/promises";
import path from "path";

const DRAFTS_DIR = path.join(process.cwd(), "drafts");

export interface Draft {
  id: string;
  topic: string;
  angle?: string;
  content: string;
  sources: { title: string; url: string }[];
  status: "pending" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
}

async function ensureDir() {
  await fs.mkdir(DRAFTS_DIR, { recursive: true });
}

export async function saveDraft(draft: Draft) {
  await ensureDir();
  const file = path.join(DRAFTS_DIR, `${draft.id}.json`);
  await fs.writeFile(file, JSON.stringify(draft, null, 2));
}

export async function getDraft(id: string): Promise<Draft | null> {
  try {
    const file = path.join(DRAFTS_DIR, `${id}.json`);
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function listDrafts(): Promise<Draft[]> {
  await ensureDir();
  const files = await fs.readdir(DRAFTS_DIR);
  const drafts: Draft[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const data = await fs.readFile(path.join(DRAFTS_DIR, f), "utf-8");
    drafts.push(JSON.parse(data));
  }
  return drafts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteDraft(id: string) {
  try {
    await fs.unlink(path.join(DRAFTS_DIR, `${id}.json`));
  } catch {}
}