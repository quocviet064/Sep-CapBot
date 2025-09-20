import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Bucket = { name: string; from: number; to: number; count: number };
export default function AiScoreBarChart({ data = [], loading = false }: { data: Bucket[]; loading?: boolean }) {
  const chartData = data.map((d) => ({ name: d.name, count: d.count }));
  return (
    <div className="rounded border p-4">
      <div className="text-sm font-semibold mb-2">AI score distribution</div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Đang tải…</div>
      ) : (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">Buckets: 0-20,21-40,...,81-100 (No AI = missing)</div>
    </div>
  );
}
