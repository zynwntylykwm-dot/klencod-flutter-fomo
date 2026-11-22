"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Save } from "lucide-react";

import { COUNTRIES } from "@/lib/constants";

type Props = {
  user: {
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    city: string | null;
    company: string | null;
    notifyEmail: boolean;
    notifySms: boolean;
    notifyOutbid: boolean;
    notifyAuctions: boolean;
  };
};

type Feedback = { tone: "success" | "danger"; message: string } | null;

export function SettingsForm({ user }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: user.name,
    phone: user.phone ?? "",
    country: user.country ?? "الولايات المتحدة",
    city: user.city ?? "",
    company: user.company ?? "",
    notifyEmail: user.notifyEmail,
    notifySms: user.notifySms,
    notifyOutbid: user.notifyOutbid,
    notifyAuctions: user.notifyAuctions,
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState<"profile" | "password" | null>(null);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending("profile");
    setProfileFeedback(null);
    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = (await response.json()) as { error?: string };
    setProfileFeedback(
      response.ok ? { tone: "success", message: "تم حفظ بيانات الحساب وتفضيلات الإشعارات." } : { tone: "danger", message: data.error ?? "تعذّر الحفظ" },
    );
    if (response.ok) router.refresh();
    setPending(null);
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending("password");
    setPasswordFeedback(null);
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordFeedback({ tone: "danger", message: "كلمتا المرور الجديدتان غير متطابقتين" });
      setPending(null);
      return;
    }
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
    });
    const data = (await response.json()) as { error?: string };
    setPasswordFeedback(
      response.ok ? { tone: "success", message: "تم تحديث كلمة المرور بنجاح." } : { tone: "danger", message: data.error ?? "تعذّر تحديث كلمة المرور" },
    );
    if (response.ok) setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    setPending(null);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );

  const toggles: { key: "notifyEmail" | "notifySms" | "notifyOutbid" | "notifyAuctions"; label: string; hint: string }[] = [
    { key: "notifyEmail", label: "إشعارات البريد الإلكتروني", hint: "ملخص المزايدات والفواتير" },
    { key: "notifySms", label: "رسائل الجوال", hint: "تنبيهات عاجلة عند تجاوز مزايدتك" },
    { key: "notifyOutbid", label: "إشعار تجاوز المزايدة", hint: "يصلك إشعار فوري عند تجاوز مزايدتك" },
    { key: "notifyAuctions", label: "إشعارات المزادات القادمة", hint: "تذكير قبل بدء المزادات" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={saveProfile} className="card space-y-3 p-4">
        <h2 className="text-sm font-extrabold text-ink-950">بيانات الحساب</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Field label="الاسم الكامل">
            <input required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className="field" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input value={user.email} readOnly dir="ltr" className="field bg-cream-100 text-ink-600" />
          </Field>
          <Field label="رقم الجوال">
            <input dir="ltr" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="field" placeholder="+966 55 000 0000" />
          </Field>
          <Field label="الشركة / الجهة (اختياري)">
            <input value={profile.company} onChange={(event) => setProfile({ ...profile, company: event.target.value })} className="field" />
          </Field>
          <Field label="الدولة">
            <select value={profile.country} onChange={(event) => setProfile({ ...profile, country: event.target.value })} className="field">
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </Field>
          <Field label="المدينة">
            <input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} className="field" />
          </Field>
        </div>

        <div className="rounded-lg border border-line bg-cream-50 p-3">
          <p className="text-xs font-extrabold text-ink-950">تفضيلات الإشعارات</p>
          <div className="mt-2 space-y-2">
            {toggles.map((toggle) => (
              <label key={toggle.key} className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-[11px] font-bold text-ink-900">{toggle.label}</span>
                  <span className="block text-[10px] text-ink-600">{toggle.hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={profile[toggle.key]}
                  onChange={(event) => setProfile({ ...profile, [toggle.key]: event.target.checked })}
                  className="size-4 accent-[#1d5c68]"
                />
              </label>
            ))}
          </div>
        </div>

        {profileFeedback ? (
          <p className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${profileFeedback.tone === "success" ? "bg-success/10 text-[#12603f]" : "bg-danger/10 text-danger"}`}>
            {profileFeedback.tone === "success" ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}
            {profileFeedback.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending === "profile"} className="btn btn-ink w-full">
          {pending === "profile" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} حفظ التغييرات
        </button>
      </form>

      <form onSubmit={savePassword} className="card space-y-3 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><KeyRound className="size-4 text-petrol-500" /> كلمة المرور والأمان</h2>
        <p className="rounded-md bg-cream-100 px-2.5 py-2 text-[10px] leading-5 text-ink-600">
          تُخزّن كلمات المرور مشفّرة بخوارزمية scrypt، ولا تُحفظ أبدًا كنص صريح. يُنصح بتغييرها دوريًا.
        </p>
        <Field label="كلمة المرور الحالية">
          <input required type="password" dir="ltr" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="field" autoComplete="current-password" />
        </Field>
        <Field label="كلمة المرور الجديدة">
          <input required type="password" dir="ltr" minLength={8} value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="field" autoComplete="new-password" />
        </Field>
        <Field label="تأكيد كلمة المرور">
          <input required type="password" dir="ltr" minLength={8} value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} className="field" autoComplete="new-password" />
        </Field>
        {passwordFeedback ? (
          <p className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${passwordFeedback.tone === "success" ? "bg-success/10 text-[#12603f]" : "bg-danger/10 text-danger"}`}>
            {passwordFeedback.tone === "success" ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}
            {passwordFeedback.message}
          </p>
        ) : null}
        <button type="submit" disabled={pending === "password"} className="btn btn-outline w-full">
          {pending === "password" ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} تحديث كلمة المرور
        </button>
      </form>
    </div>
  );
}
