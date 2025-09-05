import capBotAPI from "@/lib/CapBotApi";

type UploadKind = "image" | "file";

const HTTP_RE = /^https?:\/\//i;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function pickUrl(data: unknown): string {
  if (typeof data === "string") return data;

  if (isRecord(data)) {
    const d = data.data;

    if (typeof d === "string") return d;
    if (typeof (data as { url?: unknown }).url === "string")
      return (data as { url: string }).url;

    if (isRecord(d) && typeof (d as { url?: unknown }).url === "string")
      return (d as { url: string }).url;

    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && HTTP_RE.test(msg)) return msg;
  }

  throw new Error("Không nhận được URL từ máy chủ khi upload.");
}

export async function uploadFileToUrl(
  file: File,
  kind: UploadKind = "image",
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const endpoint = kind === "image" ? "/File/upload-image" : "/File/upload";

  const res = await capBotAPI.post<unknown>(endpoint, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return pickUrl((res as { data: unknown }).data);
}
