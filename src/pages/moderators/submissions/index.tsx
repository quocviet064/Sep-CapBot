import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "overview", label: "Tổng quan" },
  { to: "approve",  label: "Xét duyệt" },
  { to: "assign",   label: "Phân công" },
  { to: "reviews",  label: "Đánh giá" },
];

export default function ModeratorSubmissionsLayout() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white/70 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}         
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm rounded-md border transition ${
                  isActive
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-700 hover:bg-neutral-50"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />                 
    </div>
  );
}
