import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type IdLike = number | string;

type ApiResponse<T> = {
  statusCode: number | string; 
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

type ErrorPayload = { message?: unknown } | string | null;

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
  }
  return fallback;
};

const pickArray = <T>(v: unknown): T[] | null =>
  Array.isArray(v) ? (v as T[]) : null;

const normalizeList = <T>(payload: unknown): T[] => {
  if (!payload) return [];
  const direct = pickArray<T>(payload);
  if (direct) return direct;
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const fromListObjects = pickArray<T>(obj.listObjects);
    if (fromListObjects) return fromListObjects;
    const fromItems = pickArray<T>(obj.items);
    if (fromItems) return fromItems;
    const fromData = pickArray<T>(obj.data);
    if (fromData) return fromData;
  }
  return [];
};

const asNumber = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

const asBoolean = (v: unknown): boolean | undefined =>
  typeof v === "boolean" ? v : undefined;

const asString = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

export interface SubmissionDTO {
  id: IdLike;
  topicId?: IdLike;
  topicVersionId?: IdLike;
  topicTitle?: string;
  phaseId?: IdLike;
  documentUrl?: string | null;
  additionalNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: string | null;
  submittedBy?: IdLike;
  submittedByName?: string;
  submissionRound?: number;
  submittedAt?: string;
}

// Alias tiện dùng với DataTable
export type SubmissionListItem = SubmissionDTO;
export type SubmissionType = SubmissionDTO;

export type RawSubmissionResponse = {
  paging: {
    pageNumber: number;
    pageSize: number;
    keyword: string | null;
    totalRecord: number;
    topicVersionId?: IdLike;
    phaseId?: IdLike;
    semesterId?: IdLike;
    status?: string | null;
  };
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: SubmissionDTO[];
};

export type GetSubmissionsQueryDTO = {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string;
  TotalRecord?: number;
};

export const fetchSubmissions = async (
  TopicVersionId?: number,
  PhaseId?: number,
  SemesterId?: number,
  Status?: string,
  PageNumber: number = 1,
  PageSize: number = 10,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawSubmissionResponse> => {
  try {
    const params: Record<string, unknown> = {
      TopicVersionId,
      PhaseId,
      SemesterId,
      Status,
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    };
    const res = await capBotAPI.get<ApiResponse<unknown>>(`/submission/list`, {
      params,
    });
    if (!res.data.success) {
      throw new Error(res.data.message || "Không lấy được danh sách submission");
    }

    const src = res.data.data as Record<string, unknown> | unknown;
    const items = normalizeList<SubmissionDTO>(src);
    const obj = (typeof src === "object" && src !== null
      ? (src as Record<string, unknown>)
      : {}) as Record<string, unknown>;
    const pagingObj = (typeof obj.paging === "object" && obj.paging !== null
      ? (obj.paging as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const pageNumber = asNumber(pagingObj.pageNumber) ?? PageNumber;
    const pageSize = asNumber(pagingObj.pageSize) ?? PageSize;
    const keyword = asString(pagingObj.keyword) ?? Keyword ?? null;

    const totalRecordFromPaging = asNumber(pagingObj.totalRecord);
    const totalRecordTop = asNumber(obj.totalRecord);
    const totalRecord =
      totalRecordFromPaging ??
      totalRecordTop ??
      (pageNumber === 1 && items.length < pageSize
        ? items.length
        : (TotalRecord ?? 0));

    const totalPagesFromSrc = asNumber(obj.totalPages);
    const totalPages =
      totalPagesFromSrc ??
      (totalRecord > 0 && pageSize > 0
        ? Math.max(1, Math.ceil(totalRecord / pageSize))
        : Math.max(1, pageNumber));

    const hasNextPageFromSrc = asBoolean(obj.hasNextPage);
    const hasPrevPageFromSrc = asBoolean(obj.hasPreviousPage);
    const hasNextPage = hasNextPageFromSrc ?? pageNumber < totalPages;
    const hasPreviousPage = hasPrevPageFromSrc ?? pageNumber > 1;

    return {
      paging: {
        pageNumber,
        pageSize,
        keyword,
        totalRecord: totalRecord ?? 0,
        topicVersionId: TopicVersionId,
        phaseId: PhaseId,
        semesterId: SemesterId,
        status: Status ?? null,
      },
      totalPages,
      hasPreviousPage,
      hasNextPage,
      listObjects: items,
    };
  } catch (e: unknown) {
    const msg = getAxiosMessage(e, "Không lấy được danh sách submission");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchAllSubmissions = async (args: {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  Keyword?: string;
  PageSize?: number;
  MaxPages?: number;
}): Promise<SubmissionType[]> => {
  const result: SubmissionType[] = [];
  const size = args.PageSize ?? 50;
  const maxPages = Math.max(1, args.MaxPages ?? 100);
  for (let page = 1; page <= maxPages; page++) {
    const pageData = await fetchSubmissions(
      args.TopicVersionId,
      args.PhaseId,
      args.SemesterId,
      args.Status,
      page,
      size,
      args.Keyword,
    );
    result.push(...pageData.listObjects);
    if (
      !pageData.hasNextPage ||
      page >= pageData.totalPages ||
      pageData.listObjects.length < size
    ) break;
  }
  return result;
};

export const getSubmissionDetail = async (id: IdLike): Promise<SubmissionDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<SubmissionDTO>>(
      `/submission/detail/${encodeURIComponent(String(id))}`
    );
    if (!res.data.success) {
      throw new Error(res.data.message || "Không lấy được chi tiết submission");
    }
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được chi tiết submission");
    toast.error(msg);
    throw new Error(msg);
  }
};
