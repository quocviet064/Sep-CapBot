import React from "react";
import { animate } from "framer-motion";
import { Users, Search, Trophy, BarChart3, Flame, Crown } from "lucide-react";
import { useUsers } from "@/hooks/useAdminUser";
import type { UserDTO } from "@/services/authService";
import { fetchAllTopics, type TopicListItem } from "@/services/topicService";

type Status =
  | "Pending"
  | "UnderReview"
  | "Duplicate"
  | "RevisionRequired"
  | "EscalatedToModerator"
  | "Approved"
  | "Rejected";

function normalizeStatus(s: unknown): Status {
  const v = String(s ?? "")
    .trim()
    .toLowerCase();
  if (v === "approved") return "Approved";
  if (v === "rejected") return "Rejected";
  if (v === "underreview" || v === "under_review" || v === "under review")
    return "UnderReview";
  if (v === "duplicate") return "Duplicate";
  if (v === "revisionrequired" || v === "revision_required")
    return "RevisionRequired";
  if (v === "escalatedtomoderator" || v === "escalated_to_moderator")
    return "EscalatedToModerator";
  return "Pending";
}

function classNames(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

function useCounter(target: number, duration = 0.6, decimals = 0) {
  const [display, setDisplay] = React.useState("0");
  React.useEffect(() => {
    const c = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (n) => setDisplay(Number(n).toFixed(decimals)),
    });
    return () => c.stop();
  }, [target, duration, decimals]);
  return display;
}

function initialsOf(name?: string, email?: string) {
  const base = (name && name.trim()) || (email && email.split("@")[0]) || "";
  const parts = base
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/);
  const inits =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : (parts[0][0] || "") + (parts[1][0] || "");
  return inits.toUpperCase();
}

function belongsToUser(t: TopicListItem, u: UserDTO) {
  const uname = String(u.userName || "").toLowerCase();
  const email = String(u.email || "").toLowerCase();
  const emailLocal = email.includes("@") ? email.split("@")[0] : email;
  const createdBy = String(t.createdBy || "").toLowerCase();
  const supervisor = String(t.supervisorName || "").toLowerCase();
  if (String(u.id) === createdBy) return true;
  if (createdBy === uname || createdBy === emailLocal) return true;
  if (supervisor === uname || supervisor === emailLocal) return true;
  return false;
}

function Shine({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        "pointer-events-none absolute inset-0 -z-10",
        className,
      )}
    >
      <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute inset-0 [background-size:24px_24px] opacity-[0.05] [background:linear-gradient(0deg,transparent_23px,rgba(15,23,42,.12)_24px),linear-gradient(90deg,transparent_23px,rgba(15,23,42,.12)_24px)]" />
    </div>
  );
}

function BigKPI({ value }: { value: number }) {
  const text = useCounter(value);
  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-amber-200/50">
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_10%_-10%,rgba(251,146,60,0.28),transparent_50%),radial-gradient(110%_80%_at_100%_0%,rgba(245,158,11,0.22),transparent_52%)]" />
      <div className="relative grid grid-cols-[auto,1fr] items-center gap-4 rounded-3xl bg-white/70 p-6 backdrop-blur">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_10px_40px_rgba(245,158,11,.35)] ring-1 ring-amber-300/60">
          <Trophy className="h-7 w-7" />
        </div>
        <div>
          <div className="text-[12px] font-semibold tracking-wide text-amber-700">
            Tổng đề tài được duyệt (toàn hệ)
          </div>
          <div className="mt-1 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-5xl leading-none font-black text-transparent">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovedBySemester({
  items,
}: {
  items: { name: string; count: number }[];
}) {
  if (!items.length) {
    return (
      <div className="grid h-full place-items-center rounded-3xl bg-white/70 p-6 text-sm text-slate-600 ring-1 ring-slate-200">
        Chưa có dữ liệu học kỳ
      </div>
    );
  }
  const max = Math.max(...items.map((x) => x.count), 1);
  return (
    <div className="relative rounded-3xl ring-1 ring-amber-200/50">
      <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_90%_-10%,rgba(251,146,60,.22),transparent_60%)]" />
      <div className="relative rounded-3xl bg-white/70 p-5 backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <BarChart3 className="h-4 w-4 text-amber-600" />
          Được duyệt theo học kỳ (toàn hệ)
        </div>
        <ul className="space-y-3">
          {items.map((it) => {
            const pct = (it.count / max) * 100;
            return (
              <li key={it.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {it.name}
                  </span>
                  <span className="text-slate-600">{it.count}</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-100 to-slate-50 ring-1 ring-amber-200/60">
                  <div
                    className="absolute inset-y-0 left-0 h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#fb923c)] shadow-[0_2px_14px_rgba(245,158,11,.45)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function RateBar({ rate }: { rate: number }) {
  const pct = Math.max(0, Math.min(100, rate));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-amber-200/60">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#fb923c)] shadow-[0_2px_10px_rgba(245,158,11,.45)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SupervisorCard({
  user,
  topics,
}: {
  user: UserDTO;
  topics: TopicListItem[];
}) {
  const decided = React.useMemo(
    () =>
      topics.filter((t) =>
        ["Approved", "Rejected"].includes(
          normalizeStatus(t.latestSubmissionStatus),
        ),
      ),
    [topics],
  );
  const approved = React.useMemo(
    () =>
      decided.filter(
        (t) => normalizeStatus(t.latestSubmissionStatus) === "Approved",
      ),
    [decided],
  );
  const rate = decided.length ? (approved.length / decided.length) * 100 : 0;
  const aText = useCounter(approved.length);
  const dText = useCounter(decided.length);
  const rText = useCounter(Math.round(rate));

  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-amber-200/50">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_0%_0%,rgba(254,215,170,.55),transparent_45%),radial-gradient(70%_50%_at_100%_100%,rgba(251,146,60,.35),transparent_55%)]" />
      <div className="relative rounded-3xl bg-white/70 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white ring-1 ring-white/10">
              {initialsOf(user.userName, user.email)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {user.userName || `#${user.id}`}
              </div>
              <div className="truncate text-xs text-slate-500">
                {user.email || "—"}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Crown className="h-3.5 w-3.5" />
            Supervisor
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-200/60">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              Duyệt
            </div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {aText}
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-200/60">
            <div className="text-[11px] font-semibold text-slate-600">
              Đã nộp
            </div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {dText}
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-amber-200/60">
            <div className="text-[11px] font-semibold text-slate-600">
              Tỉ lệ duyệt
            </div>
            <div className="mt-1 text-2xl font-extrabold text-slate-900">
              {rText}%
            </div>
          </div>
        </div>

        <div className="mt-3">
          <RateBar rate={rate} />
        </div>
      </div>
    </div>
  );
}

export default function AdminSupervisorsOnlyDashboard() {
  const [keyword, setKeyword] = React.useState("");
  const {
    data,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers({
    PageNumber: 1,
    PageSize: 100,
    Keyword: keyword.trim() ? keyword.trim() : undefined,
  });

  const rawUsers: UserDTO[] = data?.listObjects ?? [];
  const supervisors = React.useMemo(
    () =>
      rawUsers.filter((u) =>
        (u.roleInUserOverviewDTOs || []).some(
          (r) => String(r?.name || "").toLowerCase() === "supervisor",
        ),
      ),
    [rawUsers],
  );

  const [topicsLoading, setTopicsLoading] = React.useState(false);
  const [topicsError, setTopicsError] = React.useState<string | null>(null);
  const [allTopics, setAllTopics] = React.useState<TopicListItem[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setTopicsLoading(true);
        setTopicsError(null);
        const acc: TopicListItem[] = [];
        let page = 1;
        const pageSz = 250;
        for (;;) {
          const res = await fetchAllTopics(
            undefined,
            undefined,
            page,
            pageSz,
            undefined,
            undefined,
          );
          if (Array.isArray(res?.listObjects) && res.listObjects.length)
            acc.push(...res.listObjects);
          if (!res?.hasNextPage) break;
          page += 1;
        }
        if (!alive) return;
        setAllTopics(acc);
      } catch (e) {
        if (!alive) return;
        setTopicsError(
          e instanceof Error ? e.message : "Không thể tải danh sách đề tài",
        );
      } finally {
        if (alive) setTopicsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const globalApprovedCount = React.useMemo(
    () =>
      allTopics.filter(
        (t) => normalizeStatus(t.latestSubmissionStatus) === "Approved",
      ).length,
    [allTopics],
  );

  const approvedBySemester = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allTopics) {
      if (normalizeStatus(t.latestSubmissionStatus) !== "Approved") continue;
      const name = t.semesterName || "Khác";
      map.set(name, (map.get(name) || 0) + 1);
    }
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    arr.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return arr;
  }, [allTopics]);

  const topicsByUser = React.useMemo(() => {
    const map = new Map<number, TopicListItem[]>();
    for (const u of supervisors) map.set(Number(u.id), []);
    for (const t of allTopics) {
      for (const u of supervisors) {
        if (belongsToUser(t, u)) {
          map.get(Number(u.id))!.push(t);
        }
      }
    }
    return map;
  }, [allTopics, supervisors]);

  const filteredSupervisors = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return supervisors;
    return supervisors.filter((u) => {
      const hay = `${u.userName ?? ""} ${u.email ?? ""}`.toLowerCase();
      return hay.includes(kw);
    });
  }, [keyword, supervisors]);

  return (
    <div className="relative">
      <Shine />

      <div className="mx-auto w-full max-w-[120rem] px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-3 text-4xl font-black tracking-tight">
              <span className="inline-grid place-items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-2.5 text-white ring-1 ring-white/10">
                <Users className="h-7 w-7" />
              </span>
              <span className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-500 bg-clip-text text-transparent">
                Tổng quan hệ thống
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-2 ring-1 ring-amber-200/60 backdrop-blur">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm Supervisor theo tên, email…"
                className="w-80 rounded-xl border border-amber-200/60 bg-white/70 px-7 py-2 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50"
              />
            </div>
            <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              Tổng Supervisor: {filteredSupervisors.length}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <BigKPI value={globalApprovedCount} />
          <ApprovedBySemester items={approvedBySemester} />
        </div>

        {usersError ? (
          <div className="mt-6 flex items-center justify-center">
            <div className="rounded-2xl border border-red-200/60 bg-red-50/70 px-6 py-4 text-red-700 shadow-sm">
              Lỗi danh sách người dùng: {usersError.message}
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {usersLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] animate-pulse rounded-3xl bg-white/70 ring-1 ring-amber-200/60"
              />
            ))
          ) : filteredSupervisors.length ? (
            filteredSupervisors.map((u) => (
              <SupervisorCard
                key={u.id}
                user={u}
                topics={topicsByUser.get(Number(u.id)) ?? []}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl bg-white/80 p-6 text-center text-slate-600 ring-1 ring-slate-200">
              Không có Supervisor phù hợp
            </div>
          )}
        </div>

        {topicsLoading ? (
          <div className="mt-6 grid place-items-center text-sm text-slate-600">
            Đang tải dữ liệu đề tài…
          </div>
        ) : topicsError ? (
          <div className="mt-6 rounded-2xl bg-red-50/70 p-3 text-sm text-red-700 ring-1 ring-red-200">
            {topicsError}
          </div>
        ) : null}
      </div>
    </div>
  );
}
