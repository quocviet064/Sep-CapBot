// src/pages/topics/MyTopicDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "@/pages/loading-page";
import { getTopicDetail, TopicDetailResponse } from "@/services/topicService";
import TopicDetailPage from "./myTopicDetailDialog";

export default function MyTopicDetailPage() {
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
      } catch (e: any) {
        setError(e?.message || "Không tải được chi tiết đề tài");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingPage />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p className="text-sm">Không tìm thấy đề tài.</p>;

  return (
    <TopicDetailPage
      data={data}
      onBack={() => navigate(-1)}
      onUpdate={(u) => setData(u)}
    />
  );
}
