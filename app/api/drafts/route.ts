import { NextResponse } from "next/server";
import { listDrafts } from "@/lib/storage";

export async function GET() {
  const drafts = await listDrafts();
  return NextResponse.json(drafts);
}