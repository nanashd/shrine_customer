'use client';
import { SHICHIGOSAN, YAKUDOSHI } from "@/lib/notificationMaster";

export default function NotificationMasterPage() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-[#C41E3A]">七五三・厄年マスタ</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">七五三マスタ</h2>
        <table className="w-full text-sm border mb-4">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-2 py-1">年齢</th>
              <th className="px-2 py-1">性別</th>
              <th className="px-2 py-1">ラベル</th>
            </tr>
          </thead>
          <tbody>
            {SHICHIGOSAN.map((m, i) => (
              <tr key={i} className="border-b">
                <td className="px-2 py-1">{m.age}</td>
                <td className="px-2 py-1">{m.gender === 'male' ? '男性' : '女性'}</td>
                <td className="px-2 py-1">{m.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">厄年マスタ</h2>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-2 py-1">年齢</th>
              <th className="px-2 py-1">性別</th>
              <th className="px-2 py-1">ラベル</th>
            </tr>
          </thead>
          <tbody>
            {YAKUDOSHI.map((m, i) => (
              <tr key={i} className="border-b">
                <td className="px-2 py-1">{m.age}</td>
                <td className="px-2 py-1">{m.gender === 'male' ? '男性' : '女性'}</td>
                <td className="px-2 py-1">{m.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
} 