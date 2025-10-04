import { useMutation } from "@tanstack/react-query";
import { indexApprovedTopics } from "@/services/indexTopicService";
import { message } from "antd";

export function useIndexApprovedTopics() {
  return useMutation({
    mutationFn: indexApprovedTopics,
    onSuccess: (data) => {
      message.success(`Đã index thành công ${data.indexed_count} topic`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi index");
    },
  });
}
