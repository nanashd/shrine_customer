'use client';

import { useCollection } from "@/lib/hooks/useCollection";
import { Customer } from "@/types/customer";
import { SHICHIGOSAN, YAKUDOSHI } from "@/lib/notificationMaster";
import { differenceInYears, parseISO } from "date-fns";

function getAge(birthday?: string) {
  if (!birthday) return null;
  try {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31); // 12月31日
    return differenceInYears(endOfYear, parseISO(birthday));
  } catch {
    return null;
  }
}

function matchMaster(age: number | null, gender: string, master: { age: number; gender: string; label: string }[]) {
  if (age == null) return null;
  return master.find((m) => m.age === age && m.gender === gender);
}

export default function NotificationsPage() {
  const { data: customers, loading } = useCollection<Customer>("customers");
  const shichigosan = (customers || []).filter((c) => matchMaster(getAge(c.birthday), c.gender || '', SHICHIGOSAN));
  const yakudoshi = (customers || []).filter((c) => matchMaster(getAge(c.birthday), c.gender || '', YAKUDOSHI));

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#C41E3A]">通知対象者一覧</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">七五三該当者</h2>
        {shichigosan.length === 0 ? (
          <div className="text-gray-500">該当者なし</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-2 py-1">氏名</th>
                <th className="px-2 py-1">性別</th>
                <th className="px-2 py-1">年齢</th>
                <th className="px-2 py-1">誕生日</th>
                <th className="px-2 py-1">住所</th>
                <th className="px-2 py-1">種別</th>
              </tr>
            </thead>
            <tbody>
              {shichigosan.map((c) => {
                const age = getAge(c.birthday);
                const master = matchMaster(age, c.gender || '', SHICHIGOSAN);
                return (
                  <tr key={c.id} className="border-b">
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : c.gender === 'other' ? 'その他' : '-'}</td>
                    <td className="px-2 py-1">{age ?? '-'}</td>
                    <td className="px-2 py-1">{c.birthday || '-'}</td>
                    <td className="px-2 py-1">{c.address}</td>
                    <td className="px-2 py-1">{master?.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">厄年該当者</h2>
        {yakudoshi.length === 0 ? (
          <div className="text-gray-500">該当者なし</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-2 py-1">氏名</th>
                <th className="px-2 py-1">性別</th>
                <th className="px-2 py-1">年齢</th>
                <th className="px-2 py-1">誕生日</th>
                <th className="px-2 py-1">住所</th>
                <th className="px-2 py-1">種別</th>
              </tr>
            </thead>
            <tbody>
              {yakudoshi.map((c) => {
                const age = getAge(c.birthday);
                const master = matchMaster(age, c.gender || '', YAKUDOSHI);
                return (
                  <tr key={c.id} className="border-b">
                    <td className="px-2 py-1">{c.name}</td>
                    <td className="px-2 py-1">{c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : c.gender === 'other' ? 'その他' : '-'}</td>
                    <td className="px-2 py-1">{age ?? '-'}</td>
                    <td className="px-2 py-1">{c.birthday || '-'}</td>
                    <td className="px-2 py-1">{c.address}</td>
                    <td className="px-2 py-1">{master?.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
} 