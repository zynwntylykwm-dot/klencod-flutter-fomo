import { readFile } from "node:fs/promises";
import path from "node:path";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[A-Za-z0-9._-]+$/.test(file)) {
    return new Response("ملف غير صالح", { status: 400 });
  }
  const extension = file.split(".").pop()?.toLowerCase() ?? "";
  const contentType = contentTypes[extension];
  if (!contentType) return new Response("نوع غير مدعوم", { status: 415 });

  try {
    const buffer = await readFile(path.join(process.cwd(), "public", "uploads", file));
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("الصورة غير موجودة", { status: 404 });
  }
}
