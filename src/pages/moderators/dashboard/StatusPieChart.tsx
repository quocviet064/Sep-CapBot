import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

export default function StatusPieChart({ data = [], loading = false }: { data: { name: string; value: number }[]; loading?: boolean }) {
  const total = data.reduce((s, it) => s + (it.value || 0), 0);
  return (
    <div className="rounded border p-4">
      <div className="text-sm font-semibold mb-2">Status breakdown</div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Đang tải…</div>
      ) : total === 0 ? (
        <div className="text-sm text-muted-foreground">Không có dữ liệu</div>
      ) : (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} fill="#8884d8" label>
                {data.map((entry, idx) => (
                  <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">Tổng: {total}</div>
    </div>
  );
}
