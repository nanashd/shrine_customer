"use client";
import { useCollection } from "@/lib/hooks/useCollection";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type Order = {
  id: string;
  amount: number;
  date: { toDate: () => Date } | Date | string;
};

export default function KPIs() {
  const { data: orders, loading } = useCollection<Order>("orders");
  const [count, setCount] = useState(0);
  const [sales, setSales] = useState(0);

  useEffect(() => {
    if (!orders) return;
    const now = new Date();
    const ym = format(now, "yyyy-MM");
    const filtered = orders.filter((o) => {
      const d = typeof o.date === "string" ? new Date(o.date) : o.date && "toDate" in o.date ? o.date.toDate() : o.date;
      return format(d, "yyyy-MM") === ym;
    });
    setCount(filtered.length);
    setSales(filtered.reduce((sum, o) => sum + (o.amount || 0), 0));
  }, [orders]);

  return (
    <div className="flex gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
        <div className="text-xs text-gray-500 mb-1">今月の受付件数</div>
        <div className="text-2xl font-bold text-[#C41E3A]">{loading ? "-" : count}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex-1 text-center">
        <div className="text-xs text-gray-500 mb-1">今月の売上</div>
        <div className="text-2xl font-bold text-[#C41E3A]">{loading ? "-" : sales.toLocaleString()} 円</div>
      </div>
    </div>
  );
} 