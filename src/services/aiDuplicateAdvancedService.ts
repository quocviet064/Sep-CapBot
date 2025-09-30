import aiAPI from "@/lib/AiApi";
import { normalizeDuplicateResponse } from "@/utils/normalizeAi";

export type AdvancedDuplicateParams = {
  threshold?: number;
  semester_id?: number | null;
  last_n_semesters?: number;
};

export type AdvancedDuplicatePayload = {
  eN_Title: string;

  vN_title: string;

  title?: string;
  abbreviation?: string;
  problem: string;
  context: string;
  content: string;
  description: string;
  objectives: string;

  categoryId?: number;
  semesterId?: number;
  maxStudents?: number;
  fileId?: number | null;
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
    eN_Title?: string;
    vN_title?: string;
    abbreviation?: string;
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
    categoryId?: number;
    supervisorId?: number;
    semesterId?: number;
    maxStudents?: number;
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
): Promise<AdvancedDuplicateResponse> {
  const { title, vN_title, ...rest } = body;
  const payloadForApi = {
    ...rest,
    eN_Title: body.eN_Title,
    vN_title: vN_title,
    title: title ?? vN_title,
  };

  const { data } = await aiAPI.post(
    "/api/v1/topics/check-duplicate-advanced",
    payloadForApi,
    { params },
  );

  return normalizeDuplicateResponse(data) as AdvancedDuplicateResponse;
}
