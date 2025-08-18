export default function ReviewerDashboard() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded border p-4">Được giao: --</div>
        <div className="rounded border p-4">Draft reviews: --</div>
        <div className="rounded border p-4">Submitted reviews: --</div>
        <div className="rounded border p-4">Sắp tới hạn: --</div>
      </div>
    </div>
  );
}
