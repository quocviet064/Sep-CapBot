import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LectureLayout from "./components/globals/layouts/lecture";

import LoadingPage from "./pages/loading-page";
import NotFoundPage from "./pages/not-found-page";

function App() {
  const Home = lazy(() => import("./pages/home-page"));
  const Login = lazy(() => import("./pages/login-page"));

  // Supervisor pages
  const CreateProject = lazy(
    () => import("./pages/supervisors/create-project"),
  );

  const AllTopics = lazy(
    () => import("./pages/supervisors/topic-management/all"),
  );
  const PendingTopics = lazy(
    () => import("./pages/supervisors/topic-management/pending"),
  );
  const ApprovedTopics = lazy(
    () => import("./pages/supervisors/topic-management/approved"),
  );
  const RejectedTopics = lazy(
    () => import("./pages/supervisors/topic-management/rejected"),
  );
  const AIFlaggedTopics = lazy(
    () => import("./pages/supervisors/topic-management/ai-flagged"),
  );

  const EditAfterFeedback = lazy(
    () => import("./pages/supervisors/needs-action/edit-after-feedback"),
  );
  const RejectedByAI = lazy(
    () => import("./pages/supervisors/needs-action/rejected-by-ai"),
  );
  const DeadlineComing = lazy(
    () => import("./pages/supervisors/needs-action/deadline-coming"),
  );
  const NewFeedback = lazy(
    () => import("./pages/supervisors/needs-action/new-feedback"),
  );

  const AITrack = lazy(
    () => import("./pages/supervisors/approved-library/ai-track"),
  );
  const EnterpriseTrack = lazy(
    () => import("./pages/supervisors/approved-library/enterprise-track"),
  );
  const AcademicTrack = lazy(
    () => import("./pages/supervisors/approved-library/academic-track"),
  );
  const SearchLibrary = lazy(
    () => import("./pages/supervisors/approved-library/search"),
  );

  // Admin pages
  const AdminOverview = lazy(() => import("./pages/admins/dashboard/overview"));
  const AdminStatusAI = lazy(
    () => import("./pages/admins/dashboard/status-ai"),
  );
  const AdminWarningTopics = lazy(
    () => import("./pages/admins/dashboard/warning-topics"),
  );
  const AdminInactiveSupervisors = lazy(
    () => import("./pages/admins/dashboard/inactive-supervisors"),
  );

  const AdminSemesters = lazy(
    () => import("./pages/admins/semester-management/semesters"),
  );
  const AdminPhases = lazy(
    () => import("./pages/admins/semester-management/phases"),
  );
  const AdminPhaseTypes = lazy(
    () => import("./pages/admins/semester-management/phase-types"),
  );
  const AdminSubmissionRounds = lazy(
    () => import("./pages/admins/semester-management/submission-rounds"),
  );

  const AdminAllTopics = lazy(
    () => import("./pages/admins/topics-management/all-topics"),
  );
  const AdminNewSubmitted = lazy(
    () => import("./pages/admins/topics-management/new-submitted"),
  );
  const AdminFlagged = lazy(
    () => import("./pages/admins/topics-management/ai-flagged"),
  );
  const AdminVersions = lazy(
    () => import("./pages/admins/topics-management/versions"),
  );

  const AdminLegacyUpload = lazy(
    () => import("./pages/admins/legacy-import/upload"),
  );
  const AdminMetadata = lazy(
    () => import("./pages/admins/legacy-import/metadata"),
  );
  const AdminMarkApproved = lazy(
    () => import("./pages/admins/legacy-import/mark-approved"),
  );
  const AdminTrainAI = lazy(
    () => import("./pages/admins/legacy-import/ai-train"),
  );

  const AdminCriteriaByPhase = lazy(
    () => import("./pages/admins/evaluation-criteria/by-phase-type"),
  );
  const AdminCriteriaWeights = lazy(
    () => import("./pages/admins/evaluation-criteria/weights"),
  );
  const AdminReviewTemplate = lazy(
    () => import("./pages/admins/evaluation-criteria/review-template"),
  );

  const AdminLecturerList = lazy(
    () => import("./pages/admins/lecturer-management/list"),
  );
  const AdminAssignSkills = lazy(
    () => import("./pages/admins/lecturer-management/assign-skills"),
  );
  const AdminAssignRoles = lazy(
    () => import("./pages/admins/lecturer-management/assign-roles"),
  );
  const AdminDeactivateLecturer = lazy(
    () => import("./pages/admins/lecturer-management/deactivate"),
  );

  const AdminSimilarityThreshold = lazy(
    () => import("./pages/admins/ai-config/similarity-threshold"),
  );
  const AdminScoreThreshold = lazy(
    () => import("./pages/admins/ai-config/score-threshold"),
  );
  const AdminAIResults = lazy(() => import("./pages/admins/ai-config/results"));
  const AdminAITuning = lazy(() => import("./pages/admins/ai-config/tuning"));

  const AdminTopicVisibility = lazy(
    () => import("./pages/admins/access-control/topic-visibility"),
  );
  const AdminAnonymousReview = lazy(
    () => import("./pages/admins/access-control/anonymous-review"),
  );
  const AdminSpecialAccess = lazy(
    () => import("./pages/admins/access-control/special-access"),
  );

  const AdminReportSummary = lazy(
    () => import("./pages/admins/reports/summary"),
  );
  const AdminFeedbackHistory = lazy(
    () => import("./pages/admins/reports/feedback-history"),
  );
  const AdminSupervisorPerformance = lazy(
    () => import("./pages/admins/reports/supervisor-performance"),
  );
  const AdminReportExport = lazy(() => import("./pages/admins/reports/export"));

  const AdminBranding = lazy(
    () => import("./pages/admins/system-settings/branding"),
  );
  const AdminTiming = lazy(
    () => import("./pages/admins/system-settings/timing"),
  );
  const AdminEnvironment = lazy(
    () => import("./pages/admins/system-settings/environment"),
  );

  // Reviewer - Dashboard
  const ReviewerAssignedCount = lazy(
    () => import("./pages/reviewers/dashboard/assigned-count"),
  );
  const ReviewerProgress = lazy(
    () => import("./pages/reviewers/dashboard/progress"),
  );
  const ReviewerFeedbackStatus = lazy(
    () => import("./pages/reviewers/dashboard/feedback-status"),
  );

  // Reviewer - Assigned Topics
  const ReviewerAssignedList = lazy(
    () => import("./pages/reviewers/assigned-topics/list"),
  );
  const ReviewerAssignedDetail = lazy(
    () => import("./pages/reviewers/assigned-topics/detail"),
  );
  const ReviewerInternalNotes = lazy(
    () => import("./pages/reviewers/assigned-topics/internal-notes"),
  );

  // Reviewer - Evaluate Topics
  const ReviewerScore = lazy(
    () => import("./pages/reviewers/evaluate-topics/score"),
  );
  const ReviewerParagraphComments = lazy(
    () => import("./pages/reviewers/evaluate-topics/paragraph-comments"),
  );
  const ReviewerUploadReviewFile = lazy(
    () => import("./pages/reviewers/evaluate-topics/upload-review-file"),
  );

  // Reviewer - Feedback History
  const ReviewerRespondedTopics = lazy(
    () => import("./pages/reviewers/feedback-history/responded-topics"),
  );
  const ReviewerPostReviewTracking = lazy(
    () => import("./pages/reviewers/feedback-history/post-review-tracking"),
  );

  // Reviewer - Topic Archive
  const ReviewerApprovedTopics = lazy(
    () => import("./pages/reviewers/topic-archive/approved-topics"),
  );
  const ReviewerSearchRelated = lazy(
    () => import("./pages/reviewers/topic-archive/search-related"),
  );

  // Reviewer - Evaluation Stats
  const ReviewerCompletedStats = lazy(
    () => import("./pages/reviewers/evaluation-stats/completed"),
  );
  const ReviewerWarningsStats = lazy(
    () => import("./pages/reviewers/evaluation-stats/warnings"),
  );
  const ReviewerAverageScore = lazy(
    () => import("./pages/reviewers/evaluation-stats/average-score"),
  );

  // Moderator pages
  // Dashboard
  const ModDashboard = lazy(() => import("./pages/moderators/dashboard"));

  // Topic Approval
  const ModSupervisorSent = lazy(() => import("./pages/moderators/topic-approval/SupervisorSent"));
  const ModPendingTopics = lazy(() => import("./pages/moderators/topic-approval/PendingTopics"));
  const ModAssignedTopics = lazy(() => import("./pages/moderators/topic-approval/AssignedTopics"));
  const ModRejectedTopics = lazy(() => import("./pages/moderators/topic-approval/RejectedTopics"));
  const ModArchivedTopics = lazy(() => import("./pages/moderators/topic-approval/ArchivedTopics"));

  // Reviewer Assignment
  const ModAssignDrawer = lazy(() => import("./pages/moderators/reviewer-assignment/AssignDrawer"));
  const ModReviewerList = lazy(() => import("./pages/moderators/reviewer-assignment/ReviewerList"));

  // Feedback & Evaluation
  const ModHistoryTimeline = lazy(() => import("./pages/moderators/feedback-evaluation/HistoryTimeline"));
  const ModSuggestions = lazy(() => import("./pages/moderators/feedback-evaluation/Suggestions"));
  const ModApproveNewVersion = lazy(() => import("./pages/moderators/feedback-evaluation/ApproveNewVersion"));

  // Reports
  const ModTopicByPhase = lazy(() => import("./pages/moderators/reports/TopicByPhase"));
  const ModEvaluationStatus = lazy(() => import("./pages/moderators/reports/EvaluationStatus"));
  const ModReviewerPerf = lazy(() => import("./pages/moderators/reports/ReviewerPerformance"));

  // Semester & Phase
  const ModSemesterList = lazy(() => import("./pages/moderators/semester-phase/SemesterList"));
  const ModPhases = lazy(() => import("./pages/moderators/semester-phase/Phases"));
  const ModRounds = lazy(() => import("./pages/moderators/semester-phase/Rounds"));

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route element={<LectureLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Home />} />

          {/* Supervisor routes */}
          <Route path="/create-project" element={<CreateProject />} />

          {/* Quản lý đề tài */}
          <Route path="/supervisors/topics/all" element={<AllTopics />} />
          <Route
            path="/supervisors/topics/pending"
            element={<PendingTopics />}
          />
          <Route
            path="/supervisors/topics/approved"
            element={<ApprovedTopics />}
          />
          <Route
            path="/supervisors/topics/rejected"
            element={<RejectedTopics />}
          />
          <Route
            path="/supervisors/topics/ai-flagged"
            element={<AIFlaggedTopics />}
          />

          {/* Đề tài cần xử lý */}
          <Route
            path="/supervisors/needs-action/edit-after-feedback"
            element={<EditAfterFeedback />}
          />
          <Route
            path="/supervisors/needs-action/rejected-by-ai"
            element={<RejectedByAI />}
          />
          <Route
            path="/supervisors/needs-action/deadline-coming"
            element={<DeadlineComing />}
          />
          <Route
            path="/supervisors/needs-action/new-feedback"
            element={<NewFeedback />}
          />

          {/* Kho đề tài được duyệt */}
          <Route
            path="/supervisors/approved-library/ai"
            element={<AITrack />}
          />
          <Route
            path="/supervisors/approved-library/enterprise"
            element={<EnterpriseTrack />}
          />
          <Route
            path="/supervisors/approved-library/academic"
            element={<AcademicTrack />}
          />
          <Route
            path="/supervisors/approved-library/search"
            element={<SearchLibrary />}
          />

          {/* Admin routes */}
          <Route
            path="/admins/dashboard/overview"
            element={<AdminOverview />}
          />
          <Route
            path="/admins/dashboard/status-ai"
            element={<AdminStatusAI />}
          />
          <Route
            path="/admins/dashboard/warning-topics"
            element={<AdminWarningTopics />}
          />
          <Route
            path="/admins/dashboard/inactive-supervisors"
            element={<AdminInactiveSupervisors />}
          />

          <Route
            path="/admins/semester-management/semesters"
            element={<AdminSemesters />}
          />
          <Route
            path="/admins/semester-management/phases"
            element={<AdminPhases />}
          />
          <Route
            path="/admins/semester-management/phase-types"
            element={<AdminPhaseTypes />}
          />
          <Route
            path="/admins/semester-management/submission-rounds"
            element={<AdminSubmissionRounds />}
          />

          <Route
            path="/admins/topics-management/all-topics"
            element={<AdminAllTopics />}
          />
          <Route
            path="/admins/topics-management/new-submitted"
            element={<AdminNewSubmitted />}
          />
          <Route
            path="/admins/topics-management/ai-flagged"
            element={<AdminFlagged />}
          />
          <Route
            path="/admins/topics-management/versions"
            element={<AdminVersions />}
          />

          <Route
            path="/admins/legacy-import/upload"
            element={<AdminLegacyUpload />}
          />
          <Route
            path="/admins/legacy-import/metadata"
            element={<AdminMetadata />}
          />
          <Route
            path="/admins/legacy-import/mark-approved"
            element={<AdminMarkApproved />}
          />
          <Route
            path="/admins/legacy-import/ai-train"
            element={<AdminTrainAI />}
          />

          <Route
            path="/admins/evaluation-criteria/by-phase-type"
            element={<AdminCriteriaByPhase />}
          />
          <Route
            path="/admins/evaluation-criteria/weights"
            element={<AdminCriteriaWeights />}
          />
          <Route
            path="/admins/evaluation-criteria/review-template"
            element={<AdminReviewTemplate />}
          />

          <Route
            path="/admins/lecturer-management/list"
            element={<AdminLecturerList />}
          />
          <Route
            path="/admins/lecturer-management/assign-skills"
            element={<AdminAssignSkills />}
          />
          <Route
            path="/admins/lecturer-management/assign-roles"
            element={<AdminAssignRoles />}
          />
          <Route
            path="/admins/lecturer-management/deactivate"
            element={<AdminDeactivateLecturer />}
          />

          <Route
            path="/admins/ai-config/similarity-threshold"
            element={<AdminSimilarityThreshold />}
          />
          <Route
            path="/admins/ai-config/score-threshold"
            element={<AdminScoreThreshold />}
          />
          <Route
            path="/admins/ai-config/results"
            element={<AdminAIResults />}
          />
          <Route path="/admins/ai-config/tuning" element={<AdminAITuning />} />

          <Route
            path="/admins/access-control/topic-visibility"
            element={<AdminTopicVisibility />}
          />
          <Route
            path="/admins/access-control/anonymous-review"
            element={<AdminAnonymousReview />}
          />
          <Route
            path="/admins/access-control/special-access"
            element={<AdminSpecialAccess />}
          />

          <Route
            path="/admins/reports/summary"
            element={<AdminReportSummary />}
          />
          <Route
            path="/admins/reports/feedback-history"
            element={<AdminFeedbackHistory />}
          />
          <Route
            path="/admins/reports/supervisor-performance"
            element={<AdminSupervisorPerformance />}
          />
          <Route
            path="/admins/reports/export"
            element={<AdminReportExport />}
          />

          <Route
            path="/admins/system-settings/branding"
            element={<AdminBranding />}
          />
          <Route
            path="/admins/system-settings/timing"
            element={<AdminTiming />}
          />
          <Route
            path="/admins/system-settings/environment"
            element={<AdminEnvironment />}
          />

          {/* Reviewer - Dashboard */}
          <Route
            path="/reviewers/dashboard/assigned-count"
            element={<ReviewerAssignedCount />}
          />
          <Route
            path="/reviewers/dashboard/progress"
            element={<ReviewerProgress />}
          />
          <Route
            path="/reviewers/dashboard/feedback-status"
            element={<ReviewerFeedbackStatus />}
          />

          {/* Reviewer - Assigned Topics */}
          <Route
            path="/reviewers/assigned-topics/list"
            element={<ReviewerAssignedList />}
          />
          <Route
            path="/reviewers/assigned-topics/detail"
            element={<ReviewerAssignedDetail />}
          />
          <Route
            path="/reviewers/assigned-topics/internal-notes"
            element={<ReviewerInternalNotes />}
          />

          {/* Reviewer - Evaluate Topics */}
          <Route
            path="/reviewers/evaluate-topics/score"
            element={<ReviewerScore />}
          />
          <Route
            path="/reviewers/evaluate-topics/paragraph-comments"
            element={<ReviewerParagraphComments />}
          />
          <Route
            path="/reviewers/evaluate-topics/upload-review-file"
            element={<ReviewerUploadReviewFile />}
          />

          {/* Reviewer - Feedback History */}
          <Route
            path="/reviewers/feedback-history/responded-topics"
            element={<ReviewerRespondedTopics />}
          />
          <Route
            path="/reviewers/feedback-history/post-review-tracking"
            element={<ReviewerPostReviewTracking />}
          />

          {/* Reviewer - Topic Archive */}
          <Route
            path="/reviewers/topic-archive/approved-topics"
            element={<ReviewerApprovedTopics />}
          />
          <Route
            path="/reviewers/topic-archive/search-related"
            element={<ReviewerSearchRelated />}
          />

          {/* Reviewer - Evaluation Stats */}
          <Route
            path="/reviewers/evaluation-stats/completed"
            element={<ReviewerCompletedStats />}
          />
          <Route
            path="/reviewers/evaluation-stats/warnings"
            element={<ReviewerWarningsStats />}
          />
          <Route
            path="/reviewers/evaluation-stats/average-score"
            element={<ReviewerAverageScore />}
          />

          {/* Moderator routes */}
          <Route path="/moderators/dashboard" element={<ModDashboard />} />

          {/* Topic-Approval */}
          <Route
            path="/moderators/topic-approval/supervisor-sent"
            element={<ModSupervisorSent />}
          />
          <Route
            path="/moderators/topic-approval/pending"
            element={<ModPendingTopics />}
          />
          <Route
            path="/moderators/topic-approval/assigned"
            element={<ModAssignedTopics />}
          />
          <Route
            path="/moderators/topic-approval/rejected"
            element={<ModRejectedTopics />}
          />
          <Route
            path="/moderators/topic-approval/archived"
            element={<ModArchivedTopics />}
          />

          {/* Reviewer-Assignment */}
          <Route
            path="/moderators/reviewer-assignment/assign-reviewers"
            element={<ModAssignDrawer />}
          />
          <Route
            path="/moderators/reviewer-assignment/progress-tracking"
            element={<ModReviewerList />}
          />

          {/* Feedback-Evaluation */}
          <Route
            path="/moderators/feedback-evaluation/history"
            element={<ModHistoryTimeline />}
          />
          <Route
            path="/moderators/feedback-evaluation/suggestions"
            element={<ModSuggestions />}
          />
          <Route
            path="/moderators/feedback-evaluation/approve-new-version"
            element={<ModApproveNewVersion />}
          />

          {/* Reports */}
          <Route
            path="/moderators/reports/topic-by-phase"
            element={<ModTopicByPhase />}
          />
          <Route
            path="/moderators/reports/evaluation-status"
            element={<ModEvaluationStatus />}
          />
          <Route
            path="/moderators/reports/reviewer-performance"
            element={<ModReviewerPerf />}
          />

          {/* Semester-Phase */}
          <Route
            path="/moderators/semester-phase/semester-list"
            element={<ModSemesterList />}
          />
          <Route
            path="/moderators/semester-phase/phases"
            element={<ModPhases />}
          />
          <Route
            path="/moderators/semester-phase/rounds"
            element={<ModRounds />}
          />

          {/* 404 fallback */}
          <Route path="/*" element={<NotFoundPage />} />
        </Route>

        {/* Login (outside layout) */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Suspense>
  );
}

export default App;
