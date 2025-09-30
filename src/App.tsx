import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/loading-page";
import DuplicateAdvancedResultPage from "./pages/supervisors/ai-check-duplicate/DuplicateAdvancedResultPage";
import TopicListDetailDuplicatePage from "./pages/supervisors/ai-check-duplicate/TopicListDetailDuplicatePage";
import CreateTopicFromAIPage from "./pages/supervisors/ai-check-duplicate/CreateTopicFromAIPage";
import CreateTopicNewPage from "./pages/supervisors/CreateTopicNewPage";
import CreateTopicSuggestPage from "./pages/supervisors/CreateTopicSuggestPage";
import CreateTopicBackPage from "./pages/supervisors/CreateTopicBackPage";
import DuplicateAdvancedInspectorFullPage from "./pages/supervisors/topic-management/DuplicateAdvancedInspectorFullPage";
import MyTopicEditPage from "./pages/supervisors/topic-management/MyTopicEditPage";
import TopicEditFromSuggestionPage from "./pages/supervisors/topic-management/MyTopicEditFromSuggestionPage";
import SuggestPreviewConfirmPage from "./pages/supervisors/topic-management/SuggestPreviewConfirmPage";

const LectureLayout = lazy(
  () => import("./components/globals/layouts/lecture"),
);

const Home = lazy(() => import("./pages/home-page"));
const Login = lazy(() => import("./pages/login-page"));

const CreateProfilePage = lazy(
  () => import("./pages/profile/CreateProfilePage"),
);
const MyProfilePage = lazy(() => import("./pages/profile/MyProfilePage"));
const EditProfilePage = lazy(() => import("./pages/profile/EditProfilePage"));

const AllMyTopics = lazy(
  () => import("./pages/supervisors/topic-management/myTopic-page"),
);
const MyTopicDetailPage = lazy(
  () => import("./pages/supervisors/topic-management/MyTopicDetailPage"),
);
const TopicVersionDetailPage = lazy(
  () => import("./pages/supervisors/topic-management/TopicVersionDetailPage"),
);
const TopicVersionCreatePage = lazy(
  () => import("./pages/supervisors/topic-management/TopicVersionCreatePage"),
);

const TopicsListPage = lazy(
  () => import("./pages/supervisors/all-topics-list/TopicsListPage"),
);
const TopicListDetailPage = lazy(
  () => import("./pages/supervisors/all-topics-list/TopicListDetailPage"),
);
const AllSubmittedTopicPage = lazy(
  () =>
    import("./pages/supervisors/all-submitted-topics/AllSubmittedTopicsPage"),
);
const SubmittedTopicDetailPage = lazy(
  () =>
    import("./pages/supervisors/all-submitted-topics/SubmittedTopicDetailPage"),
);
const AllUnsubmittedTopicPage = lazy(
  () =>
    import(
      "./pages/supervisors/all-unsubmitted-topics/AllUnsubmittedTopicPage"
    ),
);
const UnsubmittedTopicDetailPage = lazy(
  () =>
    import(
      "./pages/supervisors/all-unsubmitted-topics/UnsubmittedTopicDetailPage"
    ),
);

const SemesterPage = lazy(
  () => import("./pages/supervisors/semester/semester-page"),
);
const CategoryPage = lazy(
  () => import("./pages/supervisors/category/category-page"),
);

const SemestersPage = lazy(
  () => import("./pages/supervisors/submission-topic/semesters/semesters-page"),
);
const PhaseTypesPage = lazy(
  () => import("./pages/supervisors/submission-topic/semesters/PhaseTypesPage"),
);
const PhaseListPage = lazy(
  () => import("./pages/supervisors/submission-topic/semesters/PhaseListPage"),
);

const TopicDuplicateCheckerPage = lazy(
  () => import("./pages/supervisors/ai-check"),
);

const AdminSemesterPage = lazy(
  () => import("./pages/admins/semester-management/SemesterPage"),
);
const PhaseTypePage = lazy(
  () => import("./pages/admins/phase-types/PhaseTypePage"),
);
const PhasePage = lazy(() => import("./pages/admins/phase/PhasePage"));
const AdminCategoryPage = lazy(
  () => import("./pages/admins/category-topic/CategoryPage"),
);
const AdminEvaluationCriteriaPage = lazy(
  () =>
    import("./pages/admins/evaluation-criteria/AdminEvaluationCriteriaPage"),
);
const EvaluationCriteriaDetailPage = lazy(
  () =>
    import("./pages/admins/evaluation-criteria/EvaluationCriteriaDetailPage"),
);
const AccountProvisionPage = lazy(
  () => import("./pages/admins/auth-management/AccountProvisionPage"),
);

const ReviewerDashboard = lazy(() => import("./pages/reviewers/dashboard"));
const ReviewerAssignedList = lazy(
  () => import("./pages/reviewers/assigned-topics/list"),
);
const ReviewerAssignedDetail = lazy(
  () => import("./pages/reviewers/assigned-topics/detail"),
);
const ReviewerStats = lazy(() => import("./pages/reviewers/evaluation-stats"));
const ReviewerReview = lazy(
  () => import("./pages/reviewers/evaluate-topics/review"),
);

const ModeratorDashboard = lazy(() => import("./pages/moderators/dashboard"));
const SubmissionsListPage = lazy(
  () => import("./pages/moderators/submissions"),
);
const SubmissionDetailPage = lazy(
  () => import("./pages/moderators/submissions/SubmissionDetailPage"),
);
const ModeratorFeedbackEval = lazy(
  () => import("./pages/moderators/feedback-evaluation"),
);
const ModeratorReports = lazy(() => import("./pages/moderators/reports"));
const ModeratorCategoryPage = lazy(
  () => import("./pages/moderators/category-manager/category-page"),
);
const ModeratorSemesterPhase = lazy(
  () => import("./pages/moderators/semester-phase"),
);

const NotFoundPage = lazy(() => import("./pages/not-found-page"));

function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/profile/create" element={<CreateProfilePage />} />
        <Route
          path="/profile/CreateProfilePage"
          element={<Navigate to="/profile/create" replace />}
        />
        <Route element={<LectureLayout />}>
          <Route path="/home" element={<Home />} />
          <Route
            path="/supervisors/topics/create-new"
            element={<CreateTopicNewPage />}
          />
          <Route
            path="/supervisors/topics/create-suggest"
            element={<CreateTopicSuggestPage />}
          />
          <Route
            path="/supervisors/topics/create-back"
            element={<CreateTopicBackPage />}
          />

          <Route
            path="/supervisors/topics/myTopic-page"
            element={<AllMyTopics />}
          />
          <Route path="/topics/my/:id" element={<MyTopicDetailPage />} />
          <Route path="/topics/my/:id/edit" element={<MyTopicEditPage />} />
          <Route
            path="/topics/:topicId/versions/:versionId"
            element={<TopicVersionDetailPage />}
          />
          <Route
            path="/topics/:topicId/versions/new"
            element={<TopicVersionCreatePage />}
          />

          <Route
            path="/supervisors/topics/all-topics-list"
            element={<TopicsListPage />}
          />
          <Route
            path="/supervisors/topics/all-topics-list/topics/:id"
            element={<TopicListDetailPage />}
          />

          <Route
            path="/supervisors/all-submitted-topics/AllSubmittedTopicsPage"
            element={<AllSubmittedTopicPage />}
          />
          <Route
            path="/supervisors/ai-check-duplicate"
            element={<DuplicateAdvancedResultPage />}
          />
          <Route
            path="/supervisors/topics/:id/suggest-edit"
            element={<TopicEditFromSuggestionPage />}
          />
          <Route
            path="/supervisors/topics/:id/suggest-preview"
            element={<SuggestPreviewConfirmPage />}
          />
          <Route
            path="/supervisors/ai-check-duplicate/advanced-result"
            element={<DuplicateAdvancedInspectorFullPage />}
          />
          <Route
            path="/supervisors/ai-check-duplicate/create"
            element={<CreateTopicFromAIPage />}
          />

          <Route
            path="/supervisors/ai-check-duplicate/:id"
            element={<TopicListDetailDuplicatePage />}
          />
          <Route
            path="/submitted/topics/:id"
            element={<SubmittedTopicDetailPage />}
          />

          <Route
            path="/supervisors/all-unsubmitted-topics/AllUnSubmittedTopicsPage"
            element={<AllUnsubmittedTopicPage />}
          />
          <Route
            path="/unsubmitted/topics/:id"
            element={<UnsubmittedTopicDetailPage />}
          />

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

          <Route path="/supervisors/semester" element={<SemesterPage />} />
          <Route path="/supervisors/category" element={<CategoryPage />} />

          <Route
            path="/admins/semester-management/SemesterPage"
            element={<AdminSemesterPage />}
          />
          <Route
            path="/admins/phase-types/PhaseTypePage"
            element={<PhaseTypePage />}
          />
          <Route path="/admins/phase/PhasePage" element={<PhasePage />} />
          <Route
            path="/admins/category-topic/CategoryPage"
            element={<AdminCategoryPage />}
          />
          <Route
            path="/admins/evaluation-criteria/EvaluationCriteriaPage"
            element={<AdminEvaluationCriteriaPage />}
          />
          <Route
            path="/admin/evaluation/criteria/:id"
            element={<EvaluationCriteriaDetailPage />}
          />
          <Route
            path="/admins/auth-management/account-provision"
            element={<AccountProvisionPage />}
          />

          <Route path="/reviewers/dashboard" element={<ReviewerDashboard />} />
          <Route path="/reviewers/assigned-topics/list" element={<ReviewerAssignedList />} />
          <Route path="/reviewers/assigned-topics/detail/:submissionId" element={<ReviewerAssignedDetail />} />
          <Route path="/reviewers/evaluation-stats" element={<ReviewerStats />} />
          <Route path="/reviewers/evaluate-topics/:assignmentId" element={<ReviewerReview />}
          />

          <Route path="/moderators/dashboard" element={<ModeratorDashboard />} />
          <Route path="/moderators/submissions" element={<SubmissionsListPage />} />
          <Route path="/moderators/submissions/:submissionId" element={<SubmissionDetailPage />} />
          <Route path="/moderators/feedback-evaluation" element={<ModeratorFeedbackEval />} />
          <Route path="/moderators/reports" element={<ModeratorReports />} />
          <Route
            path="/moderators/category-manager/category-page"
            element={<ModeratorCategoryPage />}
          />
          <Route
            path="/moderators/semester-phase"
            element={<ModeratorSemesterPhase />}
          />
          <Route
            path="/moderators/ai"
            element={<TopicDuplicateCheckerPage />}
          />

          <Route path="/profile/MyProfilePage" element={<MyProfilePage />} />
          <Route
            path="/profile/EditProfilePage"
            element={<EditProfilePage />}
          />

          <Route path="/*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
