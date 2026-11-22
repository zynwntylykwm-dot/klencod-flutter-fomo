"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";

import { COUNTRIES } from "@/lib/constants";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    country: "الولايات المتحدة",
    city: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && form.password !== form.confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setPending(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              country: form.country,
              city: form.city,
            };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; user?: { role?: string } };
      if (!response.ok) {
        setError(data.error ?? "تعذّر إتمام العملية");
        return;
      }
      const target = next || (data.user?.role === "admin" ? "/admin" : "/dashboard");
      router.push(target);
      router.refresh();
    } catch {
      setError("خطأ في الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === "register" ? (
        <label>
          <span className="field-label">الاسم الكامل</span>
          <input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="مثال: أحمد الحربي" className="field" autoComplete="name" />
        </label>
      ) : null}

      <label>
        <span className="field-label">البريد الإلكتروني</span>
        <input required type="email" dir="ltr" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" className="field" autoComplete="email" />
      </label>

      <label>
        <span className="field-label">كلمة المرور</span>
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            dir="ltr"
            minLength={mode === "register" ? 8 : 1}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="••••••••"
            className="field pe-10"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute end-2 top-1/2 -translate-y-1/2 text-ink-600" aria-label="إظهار كلمة المرور">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {mode === "register" ? <span className="mt-1 block text-[10px] text-ink-600">8 أحرف على الأقل</span> : null}
      </label>

      {mode === "register" ? (
        <>
          <label>
            <span className="field-label">تأكيد كلمة المرور</span>
            <input required type={showPassword ? "text" : "password"} dir="ltr" value={form.confirm} onChange={(event) => update("confirm", event.target.value)} placeholder="••••••••" className="field" autoComplete="new-password" />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label>
              <span className="field-label">رقم الجوال (اختياري)</span>
              <input dir="ltr" value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+966 55 000 0000" className="field" />
            </label>
            <label>
              <span className="field-label">الدولة</span>
              <select value={form.country} onChange={(event) => update("country", event.target.value)} className="field">
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="field-label">المدينة (اختياري)</span>
            <input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="الرياض" className="field" />
          </label>
        </>
      ) : null}

      {error ? (
        <p className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-gold w-full py-3">
        {pending ? <Loader2 className="size-4 animate-spin" /> : mode === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
        {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
      </button>

      <p className="text-center text-[11px] text-ink-600">
        {mode === "login" ? (
          <>ليس لديك حساب؟ <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-petrol-500 hover:underline">أنشئ حسابًا جديدًا</Link></>
        ) : (
          <>لديك حساب بالفعل؟ <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-petrol-500 hover:underline">تسجيل الدخول</Link></>
        )}
      </p>
      <p className="text-center text-[10px] leading-5 text-ink-600">
        بالمتابعة أنت توافق على شروط الاستخدام وسياسة الخصوصية. هذه نسخة عرض توضيحية ولا تتم عمليات دفع حقيقية.
      </p>
    </form>
  );
}
