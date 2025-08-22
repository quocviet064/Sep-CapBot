import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LectureLayout from "./components/globals/layouts/lecture";

import LoadingPage from "./pages/loading-page";
import NotFoundPage from "./pages/not-found-page";
import { useAuth } from "./contexts/AuthContext";
import MyTopicDetailPage from "./pages/supervisors/topic-management/MyTopicDetailPage";
import TopicVersionDetailPage from "./pages/supervisors/topic-management/TopicVersionDetailPage";
import TopicVersionCreatePage from "./pages/supervisors/topic-management/TopicVersionCreatePage";
// import SubmissionPage from "./pages/supervisors/submissions/SubmissionPage";
import PhaseTypePage from "./pages/admins/phase-types/PhaseTypePage";
import PhasePage from "./pages/admins/phase/PhasePage";
import SemestersPage from "./pages/supervisors/submission-topic/semesters/semesters-page";
import PhaseTypesPage from "./pages/supervisors/submission-topic/semesters/PhaseTypesPage";
import PhaseListPage from "./pages/supervisors/submission-topic/semesters/PhaseListPage";

function App() {
  const { isAuthenticated } = useAuth();

  // if (loading) return <LoadingPage />;

  const Home = lazy(() => import("./pages/home-page"));
  const Login = lazy(() => import("./pages/login-page"));

  // Supervisor pages
  const CreateTopicPage = lazy(
    () => import("./pages/supervisors/CreateTopicPage"),
  );
  const AllTopics = lazy(
    () => import("./pages/supervisors/topic-management/topic-page"),
  );

  const AllMyTopics = lazy(
    () => import("./pages/supervisors/topic-management/myTopic-page"),
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

  const SemesterPage = lazy(
    () => import("./pages/supervisors/semester/semester-page"),
  );

  const CategoryPage = lazy(
    () => import("./pages/supervisors/category/category-page"),
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

  // Reviewer 
  const ReviewerDashboard = lazy(() => import("./pages/reviewers/dashboard"));
  const ReviewerAssignedList = lazy(() => import("./pages/reviewers/assigned-topics/list"));
  const ReviewerAssignedDetail = lazy(() => import("./pages/reviewers/assigned-topics/detail"));
  const ReviewerFeedbackHistory = lazy(() => import("./pages/reviewers/feedback-history"));
  const ReviewerTopicArchive = lazy(() => import("./pages/reviewers/topic-archive"));
  const ReviewerStats = lazy(() => import("./pages/reviewers/evaluation-stats"));
  const ReviewerReview = lazy(() => import("./pages/reviewers/evaluate-topics/review"));

  // Moderator pages
  const ModeratorDashboard = lazy(() => import("./pages/moderators/dashboard"));
  // const ModeratorSemesterPhase = lazy(
  //   () => import("./pages/moderators/semester-phase"),
  // );
  const ModeratorTopicApproval = lazy(
    () => import("./pages/moderators/topic-approval"),
  );
  const ModeratorReviewerAssign = lazy(
    () => import("./pages/moderators/reviewer-assignment"),
  );
  const ModeratorFeedbackEval = lazy(
    () => import("./pages/moderators/feedback-evaluation"),
  );
  const ModeratorReports = lazy(() => import("./pages/moderators/reports"));
  const ModeratorCategoryPage = lazy(
    () => import("./pages/moderators/category-manager/category-page"),
  );
  const CurrentAssignmentsPage = lazy(
    () => import("./pages/moderators/reviewer-assignment/assignments"),
  );

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<LectureLayout />}>
          {/* Login (outside layout) */}

          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/home" element={<Home />} />

          {/* Supervisor routes */}
          <Route path="/create-project" element={<CreateTopicPage />} />

          {/* Quản lý đề tài */}
          <Route
            path="/supervisors/topics/topic-page"
            element={<AllTopics />}
          />
          <Route
            path="/supervisors/topics/myTopic-page"
            element={<AllMyTopics />}
          />
          {/* <Route
            path="/supervisors/submissions/SubmissionPage"
            element={<SubmissionPage />}
          /> */}
          <Route
            path="/supervisors/submission-topic/semesters/semesters-page"
            element={<SemestersPage />}
          />
          <Route
            path="/supervisors/submission-topic/semesters/phase-types"
            element={<PhaseTypesPage />}
          />
          <Route
            path="/semesters/:semesterId/phases"
            element={<PhaseListPage />}
          />

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

          <Route path="/topics/my/:id" element={<MyTopicDetailPage />} />
          <Route
            path="/topics/:topicId/versions/:versionId"
            element={<TopicVersionDetailPage />}
          />
          <Route
            path="/topics/:topicId/versions/new"
            element={<TopicVersionCreatePage />}
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

          <Route path="/supervisors/semester" element={<SemesterPage />} />

          <Route path="/supervisors/category" element={<CategoryPage />} />

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
            path="/admins/phase-types/PhaseTypePage"
            element={<PhaseTypePage />}
          />
          <Route path="/admins/phase/PhasePage" element={<PhasePage />} />
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

          {/* Reviewer */}
          <Route path="/reviewers/dashboard" element={<ReviewerDashboard />} />
          <Route path="/reviewers/assigned-topics/list" element={<ReviewerAssignedList />} />
          <Route path="/reviewers/assigned-topics/detail" element={<ReviewerAssignedDetail />} />
          <Route path="/reviewers/feedback-history" element={<ReviewerFeedbackHistory />} />
          <Route path="/reviewers/topic-archive" element={<ReviewerTopicArchive />} />
          <Route path="/reviewers/evaluation-stats" element={<ReviewerStats />} />
          <Route path="/reviewers/evaluate-topics/:assignmentId" element={<ReviewerReview />}
          />

          {/* Moderator routes */}
          <Route
            path="/moderators/dashboard"
            element={<ModeratorDashboard />}
          />
          {/* <Route
            path="/moderators/semester-phase"
            element={<ModeratorSemesterPhase />}
          /> */}
          <Route
            path="/moderators/topic-approval"
            element={<ModeratorTopicApproval />}
          />
          <Route
            path="/moderators/reviewer-assignment/assignments"
            element={<CurrentAssignmentsPage />}
          />
          <Route
            path="/moderators/reviewer-assignment"
            element={<ModeratorReviewerAssign />}
          />
          <Route
            path="/moderators/feedback-evaluation"
            element={<ModeratorFeedbackEval />}
          />
          <Route path="/moderators/reports" element={<ModeratorReports />} />
          <Route
            path="/moderators/category-manager/category-page"
            element={<ModeratorCategoryPage />}
          />

          {/* 404 fallback */}
          <Route path="/*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
