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

export type TopicSuggestionsV2Params = {
  semester_id: number;
  category_preference?: string;
  keywords?: string[];
  supervisor_expertise?: string[];
  student_level?: "undergraduate" | "graduate";
  team_size?: 4 | 5;
};

export type TopicSuggestionV2 = {
  eN_Title: string;
  vN_title: string;
  abbreviation?: string;

  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;

  category?: string;
  rationale?: string;
  difficulty_level?: string;
  estimated_duration?: string;
  team_size?: number;
  suggested_roles?: string[];
};

export type TopicSuggestionsV2Response = {
  suggestions: TopicSuggestionV2[];
  trending_areas?: string[];
  generated_at?: string;
  processing_time?: number;
  trending_analysis?: Record<string, unknown>;
};

export async function getTopicSuggestionsV2(
  params: TopicSuggestionsV2Params,
): Promise<TopicSuggestionsV2Response> {
  const entries = Object.entries(params).filter(([, v]) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });
  const cleaned = Object.fromEntries(entries) as TopicSuggestionsV2Params;

  const { data } = await aiAPI.get<TopicSuggestionsV2Response>(
    "/api/v1/topics/suggestions-v2",
    { params: cleaned },
  );
  return data;
}
