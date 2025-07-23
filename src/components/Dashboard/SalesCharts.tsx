"use client";
import { useCollection } from "@/lib/hooks/useCollection";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format, subMonths } from "date-fns";
import { useMemo } from "react";
import { Customer } from "@/types/customer";
import { Size } from "@/types/size";

const COLORS = ["#C41E3A", "#F7B2AD", "#F7D6AD", "#A1C4FD", "#B2F7EF", "#F7F7AD", "#A1E3A1"];

export default function SalesCharts() {
  const { data: customers } = useCollection<Customer>("customers");
  const { data: sizes } = useCollection<Size>("sizes");

  // サイズ別売上（今月）
  const pieData = useMemo(() => {
    if (!customers || !sizes) return [];
    const now = new Date();
    const ym = format(now, "yyyy-MM");
    const filtered = customers.filter((c) => {
      if (!c.createdAt || !c.createdAt.toDate) return false;
      return format(c.createdAt.toDate(), "yyyy-MM") === ym;
    });
    return sizes.map((s) => ({
      name: s.name,
      value: filtered.filter((c) => c.sizeId === s.id).reduce((sum, c) => sum + (c.price || 0), 0),
    })).filter((d) => d.value > 0);
  }, [customers, sizes]);

  // 月別売上（直近12ヶ月）
  const barData = useMemo(() => {
    if (!customers) return [];
    const now = new Date();
    return Array.from({ length: 12 }).map((_, i) => {
      const dt = subMonths(now, 11 - i);
      const ym = format(dt, "yyyy-MM");
      const sum = customers.filter((c) => {
        if (!c.createdAt || !c.createdAt.toDate) return false;
        return format(c.createdAt.toDate(), "yyyy-MM") === ym;
      }).reduce((acc, c) => acc + (c.price || 0), 0);
      return { month: format(dt, "yy/MM"), 売上: sum };
    });
  }, [customers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">サイズ別売上（今月）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v.toLocaleString()} 円`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">月別売上推移（直近12ヶ月）</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v) => `${v.toLocaleString()} 円`} />
            <Legend />
            <Bar dataKey="売上" fill="#C41E3A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 