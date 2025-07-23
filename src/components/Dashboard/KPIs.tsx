"use client";
import { useCollection } from "@/lib/hooks/useCollection";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Customer } from "@/types/customer";

export default function KPIs() {
  const { data: customers, loading } = useCollection<Customer>("customers");
  const [count, setCount] = useState(0);
  const [sales, setSales] = useState(0);

  useEffect(() => {
    if (!customers) return;
    const now = new Date();
    const ym = format(now, "yyyy-MM");
    const filtered = customers.filter((c) => {
      if (!c.createdAt || !c.createdAt.toDate) return false;
      return format(c.createdAt.toDate(), "yyyy-MM") === ym;
    });
    setCount(filtered.length);
    setSales(filtered.reduce((sum, c) => sum + (c.price || 0), 0));
  }, [customers]);

  return (
    <div className="flex gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
        <div className="text-xs text-gray-500 mb-1">今月の新規顧客件数</div>
        <div className="text-2xl font-bold text-[#C41E3A]">{loading ? "-" : count}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
        <div className="text-xs text-gray-500 mb-1">今月の登録金額合計</div>
        <div className="text-2xl font-bold text-[#C41E3A]">{loading ? "-" : sales.toLocaleString()} 円</div>
      </div>
    </div>
  );
} 