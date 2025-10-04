import aiAPI from "@/lib/AiApi"; 

export type IndexApprovedTopicsResponse = {
    message?: string;
    indexed_count?: number;
    total_candidates?: number;
    processing_time?: number;
    [k: string]: any;
};

export const indexApprovedTopics = async () => {
  const res = await aiAPI.post("/api/v1/chroma/index-approved-topics");
  return res.data;
};
