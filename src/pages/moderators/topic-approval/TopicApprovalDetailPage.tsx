import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

import LoadingPage from "@/pages/loading-page";
import { Button } from "@/components/globals/atoms/button";
import { Badge } from "@/components/globals/atoms/badge";
import { Label } from "@/components/globals/atoms/label";
import { formatDateTime } from "@/utils/formatter";
import {
  getTopicDetail,
  type TopicDetailResponse,
} from "@/services/topicService";

function SectionCard({
  title,
  desc,
  children,
  icon,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900/90 text-white shadow-sm">
          {icon ?? <BookOpen className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {desc ? (
            <p className="text-muted-foreground text-xs">{desc}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="bg-muted rounded-md px-4 py-2 text-sm whitespace-pre-line text-gray-800">
        {children || <span className="text-gray-400 italic">--</span>}
      </div>
    </div>
  );
}

const StatusPill = ({ approved }: { approved?: boolean | null }) =>
  approved ? (
    <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      Đã duyệt
    </Badge>
  ) : (
    <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
      <XCircle className="mr-1 h-3.5 w-3.5" />
      Chưa duyệt
    </Badge>
  );

const getErrorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Không tải được chi tiết đề tài";

export default function TopicApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<TopicDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const detail = await getTopicDetail(Number(id));
        setData(detail);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const requiredProgress = useMemo(() => {
    if (!data) return { count: 0, total: 5, progress: 0 };
    const req = {
      title: data.title?.trim(),
      description: data.description?.trim(),
      objectives: data.objectives?.trim(),
      categoryId: data.categoryId,
      maxStudents: data.maxStudents,
    } as const;
    const keys = Object.keys(req) as (keyof typeof req)[];
    const complete = keys.filter((k) =>
      typeof req[k] === "number"
        ? Number(req[k]) > 0
        : Boolean(req[k] && String(req[k]).length > 0),
    ).length;
    return {
      count: complete,
      total: keys.length,
      progress: Math.round((complete / keys.length) * 100),
    };
  }, [data]);

  if (loading) return <LoadingPage />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Không tìm thấy đề tài.</p>;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Chi tiết đề tài (Moderator)
              </h2>
              <p className="text-xs text-white/70">
                Xem tổng quan & nội dung phiên bản hiện tại
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill approved={data.isApproved} />
            <div className="w-48">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span>Hoàn thiện</span>
                <span className="font-semibold">
                  {requiredProgress.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${requiredProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionCard
            title="Thông tin cơ bản"
            desc="Các trường định danh đề tài và phân loại."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoBlock label="Tiêu đề">{data.title}</InfoBlock>
              <InfoBlock label="Giảng viên hướng dẫn">
                {data.supervisorName}
              </InfoBlock>
              <InfoBlock label="Danh mục">{data.categoryName}</InfoBlock>
              <InfoBlock label="Học kỳ">{data.semesterName}</InfoBlock>

              <div className="md:col-span-2">
                <InfoBlock label="Mục tiêu">{data.objectives}</InfoBlock>
              </div>
              <div className="md:col-span-2">
                <InfoBlock label="Mô tả">{data.description}</InfoBlock>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Nội dung nghiên cứu"
            desc="Các trường bổ sung của phiên bản hiện tại."
          >
            {data.currentVersion ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBlock label="Phương pháp">
                  {data.currentVersion.methodology}
                </InfoBlock>
                <InfoBlock label="Kết quả mong đợi">
                  {data.currentVersion.expectedOutcomes}
                </InfoBlock>
                <InfoBlock label="Yêu cầu">
                  {data.currentVersion.requirements}
                </InfoBlock>
                <InfoBlock label="Tài liệu đính kèm">
                  {data.currentVersion.documentUrl ? (
                    <a
                      href={data.currentVersion.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {data.currentVersion.documentUrl}
                    </a>
                  ) : (
                    "--"
                  )}
                </InfoBlock>
                <InfoBlock label="Ngày tạo phiên bản">
                  {formatDateTime(data.currentVersion.createdAt)}
                </InfoBlock>
                <InfoBlock label="Người tạo phiên bản">
                  {data.currentVersion.createdBy}
                </InfoBlock>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Chưa có phiên bản nội dung.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Tóm tắt">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Danh mục</span>
                  <span className="font-medium">
                    {data.categoryName || "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Học kỳ</span>
                  <span className="font-medium">
                    {data.semesterName || "—"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SV tối đa</span>
                  <span className="font-medium">{data.maxStudents ?? "—"}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-muted-foreground mb-1">Tiêu đề</div>
                <div className="line-clamp-2 text-sm font-medium">
                  {data.title || "—"}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Thông tin hệ thống">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium">
                  {formatDateTime(data.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-muted-foreground">Người tạo</span>
                <span className="font-medium">{data.createdBy}</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="sticky bottom-3 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div />
        </div>
      </div>
    </div>
  );
}
