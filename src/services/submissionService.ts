import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type IdLike = number | string;

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

const getAxiosMessage = (e: unknown, fallback: string) =>
  axios.isAxiosError(e) ? e.response?.data?.message || fallback : fallback;

export interface SubmissionDTO {
  id: IdLike;
  topicId?: IdLike;
  topicVersionId?: IdLike;
  phaseId?: IdLike;
  documentUrl?: string | null;
  additionalNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: string | null; 
}

export interface CreateSubmissionDTO {
  topicVersionId: IdLike;
  phaseId: IdLike;
  documentUrl?: string;
  additionalNotes?: string;
}

export interface UpdateSubmissionDTO {
  id: IdLike;
  phaseId?: IdLike;
  documentUrl?: string;
  additionalNotes?: string;
}

export interface SubmitSubmissionDTO {
  id: IdLike;
}

export interface ResubmitSubmissionDTO {
  id: IdLike;
  documentUrl?: string;
  additionalNotes?: string;
}

export interface GetSubmissionsQueryDTO {
  pageNumber?: number;
  pageSize?: number;
  topicVersionId?: IdLike;
  phaseId?: IdLike;
  semesterId?: IdLike;
  status?: string;
}

function normalizeList<T = any>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload.listObjects)) return payload.listObjects as T[];
  if (Array.isArray(payload.items)) return payload.items as T[];
  if (Array.isArray(payload.data)) return payload.data as T[];
  return [];
}

/** POST /api/submission/create */
export async function createSubmission(payload: CreateSubmissionDTO): Promise<SubmissionDTO> {
  try {
    const res = await capBotAPI.post<ApiResponse<SubmissionDTO>>(`/submission/create`, payload);
    if (!res.data.success) throw new Error(res.data.message || "Tạo submission thất bại");
    toast.success("Đã tạo submission");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Tạo submission thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}

/** PUT /api/submission/update */
export async function updateSubmission(payload: UpdateSubmissionDTO): Promise<SubmissionDTO> {
  try {
    const res = await capBotAPI.put<ApiResponse<SubmissionDTO>>(`/submission/update`, payload);
    if (!res.data.success) throw new Error(res.data.message || "Cập nhật submission thất bại");
    toast.success("Đã cập nhật submission");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Cập nhật submission thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}

/** POST /api/submission/submit */
export async function submitSubmission(payload: SubmitSubmissionDTO): Promise<SubmissionDTO> {
  try {
    const res = await capBotAPI.post<ApiResponse<SubmissionDTO>>(`/submission/submit`, payload);
    if (!res.data.success) throw new Error(res.data.message || "Submit submission thất bại");
    toast.success("Đã submit submission");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Submit submission thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}

/** POST /api/submission/resubmit */
export async function resubmitSubmission(payload: ResubmitSubmissionDTO): Promise<SubmissionDTO> {
  try {
    const res = await capBotAPI.post<ApiResponse<SubmissionDTO>>(`/submission/resubmit`, payload);
    if (!res.data.success) throw new Error(res.data.message || "Resubmit submission thất bại");
    toast.success("Đã resubmit submission");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Resubmit submission thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}

/** GET /api/submission/detail/{id} */
export async function getSubmissionDetail(id: IdLike): Promise<SubmissionDTO> {
  try {
    const sid = encodeURIComponent(String(id));
    const res = await capBotAPI.get<ApiResponse<SubmissionDTO>>(`/submission/detail/${sid}`);
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được chi tiết submission");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được chi tiết submission");
    throw new Error(msg);
  }
}

/** GET /api/submission/list */
export async function listSubmissions(
  query: GetSubmissionsQueryDTO
): Promise<{ items: SubmissionDTO[]; raw: any }> {
  try {
    const res = await capBotAPI.get<ApiResponse<any>>(`/submission/list`, { params: query });
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được danh sách submission");
    const items = normalizeList<SubmissionDTO>(res.data.data);
    return { items, raw: res.data.data };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được danh sách submission");
    throw new Error(msg);
  }
}

/* Ensure submission theo topicVersion */
export async function ensureSubmissionFromTopicVersion(payload: CreateSubmissionDTO): Promise<SubmissionDTO> {
  const { topicVersionId, phaseId, documentUrl, additionalNotes } = payload;
  // 1) Thử tìm submission đã có 
  const { items } = await listSubmissions({
    topicVersionId,
    phaseId,
    pageNumber: 1,
    pageSize: 1,
  });

  if (items.length > 0) {
    return items[0];
  }

  // 2) Nếu truyền phaseId mà chưa có, có thể fallback tìm submission bất kỳ theo topicVersion
  if (phaseId != null) {
    const tryAny = await listSubmissions({
      topicVersionId,
      pageNumber: 1,
      pageSize: 1,
    });
    if (tryAny.items.length > 0) {
      return tryAny.items[0];
    }
  }

  // 3) Không có -> tạo mới
  return await createSubmission({ topicVersionId, phaseId, documentUrl, additionalNotes });
}
