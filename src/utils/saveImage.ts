import { join } from "path";
import { mkdir } from "fs/promises";

const UPLOAD_DIR = join(process.cwd(), "uploads", "images");
await mkdir(UPLOAD_DIR, { recursive: true });

export async function saveImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await Bun.write(join(UPLOAD_DIR, filename), file);
  return filename;
}