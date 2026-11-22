import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { guardAdmin } from "@/lib/http";
import { fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("تعذّر قراءة الملفات المرسلة", 400);
  }

  const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return fail("لم يتم اختيار أي صورة", 422);
  if (files.length > 8) return fail("يمكن رفع 8 صور كحد أقصى في المرة", 422);

  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const extension = allowed.get(file.type);
    if (!extension) return fail(`نوع الملف ${file.type || "غير معروف"} غير مدعوم (JPG, PNG, WEBP, GIF)`, 415);
    if (file.size > 6 * 1024 * 1024) return fail("حجم الصورة يجب أن يكون أقل من 6 ميجابايت", 413);
    const fileName = `${Date.now()}-${randomBytes(5).toString("hex")}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(directory, fileName), buffer);
    urls.push(`/api/uploads/${fileName}`);
  }

  return ok({ urls }, { status: 201 });
}
