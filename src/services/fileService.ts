import capBotAPI from "@/lib/CapBotApi";

type UploadImageFlat = { url?: string; message?: string };
type UploadImageNested = { data?: string | { url?: string } };
type UploadImageResponse = string | (UploadImageFlat & UploadImageNested);

type UploadFileFlat = { fileId?: number; id?: number };
type UploadFileNested = { data?: number | { fileId?: number; id?: number } };
type UploadFileEnvelope = {
  statusCode?: string | number;
  success?: boolean;
  data?: unknown;
  errors?: unknown;
  message?: string;
};
type UploadFileResponse =
  | number
  | UploadFileFlat
  | UploadFileNested
  | UploadFileEnvelope;

const HTTP_RE = /^https?:\/\//i;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickUrl(data: UploadImageResponse): string {
  if (typeof data === "string" && HTTP_RE.test(data)) return data;
  if (isRecord(data)) {
    const flatUrl = (data as { url?: unknown }).url;
    if (typeof flatUrl === "string" && HTTP_RE.test(flatUrl)) return flatUrl;
    const nested = (data as { data?: unknown }).data;
    if (typeof nested === "string" && HTTP_RE.test(nested)) return nested;
    if (isRecord(nested)) {
      const nestedUrl = (nested as { url?: unknown }).url;
      if (typeof nestedUrl === "string" && HTTP_RE.test(nestedUrl))
        return nestedUrl;
    }
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && HTTP_RE.test(msg)) return msg;
  }
  throw new Error("Không nhận được URL từ máy chủ khi upload ảnh.");
}

function pickNumericId(data: UploadFileResponse): number {
  if (typeof data === "number") return data;
  if (isRecord(data)) {
    const flatFileId = (data as { fileId?: unknown }).fileId;
    if (typeof flatFileId === "number") return flatFileId;
    const flatId = (data as { id?: unknown }).id;
    if (typeof flatId === "number") return flatId;

    const nested = (data as { data?: unknown }).data;
    if (typeof nested === "number") return nested;
    if (isRecord(nested)) {
      const nFileId = (nested as { fileId?: unknown }).fileId;
      if (typeof nFileId === "number") return nFileId;
      const nId = (nested as { id?: unknown }).id;
      if (typeof nId === "number") return nId;
    }

    const envData = (data as UploadFileEnvelope).data;
    if (typeof envData === "number") return envData as number;
    if (isRecord(envData)) {
      const eFileId = (envData as { fileId?: unknown }).fileId;
      if (typeof eFileId === "number") return eFileId;
      const eId = (envData as { id?: unknown }).id;
      if (typeof eId === "number") return eId;
    }
  }
  throw new Error("Không nhận được fileId từ máy chủ khi upload tệp.");
}

export async function uploadImageReturnUrl(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await capBotAPI.post<UploadImageResponse>(
    "/File/upload-image",
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: false,
    },
  );
  return pickUrl(res.data);
}

export async function uploadFileReturnId(file: File): Promise<number> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await capBotAPI.post<UploadFileResponse>("/File/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: false,
  });
  return pickNumericId(res.data);
}

export const uploadFileToUrl = uploadImageReturnUrl;
