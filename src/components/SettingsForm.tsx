"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, DatabaseBackup, Info } from "lucide-react";
import { toast } from "./Shell";
import { saveSettings, reseedDemo, type SettingsInput } from "@/server/actions";
import { Card, CardHeader } from "./ui";

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [orgName, setOrgName] = useState(initial.orgName);
  const [daysPerMonth, setDaysPerMonth] = useState(String(initial.daysPerMonth));
  const [hoursPerMonth, setHoursPerMonth] = useState(String(initial.hoursPerMonth));
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(String(initial.overtimeMultiplier));
  const [graceMinutes, setGraceMinutes] = useState(String(initial.graceMinutes));
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const res = await saveSettings({
        orgName,
        daysPerMonth: Number(daysPerMonth) || 30,
        hoursPerMonth: Number(hoursPerMonth) || 220,
        overtimeMultiplier: Number(overtimeMultiplier) || 140,
        graceMinutes: Number(graceMinutes) || 0,
        deductLostTime: true,
      });
      toast(res.ok, res.message);
    });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="مشخصات سازمان" desc="در سربرگ فیش حقوقی نمایش داده می‌شود" />
        <div className="max-w-md">
          <span className="label">نام سازمان / شرکت</span>
          <input className="input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
      </Card>

      <Card>
        <CardHeader title="قواعد محاسبه حقوق" desc="حقوق پایه به نسبت زمان کارکرد واقعی هر روز محاسبه می‌شود؛ اضافه‌کاری جداگانه افزوده خواهد شد." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="label">مبنای روزهای ماه (نرخ روزانه = حقوق ÷)</span>
            <input className="input" inputMode="numeric" value={daysPerMonth} onChange={(e) => setDaysPerMonth(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div>
            <span className="label">ساعات موظفی ماه (نرخ ساعتی = حقوق ÷)</span>
            <input className="input" inputMode="numeric" value={hoursPerMonth} onChange={(e) => setHoursPerMonth(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div>
            <span className="label">ضریب اضافه‌کاری (٪)</span>
            <input className="input" inputMode="numeric" value={overtimeMultiplier} onChange={(e) => setOvertimeMultiplier(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div>
            <span className="label"> فرصت ارفاق ورود/خروج (دقیقه)</span>
            <input className="input" inputMode="numeric" value={graceMinutes} onChange={(e) => setGraceMinutes(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="راهنمای محاسبات" />
        <ul className="space-y-1.5 text-[12px] leading-6 text-zinc-600">
          <Li>حقوق کسب‌شده = نرخ روزانه × نسبت زمان کارکرد خالص به زمان موظفی همان روز؛ حضور کامل، حقوق کامل روزانه دارد</Li>
          <Li>اضافه‌کاری = کارکرد خالص بیشتر از ساعت موظفی همان روز (در روز تعطیل، کل کارکرد)</Li>
          <Li>مرخصی روزانه باحقوق، یک روز کامل محاسبه می‌شود؛ مرخصی ساعتی در کارکرد و حقوق همان روز لحاظ می‌شود</Li>
          <Li>پرداخت‌های علی‌الحساب با نوع «پرداخت حقوق / مساعده» و تاریخ واقعی پرداخت ثبت می‌شوند و از مانده قابل پرداخت همان ماه کم می‌شوند</Li>
          <Li>ساعات موظفی رایج: ۱۷۶، ۱۹۱ یا ۲۲۰ (قابل تغییر در بالا)</Li>
        </ul>
        <div className="mt-4 flex justify-end">
          <button onClick={submit} disabled={pending} className="btn btn-primary">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            ذخیره تنظیمات
          </button>
        </div>
      </Card>

      <Card className="border-amber-200 !bg-amber-50/50">
        <CardHeader
          title="داده‌های نمونه"
          desc="برای شروع سریع یا تست سامانه"
          icon={<Info className="size-4" />}
        />
        <p className="mb-3 text-[12px] leading-6 text-zinc-600">
          این گزینه فقط برای شروع دوباره با داده‌های آزمایشی است و با اجرای آن تمام اطلاعات واقعی فعلی حذف می‌شود. تغییر ماه به‌صورت خودکار هیچ اطلاعاتی را پاک نمی‌کند؛ برای دیدن ماه‌های قبل از دکمه‌های جابه‌جایی ماه در گزارش و حقوق استفاده کنید.
        </p>
        <button
          disabled={pending}
          onClick={() => {
            if (!window.confirm("تمام داده‌های فعلی پاک و داده نمونه جایگزین می‌شود. مطمئنید؟")) return;
            start(async () => {
              const res = await reseedDemo();
              toast(res.ok, res.message);
            });
          }}
          className="btn btn-danger"
        >
          <DatabaseBackup className="size-4" />
          بازنشانی با داده نمونه
        </button>
      </Card>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
      {children}
    </li>
  );
}
