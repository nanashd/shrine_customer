'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import KPIs from "@/components/Dashboard/KPIs";
import SalesCharts from "@/components/Dashboard/SalesCharts";
import { useCollection } from "@/lib/hooks/useCollection";
import { Customer } from "@/types/customer";
import { SHICHIGOSAN, YAKUDOSHI } from "@/lib/notificationMaster";
import { differenceInYears, parseISO } from "date-fns";

function getAge(birthday?: string) {
  if (!birthday) return null;
  try {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    return differenceInYears(endOfYear, parseISO(birthday));
  } catch {
    return null;
  }
}
function matchMaster(age: number | null, gender: string, master: { age: number; gender: string; label: string }[]) {
  if (age == null) return null;
  return master.find((m) => m.age === age && m.gender === gender);
}

export default function DashboardPage() {
  const { data: customers } = useCollection<Customer>("customers");
  const shichigosan = (customers || []).filter((c) => matchMaster(getAge(c.birthday), c.gender || '', SHICHIGOSAN));
  const yakudoshi = (customers || []).filter((c) => matchMaster(getAge(c.birthday), c.gender || '', YAKUDOSHI));

  return (
    <main className="p-8 min-h-screen bg-gray-50">
      {/* 通知バナー */}
      {(shichigosan.length > 0 || yakudoshi.length > 0) && (
        <div className="mb-6 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <span className="font-bold">通知:</span> 七五三・厄年の該当者がいます。
          <Link href="/notifications" className="ml-4 underline text-[#C41E3A]">通知対象者一覧を見る</Link>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-8 text-[#C41E3A]">ダッシュボード</h1>
      <KPIs />
      <SalesCharts />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">顧客一覧</h2>
          <p className="mb-4 text-gray-500">参拝者の基本情報を管理</p>
          <Link href="/customers">
            <Button className="bg-[#C41E3A] text-white w-32">顧客台帳へ</Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">御札サイズマスタ</h2>
          <p className="mb-4 text-gray-500">サイズ・単価の管理</p>
          <Link href="/master/sizes">
            <Button className="bg-[#C41E3A] text-white w-32">サイズ管理へ</Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">願意マスタ</h2>
          <p className="mb-4 text-gray-500">願意（祈願内容）の管理</p>
          <Link href="/master/wishes">
            <Button className="bg-[#C41E3A] text-white w-32">願意管理へ</Button>
          </Link>
        </div>
      </div>
    </main>
  );
} 