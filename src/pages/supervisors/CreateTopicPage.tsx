// import { useEffect, useMemo, useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Badge } from "@/components/globals/atoms/badge";
// import { Button } from "@/components/globals/atoms/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/globals/atoms/dropdown-menu";
// import {
//   ChevronDown,
//   BookOpen,
//   CheckCircle2,
//   Loader2,
//   Search,
//   Upload,
//   FileText,
//   X,
//   Asterisk,
// } from "lucide-react";
// import { useCreateTopic } from "@/hooks/useTopic";
// import type { CreateTopicPayload } from "@/services/topicService";
// import type { CategoryType } from "@/schemas/categorySchema";
// import type { SemesterDTO } from "@/services/semesterService";
// import { useCategories } from "@/hooks/useCategory";
// import { useSemesters } from "@/hooks/useSemester";
// import { uploadFileReturnId } from "@/services/fileService";
// import { useCheckDuplicateAdvanced } from "@/hooks/useAiDuplicateAdvanced";
// import {
//   fileToDataURL,
//   storeFileTemp,
//   loadStoredFile,
//   storedToFile,
// } from "@/utils/fileTransfer";

// const DRAFT_KEY = "createTopicDraft:v1";

// function RequiredBadge() {
//   return (
//     <Badge
//       className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-0.5 py-0 text-[7px] leading-tight font-medium text-rose-700 shadow-sm"
//       title="Trường bắt buộc"
//       aria-label="Trường bắt buộc"
//     >
//       <Asterisk className="h-2.5 w-2.5" />
//       Bắt buộc
//     </Badge>
//   );
// }

// function SectionCard({
//   title,
//   desc,
//   children,
//   icon,
// }: {
//   title: string;
//   desc?: string;
//   children: React.ReactNode;
//   icon?: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-2xl border bg-white/70 p-4 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm">
//       <div className="mb-3 flex items-start gap-3">
//         <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900/90 text-white shadow-sm">
//           {icon ?? <BookOpen className="h-4 w-4" />}
//         </div>
//         <div>
//           <h3 className="text-base font-semibold">{title}</h3>
//           {desc ? (
//             <p className="text-muted-foreground text-xs">{desc}</p>
//           ) : null}
//         </div>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({
//   label,
//   required,
//   hint,
//   error,
//   children,
// }: {
//   label: string;
//   required?: boolean;
//   hint?: string;
//   error?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="space-y-1.5">
//       <div className="flex items-center justify-between gap-2">
//         <div className="flex items-center gap-2">
//           <label className="text-sm font-medium">{label}</label>
//           {required ? <RequiredBadge /> : null}
//         </div>
//         {hint ? (
//           <span className="text-muted-foreground text-xs">{hint}</span>
//         ) : null}
//       </div>
//       {children}
//       {error ? (
//         <p className="text-xs font-medium text-red-600">{error}</p>
//       ) : null}
//     </div>
//   );
// }

// function formatBytes(b: number) {
//   if (b === 0) return "0 B";
//   const k = 1024;
//   const i = Math.floor(Math.log(b) / Math.log(k));
//   const sizes = ["B", "KB", "MB", "GB", "TB"];
//   return `${parseFloat((b / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
// }

// type IncomingSnapshot = Partial<{
//   eN_Title: string;
//   vN_title: string;
//   abbreviation: string;
//   problem: string;
//   context: string;
//   content: string;
//   description: string;
//   objectives: string;
//   categoryId: number;
//   semesterId: number;
//   maxStudents: number;
//   categoryName?: string;
//   semesterName?: string;
//   fileToken?: string | null;

//   /** Cờ được set khi bấm "Sử dụng gợi ý" ở trang kết quả AI */
//   __fromSuggestion?: boolean;
// }>;

// export default function CreateTopicPage() {
//   const navigate = useNavigate();
//   const { state } = useLocation() as {
//     state?: { formSnapshot?: IncomingSnapshot | null };
//   };

//   const { mutateAsync: createTopic, isPending } = useCreateTopic();
//   const dupAdv = useCheckDuplicateAdvanced();

//   const {
//     data: categories = [],
//     isLoading: catLoading,
//     error: catError,
//   } = useCategories();
//   const {
//     data: semesters = [],
//     isLoading: semLoading,
//     error: semError,
//   } = useSemesters();

//   const [catQuery, setCatQuery] = useState("");
//   const [semQuery, setSemQuery] = useState("");

//   const filteredCategories = useMemo(() => {
//     const q = catQuery.trim().toLowerCase();
//     if (!q) return categories as CategoryType[];
//     return (categories as CategoryType[]).filter((c) =>
//       c.name.toLowerCase().includes(q),
//     );
//   }, [catQuery, categories]);

//   const filteredSemesters = useMemo(() => {
//     const q = semQuery.trim().toLowerCase();
//     if (!q) return semesters as SemesterDTO[];
//     return (semesters as SemesterDTO[]).filter((s) =>
//       s.name.toLowerCase().includes(q),
//     );
//   }, [semQuery, semesters]);

//   const [form, setForm] = useState<{
//     eN_Title: string;
//     vN_title: string;
//     abbreviation: string;
//     problem: string;
//     context: string;
//     content: string;
//     description: string;
//     objectives: string;
//     categoryId: number;
//     semesterId: number;
//     maxStudents: number;
//   }>(() => ({
//     eN_Title: "",
//     vN_title: "",
//     abbreviation: "",
//     problem: "",
//     context: "",
//     content: "",
//     description: "",
//     objectives: "",
//     categoryId: 0,
//     semesterId: 0,
//     maxStudents: 5,
//   }));

//   const [docFiles, setDocFiles] = useState<File[]>([]);
//   const [fileError, setFileError] = useState<string | undefined>(undefined);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Nhớ kiểu điều hướng để phân biệt back/forward
//   const navTypeRef = useRef<"back" | "navigate" | "reload">("navigate");

//   // CHỈ restore draft khi là back/forward
//   useEffect(() => {
//     try {
//       const nav = performance.getEntriesByType("navigation")?.[0] as any;
//       const isBackForward =
//         nav?.type === "back_forward" ||
//         (window.performance as any)?.navigation?.type === 2;
//       navTypeRef.current = isBackForward
//         ? "back"
//         : nav?.type === "reload"
//           ? "reload"
//           : "navigate";

//       if (isBackForward) {
//         const raw = sessionStorage.getItem(DRAFT_KEY);
//         if (raw) {
//           const draft = JSON.parse(raw);
//           setForm((prev) => ({ ...prev, ...draft }));
//         }
//       }
//     } catch {}
//   }, []);

//   // Áp snapshot từ trang Duplicate Result
//   useEffect(() => {
//     const snap = state?.formSnapshot;
//     if (!snap) return;

//     // Nếu là quay lại và KHÔNG phải "Sử dụng gợi ý" -> giữ draft, bỏ qua snapshot
//     if (navTypeRef.current === "back" && !snap.__fromSuggestion) {
//       return;
//     }

//     const resolveCategoryId = () => {
//       if (snap.categoryId && snap.categoryId > 0)
//         return Number(snap.categoryId);
//       if (snap.categoryName) {
//         const found = (categories as CategoryType[]).find(
//           (c) =>
//             c.name.toLowerCase().trim() ===
//             snap.categoryName!.toLowerCase().trim(),
//         );
//         return found?.id ?? 0;
//       }
//       return 0;
//     };
//     const resolveSemesterId = () => {
//       if (snap.semesterId && snap.semesterId > 0)
//         return Number(snap.semesterId);
//       if (snap.semesterName) {
//         const found = (semesters as SemesterDTO[]).find(
//           (s) =>
//             s.name.toLowerCase().trim() ===
//             snap.semesterName!.toLowerCase().trim(),
//         );
//         return found?.id ?? 0;
//       }
//       return 0;
//     };

//     const categoryId = resolveCategoryId();
//     const semesterId = resolveSemesterId();

//     const nextBySnapshot = {
//       eN_Title: String(snap.eN_Title ?? ""),
//       vN_title: String(snap.vN_title ?? ""),
//       abbreviation: String(snap.abbreviation ?? ""),
//       problem: String(snap.problem ?? ""),
//       context: String(snap.context ?? ""),
//       content: String(snap.content ?? ""),
//       description: String(snap.description ?? ""),
//       objectives: String(snap.objectives ?? ""),
//       categoryId,
//       semesterId,
//       maxStudents: Number(snap.maxStudents ?? 5),
//     };

//     // Khôi phục file từ token (nếu có)
//     (async () => {
//       try {
//         if (!snap.fileToken) return;
//         const stored = loadStoredFile(snap.fileToken);
//         if (!stored) return;
//         const f = await storedToFile(stored);
//         setDocFiles([f]);
//       } catch {}
//     })();

//     if (snap.__fromSuggestion) {
//       // Chỉ khi chọn "Sử dụng gợi ý": áp hoàn toàn & xoá draft
//       setForm(nextBySnapshot);
//       try {
//         sessionStorage.removeItem(DRAFT_KEY);
//       } catch {}
//     } else {
//       // Điều hướng thường có kèm snapshot (không phải back): không đè draft
//       // Nếu muốn merge nhẹ, có thể bật đoạn dưới:
//       // setForm((prev) => ({
//       //   eN_Title: nextBySnapshot.eN_Title || prev.eN_Title,
//       //   vN_title: nextBySnapshot.vN_title || prev.vN_title,
//       //   abbreviation: nextBySnapshot.abbreviation || prev.abbreviation,
//       //   problem: nextBySnapshot.problem || prev.problem,
//       //   context: nextBySnapshot.context || prev.context,
//       //   content: nextBySnapshot.content || prev.content,
//       //   description: nextBySnapshot.description || prev.description,
//       //   objectives: nextBySnapshot.objectives || prev.objectives,
//       //   categoryId: nextBySnapshot.categoryId || prev.categoryId,
//       //   semesterId: nextBySnapshot.semesterId || prev.semesterId,
//       //   maxStudents: nextBySnapshot.maxStudents || prev.maxStudents,
//       // }));
//     }
//   }, [state?.formSnapshot, categories, semesters]);

//   // Auto-save draft (để khi back vẫn còn)
//   useEffect(() => {
//     try {
//       sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
//     } catch {}
//   }, [form]);

//   const update = <K extends keyof typeof form>(
//     key: K,
//     value: (typeof form)[K],
//   ) => setForm((prev) => ({ ...prev, [key]: value }));

//   const selectedCategoryName =
//     (form.categoryId &&
//       (categories as CategoryType[]).find((c) => c.id === form.categoryId)
//         ?.name) ||
//     "Danh mục";
//   const selectedSemesterName =
//     (form.semesterId &&
//       (semesters as SemesterDTO[]).find((s) => s.id === form.semesterId)
//         ?.name) ||
//     "Kỳ học";

//   const requiredKeys: (keyof typeof form)[] = [
//     "eN_Title",
//     "vN_title",
//     "abbreviation",
//     "problem",
//     "context",
//     "content",
//     "description",
//     "objectives",
//     "categoryId",
//     "semesterId",
//     "maxStudents",
//   ];
//   const completeCount = requiredKeys.filter((k) =>
//     typeof form[k] === "number"
//       ? Number(form[k]) > 0
//       : String(form[k]).trim().length > 0,
//   ).length;
//   const progress = Math.round((completeCount / requiredKeys.length) * 100);

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.eN_Title?.trim()) e.eN_Title = "Vui lòng nhập EN Title";
//     if (!form.vN_title?.trim()) e.vN_title = "Vui lòng nhập VN Title";
//     if (!form.abbreviation?.trim()) e.abbreviation = "Vui lòng nhập viết tắt";
//     if (!form.problem?.trim()) e.problem = "Vui lòng mô tả problem";
//     if (!form.context?.trim()) e.context = "Vui lòng mô tả context";
//     if (!form.content?.trim()) e.content = "Vui lòng nhập content";
//     if (!form.description?.trim()) e.description = "Vui lòng nhập mô tả";
//     if (!form.objectives?.trim()) e.objectives = "Vui lòng nhập objectives";
//     if (!form.categoryId) e.categoryId = "Vui lòng chọn danh mục";
//     if (!form.semesterId) e.semesterId = "Vui lòng chọn kỳ học";
//     if (!form.maxStudents || Number(form.maxStudents) <= 0)
//       e.maxStudents = "SV tối đa phải > 0";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const validateFile = (f: File) => {
//     const allowed = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];
//     const okType =
//       allowed.includes(f.type) ||
//       [".pdf", ".doc", ".docx"].some((ext) =>
//         f.name.toLowerCase().endsWith(ext),
//       );
//     if (!okType) return "Chỉ chấp nhận PDF, DOC, DOCX";
//     if (f.size > 20 * 1024 * 1024) return "Kích thước tối đa 20MB";
//     return "";
//   };

//   const pickFile = () => fileInputRef.current?.click();

//   const onFiles = (list: FileList | null) => {
//     if (!list) return;
//     const incoming = Array.from(list).slice(0, 1);
//     const f = incoming[0];
//     if (!f) return;
//     const err = validateFile(f);
//     if (err) {
//       setFileError(err);
//       toast.error(err);
//       return;
//     }
//     setDocFiles([f]);
//     setFileError(undefined);
//   };

//   const removeFile = () => {
//     setDocFiles([]);
//     setFileError(undefined);
//   };

//   const clearDraft = () => {
//     try {
//       sessionStorage.removeItem(DRAFT_KEY);
//     } catch {}
//   };

//   const resetForm = () => {
//     setForm({
//       eN_Title: "",
//       vN_title: "",
//       abbreviation: "",
//       problem: "",
//       context: "",
//       content: "",
//       description: "",
//       objectives: "",
//       categoryId: 0,
//       semesterId: 0,
//       maxStudents: 5,
//     });
//     setDocFiles([]);
//     setFileError(undefined);
//     setErrors({});
//     clearDraft();
//   };

//   const onSubmit = async () => {
//     console.groupCollapsed(
//       "%c[CreateTopic] Pre-submit",
//       "color:#0f172a;background:#bfdbfe;padding:2px 6px;border-radius:6px;",
//     );
//     console.log("Raw form before validate:", JSON.parse(JSON.stringify(form)));
//     console.groupEnd();

//     if (!validate()) {
//       toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
//       return;
//     }

//     let fileId: number | null = null;

//     if (docFiles.length > 0) {
//       const toastId = toast.loading("Đang upload tài liệu...");
//       try {
//         const id = await uploadFileReturnId(docFiles[0]);
//         toast.success("Upload thành công", { id: toastId });
//         fileId = id;
//       } catch {
//         toast.error("Upload thất bại", { id: toastId });
//         return;
//       }
//     } else {
//       console.log("[CreateTopic] Không chọn file. Sẽ gửi fileId = null.");
//     }

//     const payload: CreateTopicPayload = {
//       eN_Title: form.eN_Title.trim(),
//       abbreviation: form.abbreviation.trim(),
//       vN_title: form.vN_title.trim(),
//       problem: form.problem.trim(),
//       context: form.context.trim(),
//       content: form.content.trim(),
//       description: form.description.trim(),
//       objectives: form.objectives.trim(),
//       categoryId: Number(form.categoryId),
//       semesterId: Number(form.semesterId),
//       maxStudents: Number(form.maxStudents),
//       fileId,
//     };

//     const cat = (categories as CategoryType[]).find(
//       (c) => c.id === form.categoryId,
//     );
//     const sem = (semesters as SemesterDTO[]).find(
//       (s) => s.id === form.semesterId,
//     );
//     console.groupCollapsed(
//       "%c[CreateTopic] Submit debug",
//       "color:#111;background:#E5E7EB;padding:2px_6px;border-radius:6px;",
//     );
//     console.log("Form state:", JSON.parse(JSON.stringify(form)));
//     console.log("Category ↔ Name:", { id: form.categoryId, name: cat?.name });
//     console.log("Semester ↔ Name:", { id: form.semesterId, name: sem?.name });
//     if (docFiles.length) {
//       const f = docFiles[0];
//       console.log("Selected file:", {
//         name: f.name,
//         type: f.type,
//         size: f.size,
//       });
//     } else {
//       console.log("Selected file: <none>");
//     }
//     console.log("fileId (after upload):", fileId);
//     console.log("Final payload (POST /api/topic/create):", payload);
//     console.groupEnd();

//     try {
//       await toast.promise(
//         createTopic(payload as unknown as CreateTopicPayload),
//         {
//           loading: "Đang tạo đề tài...",
//           success: "Tạo đề tài thành công!",
//           error: "Tạo đề tài thất bại",
//         },
//       );

//       clearDraft();
//       resetForm();
//     } catch {
//       toast.error("Tạo đề tài thất bại");
//     }
//   };

//   const onCheckDuplicate = async () => {
//     if (!validate()) {
//       toast.error("Vui lòng điền đầy đủ thông tin trước khi kiểm tra");
//       return;
//     }

//     let fileToken: string | null = null;
//     if (docFiles.length > 0) {
//       const f = docFiles[0];
//       const dataUrl = await fileToDataURL(f);
//       fileToken = storeFileTemp({
//         name: f.name,
//         type: f.type || "application/octet-stream",
//         size: f.size,
//         dataUrl,
//       });
//     }

//     const body = {
//       eN_Title: form.eN_Title.trim(),
//       abbreviation: form.abbreviation.trim(),
//       vN_title: form.vN_title.trim(),
//       problem: form.problem.trim(),
//       context: form.context.trim(),
//       content: form.content.trim(),
//       description: form.description.trim(),
//       objectives: form.objectives.trim(),
//       semesterId: Number(form.semesterId) || undefined,
//     };

//     try {
//       const res = await dupAdv.mutateAsync({
//         body,
//         params: {
//           threshold: 0.8,
//           last_n_semesters: 3,
//           semester_id: form.semesterId || null,
//         },
//       });
//       navigate("/supervisors/ai-check-duplicate", {
//         state: {
//           result: res,
//           formSnapshot: {
//             ...form,
//             categoryName: selectedCategoryName,
//             semesterName: selectedSemesterName,
//             fileToken,
//           },
//         },
//         replace: false,
//       });
//     } catch (e: any) {
//       toast.error(e?.message || "Lỗi kiểm tra trùng lặp");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
//         <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
//         <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
//         <div className="relative z-10 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
//               <BookOpen className="h-5 w-5" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold">Tạo đề tài mới</h2>
//               <p className="text-xs text-white/70">
//                 Nhập thông tin theo đúng mẫu API
//               </p>
//             </div>
//           </div>
//           <div className="w-48">
//             <div className="mb-1 flex items-center justify-between text-[11px]">
//               <span>Tiến độ</span>
//               <span className="font-semibold">{progress}%</span>
//             </div>
//             <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
//               <div
//                 className="h-full rounded-full bg-white"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
//         <div className="space-y-4 xl:col-span-2">
//           <SectionCard
//             title="Thông tin bắt buộc"
//             desc="Nhập toàn bộ nội dung thông tin"
//             icon={<CheckCircle2 className="h-4 w-4" />}
//           >
//             <div
//               className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${isPending ? "pointer-events-none opacity-70" : ""}`}
//             >
//               <Field label="EN Title" required error={errors.eN_Title}>
//                 <input
//                   type="text"
//                   className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="English title"
//                   value={form.eN_Title}
//                   onChange={(e) => update("eN_Title", e.target.value)}
//                 />
//               </Field>
//               <Field label="VN Title" required error={errors.vN_title}>
//                 <input
//                   type="text"
//                   className="w-full rounded-xl border px-3 py-2 text-sm ring-0 transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Tiêu đề tiếng Việt"
//                   value={form.vN_title}
//                   onChange={(e) => update("vN_title", e.target.value)}
//                 />
//               </Field>
//               <Field label="Viết tắt" required error={errors.abbreviation}>
//                 <input
//                   type="text"
//                   className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Abbreviation"
//                   value={form.abbreviation}
//                   onChange={(e) => update("abbreviation", e.target.value)}
//                 />
//               </Field>
//               <Field label="Vấn đề" required error={errors.problem}>
//                 <input
//                   type="text"
//                   className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Vấn đề cần giải quyết"
//                   value={form.problem}
//                   onChange={(e) => update("problem", e.target.value)}
//                 />
//               </Field>
//               <Field label="Bối cảnh" required error={errors.context}>
//                 <textarea
//                   className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Bối cảnh"
//                   value={form.context}
//                   onChange={(e) => update("context", e.target.value)}
//                 />
//               </Field>
//               <Field label="Nội dung" required error={errors.content}>
//                 <textarea
//                   className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Nội dung chính"
//                   value={form.content}
//                   onChange={(e) => update("content", e.target.value)}
//                 />
//               </Field>
//               <Field label="Mô tả" required error={errors.description}>
//                 <textarea
//                   className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Tóm tắt đề tài"
//                   value={form.description}
//                   onChange={(e) => update("description", e.target.value)}
//                 />
//               </Field>
//               <Field label="Mục tiêu" required error={errors.objectives}>
//                 <textarea
//                   className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   placeholder="Mục tiêu"
//                   value={form.objectives}
//                   onChange={(e) => update("objectives", e.target.value)}
//                 />
//               </Field>
//               <Field label="Danh mục" required error={errors.categoryId}>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="w-full justify-between rounded-xl px-3 py-2 text-sm"
//                       disabled={isPending || catLoading}
//                     >
//                       <span
//                         className={`max-w-[240px] truncate ${form.categoryId ? "" : "text-muted-foreground"}`}
//                       >
//                         {catLoading ? "Đang tải..." : selectedCategoryName}
//                       </span>
//                       <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="start"
//                     className="max-h-80 w-[360px] overflow-hidden rounded-xl p-0"
//                   >
//                     <div className="sticky top-0 z-10 border-b bg-white/90 p-2 backdrop-blur">
//                       <div className="flex items-center rounded-lg border bg-white px-2">
//                         <Search className="h-3.5 w-3.5 opacity-60" />
//                         <input
//                           autoFocus
//                           placeholder="Tìm danh mục..."
//                           className="h-8 w-full bg-transparent px-2 text-xs outline-none"
//                           value={catQuery}
//                           onChange={(e) => setCatQuery(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                     <div className="max-h-64 overflow-auto p-1">
//                       <DropdownMenuLabel className="px-2">
//                         Danh mục
//                       </DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       {(filteredCategories as CategoryType[]).map((c) => (
//                         <DropdownMenuItem
//                           key={c.id}
//                           onClick={() => update("categoryId", c.id)}
//                           className="cursor-pointer text-sm"
//                         >
//                           {c.name}
//                         </DropdownMenuItem>
//                       ))}
//                       {!catLoading && filteredCategories.length === 0 && (
//                         <div className="text-muted-foreground px-3 py-2 text-xs">
//                           Không tìm thấy danh mục phù hợp
//                         </div>
//                       )}
//                     </div>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//                 {catError ? (
//                   <p className="text-xs text-red-600">
//                     {(catError as Error).message}
//                   </p>
//                 ) : null}
//               </Field>
//               <Field label="Kỳ học" required error={errors.semesterId}>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className="w-full justify-between rounded-xl px-3 py-2 text-sm"
//                       disabled={isPending || semLoading}
//                     >
//                       <span
//                         className={`max-w-[240px] truncate ${form.semesterId ? "" : "text-muted-foreground"}`}
//                       >
//                         {semLoading ? "Đang tải..." : selectedSemesterName}
//                       </span>
//                       <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="start"
//                     className="max-h-80 w-[360px] overflow-hidden rounded-xl p-0"
//                   >
//                     <div className="sticky top-0 z-10 border-b bg-white/90 p-2 backdrop-blur">
//                       <div className="flex items-center rounded-lg border bg-white px-2">
//                         <Search className="h-3.5 w-3.5 opacity-60" />
//                         <input
//                           placeholder="Tìm kỳ học..."
//                           className="h-8 w-full bg-transparent px-2 text-xs outline-none"
//                           value={semQuery}
//                           onChange={(e) => setSemQuery(e.target.value)}
//                         />
//                       </div>
//                     </div>
//                     <div className="max-h-64 overflow-auto p-1">
//                       <DropdownMenuLabel className="px-2">
//                         Kỳ học
//                       </DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       {(filteredSemesters as SemesterDTO[]).map((s) => (
//                         <DropdownMenuItem
//                           key={s.id}
//                           onClick={() => update("semesterId", s.id)}
//                           className="cursor-pointer text-sm"
//                         >
//                           {s.name}
//                         </DropdownMenuItem>
//                       ))}
//                       {!semLoading && filteredSemesters.length === 0 && (
//                         <div className="text-muted-foreground px-3 py-2 text-xs">
//                           Không tìm thấy kỳ học phù hợp
//                         </div>
//                       )}
//                     </div>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//                 {semError ? (
//                   <p className="text-xs text-red-600">
//                     {(semError as Error).message}
//                   </p>
//                 ) : null}
//               </Field>
//               <Field label="SV tối đa" required error={errors.maxStudents}>
//                 <input
//                   type="number"
//                   min={1}
//                   className="w-full rounded-xl border px-3 py-2 text-sm transition outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-900/10"
//                   value={form.maxStudents}
//                   onChange={(e) =>
//                     update("maxStudents", Number(e.target.value))
//                   }
//                 />
//               </Field>
//             </div>
//           </SectionCard>

//           <SectionCard title="Tài liệu đính kèm" desc="Upload file">
//             <div
//               className={`grid grid-cols-1 gap-4 ${isPending ? "pointer-events-none opacity-70" : ""}`}
//             >
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between text-sm">
//                   <label className="font-medium">Tài liệu</label>
//                   <span className="text-xs text-neutral-500">
//                     PDF, DOC, DOCX • Tối đa 20MB • 1 tệp
//                   </span>
//                 </div>
//                 <div
//                   className={`group min-height-[90px] relative flex w-full items-start gap-3 rounded-2xl border-2 border-dashed p-3 transition ${
//                     fileError
//                       ? "border-red-300 bg-red-50"
//                       : "border-neutral-200 hover:border-neutral-300"
//                   }`}
//                   onClick={() => pickFile()}
//                   onDragOver={(e) => e.preventDefault()}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     onFiles(e.dataTransfer.files);
//                   }}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200 ring-inset">
//                       <Upload className="h-4 w-4 opacity-70" />
//                     </div>
//                     <div className="flex flex-col">
//                       <span className="text-sm font-medium">
//                         {docFiles.length > 0
//                           ? `Đã chọn 1 tệp`
//                           : "Kéo & thả tệp vào đây"}
//                       </span>
//                       <span className="text-[11px] text-neutral-500">
//                         {docFiles.length > 0
//                           ? "Bấm để thay tệp khác"
//                           : "Hoặc bấm để chọn"}
//                       </span>
//                     </div>
//                   </div>
//                   {docFiles.length > 0 && (
//                     <div className="ml-auto flex max-h-20 max-w-[55%] flex-wrap items-center gap-2 overflow-y-auto">
//                       {docFiles.map((f) => (
//                         <div
//                           key={f.name + f.size}
//                           className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1 text-[12px] shadow-sm"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           <FileText className="h-3.5 w-3.5" />
//                           <span className="max-w-[160px] truncate">
//                             {f.name}
//                           </span>
//                           <span className="text-[10px] text-neutral-500">
//                             {formatBytes(f.size)}
//                           </span>
//                           <button
//                             type="button"
//                             className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-100"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               removeFile();
//                             }}
//                           >
//                             <X className="h-3 w-3" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//                     className="hidden"
//                     onChange={(e) => onFiles(e.target.files)}
//                   />
//                 </div>
//                 {fileError ? (
//                   <p className="text-xs font-medium text-red-600">
//                     {fileError}
//                   </p>
//                 ) : null}
//               </div>
//             </div>
//           </SectionCard>
//         </div>

//         <div className="space-y-4">
//           <SectionCard title="Tóm tắt" desc="Xem nhanh thông tin đã nhập.">
//             <div className="space-y-3 text-sm">
//               <div className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Danh mục</span>
//                   <span className="font-medium">
//                     {form.categoryId ? selectedCategoryName : "—"}
//                   </span>
//                 </div>
//                 <div className="mt-2 flex items-center justify-between">
//                   <span className="text-muted-foreground">Kỳ học</span>
//                   <span className="font-medium">
//                     {form.semesterId ? selectedSemesterName : "—"}
//                   </span>
//                 </div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">SV tối đa</span>
//                   <span className="font-medium">{form.maxStudents || "—"}</span>
//                 </div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">EN Title</span>
//                   <span className="font-medium">{form.eN_Title || "—"}</span>
//                 </div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">VN Title</span>
//                   <span className="font-medium">{form.vN_title || "—"}</span>
//                 </div>
//               </div>
//               <div className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Tài liệu</span>
//                   <span className="font-medium">
//                     {docFiles.length > 0 ? `1 tệp` : "—"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </SectionCard>

//           <SectionCard title="Trạng thái">
//             <div className="flex items-center justify-between rounded-xl border p-3">
//               <div className="text-sm">
//                 <div className="font-medium">Hoàn thiện biểu mẫu</div>
//                 <div className="text-muted-foreground text-xs">
//                   {completeCount}/{requiredKeys.length} trường bắt buộc
//                 </div>
//               </div>
//               <div className="w-24">
//                 <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
//                   <div
//                     className="h-full rounded-full bg-neutral-900"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </SectionCard>
//         </div>
//       </div>

//       <div className="sticky bottom-3 z-30">
//         <div className="mx-auto flex max-w-5xl items-center justify-end gap-2 rounded-2xl border bg-white/70 px-3 py-2 shadow-lg backdrop-blur">
//           <Button
//             variant="outline"
//             onClick={onCheckDuplicate}
//             disabled={dupAdv.isPending || isPending}
//             className="min-w-44"
//           >
//             {dupAdv.isPending ? (
//               <span className="inline-flex items-center gap-2">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Đang kiểm tra…
//               </span>
//             ) : (
//               "Kiểm tra trùng lặp"
//             )}
//           </Button>

//           <Button variant="ghost" onClick={resetForm} disabled={isPending}>
//             Xoá nội dung
//           </Button>
//           <Button onClick={onSubmit} disabled={isPending} className="min-w-36">
//             {isPending ? (
//               <span className="inline-flex items-center gap-2">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Đang tạo...
//               </span>
//             ) : (
//               "Tạo đề tài"
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
