import aiAPI from "@/lib/AiApi";

export type AdvancedDuplicateParams = {
  threshold?: number;
  semester_id?: number | null;
  last_n_semesters?: number;
};

export type AdvancedDuplicatePayload = {
  eN_Title: string;
  abbreviation?: string;
  vN_title: string;
  problem: string;
  context: string;
  content: string;
  description: string;
  objectives: string;
  semesterId?: number;
};

export type SimilarTopic = {
  id: string;
  topicId: number;
  versionId: number | null;
  versionNumber: number | null;
  submissionId: number | null;
  eN_Title: string | null;
  vN_title: string | null;
  problem: string | null;
  context: string | null;
  content: string | null;
  description: string | null;
  objectives?: string | null;
  categoryId?: number | null;
  semesterId?: number | null;
  supervisorId?: number | null;
  documentUrl?: string | null;
  status?: string | null;
  source?: string | null;
  createdAt?: string | null;
  similarity_score: number;
};

export type DuplicateCheckBlock = {
  status: "duplicate_found" | "potential_duplicate" | "no_duplicate";
  similarity_score: number;
  similar_topics: SimilarTopic[];
  threshold: number;
  message?: string;
  recommendations?: string[];
  processing_time?: number;
};

export type ModificationProposal = {
  modified_topic?: {
    title?: string;
    description?: string;
    objectives?: string;
    problem?: string;
    context?: string;
    content?: string;
    category_id?: number;
    supervisor_id?: number;
    semester_id?: number;
    max_students?: number;
  };
  modifications_made?: string[];
  rationale?: string;
  similarity_improvement?: number;
  improvement_estimation?: Record<string, unknown>;
  changes_summary?: Record<string, unknown>;
  processing_time?: number;
};

export type AdvancedDuplicateResponse = {
  duplicate_check: DuplicateCheckBlock;
  modification_proposal?: ModificationProposal;
};

export async function checkDuplicateAdvanced(
  body: AdvancedDuplicatePayload,
  params?: AdvancedDuplicateParams,
) {
  const { data } = await aiAPI.post<AdvancedDuplicateResponse>(
    "/api/v1/topics/check-duplicate-advanced",
    body,
    { params },
  );
  return data;
}
