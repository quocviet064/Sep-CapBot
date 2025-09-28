import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/globals/atoms/skeleton";
import { Button } from "@/components/globals/atoms/button";
import { Loader2 } from "lucide-react";
import { useTopicVersionHistory } from "@/hooks/useTopicVersion";

type Props = {
  topicId: number;
  currentHref: string;
  onOpenVersion: (versionId: number) => void;
  className?: string;
  showCurrentButton?: boolean;
};

const isApproved = (status: string | number | null | undefined) => {
  if (status === null || typeof status === "undefined") return false;
  if (typeof status === "number") return status === 5;
  return String(status).toLowerCase() === "approved";
};

export default function VersionTabsApprovedOnly({
  topicId,
  currentHref,
  onOpenVersion,
  className,
  showCurrentButton = true,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error } = useTopicVersionHistory(topicId, 1, 50);
  const [isNavigatingCurrent, setIsNavigatingCurrent] = useState(false);

  const items = useMemo(() => {
    const all = data?.listObjects ?? [];
    const approvedOnly = all.filter((v) => isApproved(v.status));
    return approvedOnly
      .slice()
      .sort((a, b) => (a.versionNumber ?? 0) - (b.versionNumber ?? 0));
  }, [data]);

  useEffect(() => {
    if (isNavigatingCurrent) setIsNavigatingCurrent(false);
  }, [location.pathname]);

  const handleGoCurrent = () => {
    if (location.pathname === currentHref) {
      setIsNavigatingCurrent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setIsNavigatingCurrent(false), 350);
      return;
    }
    setIsNavigatingCurrent(true);
    navigate(currentHref);
  };

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto ${className || ""}`}
    >
      {showCurrentButton && (
        <Button
          variant="secondary"
          className="inline-flex items-center gap-2 rounded-lg"
          onClick={handleGoCurrent}
          disabled={isNavigatingCurrent}
          aria-busy={isNavigatingCurrent}
        >
          {isNavigatingCurrent && <Loader2 className="h-4 w-4 animate-spin" />}
          Phiên bản gốc
        </Button>
      )}

      {isLoading ? (
        <>
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </>
      ) : error ? (
        <span className="text-xs text-red-600">Lỗi tải lịch sử</span>
      ) : items.length === 0 ? (
        <span className="text-xs text-slate-500">
          Chưa có phiên bản nào khác.
        </span>
      ) : (
        items.map((v) => (
          <button
            key={v.id}
            onClick={() => onOpenVersion(v.id)}
            className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
            title={v.title}
          >
            Phiên bản {v.versionNumber}
          </button>
        ))
      )}
    </div>
  );
}
