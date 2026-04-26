import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const cwd = process.cwd();
  const dataDir = path.join(cwd, "data", "results");
  const exists = fs.existsSync(dataDir);
  const files = exists ? fs.readdirSync(dataDir) : [];
  return NextResponse.json({ cwd, dataDir, exists, files });
}
