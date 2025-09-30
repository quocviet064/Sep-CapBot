type AnyObj = Record<string, unknown>;

export function toNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function normalizeSimilarTopic(item: AnyObj) {
  return {
    id: String(item.id ?? ""),
    topicId: toNumberOrNull(item.topicId) ?? toNumberOrNull(item.topic_id) ?? 0,
    versionId:
      toNumberOrNull(item.versionId) ?? toNumberOrNull(item.version_id),
    versionNumber:
      toNumberOrNull(item.versionNumber) ?? toNumberOrNull(item.version_number),
    submissionId:
      toNumberOrNull(item.submissionId) ??
      toNumberOrNull(item.submission_id) ??
      null,
    eN_Title: (item.eN_Title as string | null) ?? null,
    vN_title: (item.vN_title as string | null) ?? null,
    problem: (item.problem as string | null) ?? null,
    context: (item.context as string | null) ?? null,
    content: (item.content as string | null) ?? null,
    description: (item.description as string | null) ?? null,
    objectives: (item.objectives as string | null) ?? null,

    categoryId:
      toNumberOrNull(item.categoryId) ?? toNumberOrNull(item.category_id),
    semesterId:
      toNumberOrNull(item.semesterId) ?? toNumberOrNull(item.semester_id),
    supervisorId:
      toNumberOrNull(item.supervisorId) ?? toNumberOrNull(item.supervisor_id),

    documentUrl: (item.documentUrl as string | null) ?? null,
    status: (item.status as string | null) ?? null,
    source: (item.source as string | null) ?? null,
    createdAt: (item.createdAt as string | null) ?? null,
    similarity_score: Number(item.similarity_score ?? 0),
  };
}

export function normalizeModifiedTopic(mt: AnyObj | undefined) {
  const t = mt ?? {};
  return {
    title: (t.title as string | undefined) ?? undefined,
    description: (t.description as string | undefined) ?? undefined,
    objectives: (t.objectives as string | undefined) ?? undefined,
    problem: (t.problem as string | undefined) ?? undefined,
    context: (t.context as string | undefined) ?? undefined,
    content: (t.content as string | undefined) ?? undefined,

    categoryId:
      toNumberOrNull(t.categoryId) ??
      toNumberOrNull(t.category_id) ??
      undefined,
    supervisorId:
      toNumberOrNull(t.supervisorId) ??
      toNumberOrNull(t.supervisor_id) ??
      undefined,
    semesterId:
      toNumberOrNull(t.semesterId) ??
      toNumberOrNull(t.semester_id) ??
      undefined,
    maxStudents:
      toNumberOrNull(t.maxStudents) ??
      toNumberOrNull(t.max_students) ??
      undefined,
  };
}

export function normalizeDuplicateResponse(raw: AnyObj) {
  const dc = raw.duplicate_check as AnyObj;

  const similarRaw = Array.isArray(dc.similar_topics)
    ? (dc.similar_topics as AnyObj[])
    : [];

  const normalizedSimilar = similarRaw.map(normalizeSimilarTopic);

  const mp = (raw.modification_proposal as AnyObj | undefined) ?? undefined;

  const normalizedMp =
    mp === undefined
      ? undefined
      : {
          modified_topic: normalizeModifiedTopic(
            (mp.modified_topic as AnyObj) ?? {},
          ),
          modifications_made: Array.isArray(mp.modifications_made)
            ? (mp.modifications_made as string[])
            : undefined,
          rationale:
            (mp.rationale as string | undefined) ??
            (mp.reason as string | undefined),
          similarity_improvement: Number(
            (mp.similarity_improvement as number | undefined) ?? 0,
          ),
          improvement_estimation: (mp.improvement_estimation ?? {}) as Record<
            string,
            unknown
          >,
          changes_summary: (mp.changes_summary ?? {}) as Record<
            string,
            unknown
          >,
          processing_time: Number(
            (mp.processing_time as number | undefined) ?? 0,
          ),
        };

  return {
    duplicate_check: {
      status: String(dc.status ?? "no_duplicate") as
        | "duplicate_found"
        | "potential_duplicate"
        | "no_duplicate",
      similarity_score: Number(dc.similarity_score ?? 0),
      similar_topics: normalizedSimilar,
      threshold: Number(dc.threshold ?? 0),
      message: (dc.message as string | undefined) ?? undefined,
      recommendations: Array.isArray(dc.recommendations)
        ? (dc.recommendations as string[])
        : undefined,
      processing_time: Number((dc.processing_time as number | undefined) ?? 0),
    },
    modification_proposal: normalizedMp,
  };
}
