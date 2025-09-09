import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingPage from "./pages/loading-page";

const LectureLayout = lazy(
  () => import("./components/globals/layouts/lecture"),
);
const Home = lazy(() => import("./pages/home-page"));
const Login = lazy(() => import("./pages/login-page"));

const CreateTopicPage = lazy(
  () => import("./pages/supervisors/CreateTopicPage"),
);
const AllTopics = lazy(
  () => import("./pages/supervisors/topic-management/topic-page"),
);
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
  () => import("./pages/admins/evaluation-criteria/EvaluationCriteriaPage"),
);
const AccountProvisionPage = lazy(
  () => import("./pages/admins/auth-management/account-provision"),
);

// Reviewer 
const ReviewerDashboard = lazy(() => import("./pages/reviewers/dashboard"));
const ReviewerAssignedList = lazy(() => import("./pages/reviewers/assigned-topics/list"));
const ReviewerAssignedDetail = lazy(() => import("./pages/reviewers/assigned-topics/detail"));
const ReviewerFeedbackHistory = lazy(() => import("./pages/reviewers/feedback-history"));
const ReviewerTopicArchive = lazy(() => import("./pages/reviewers/topic-archive"));
const ReviewerStats = lazy(() => import("./pages/reviewers/evaluation-stats"));
const ReviewerReview = lazy(() => import("./pages/reviewers/evaluate-topics/review"));

const ModeratorDashboard = lazy(() => import("./pages/moderators/dashboard"));
const ModeratorSubmissionsLayout = lazy(() => import("./pages/moderators/submissions"));
const TabOverview = lazy(() => import("./pages/moderators/submissions/tabs/TabOverview"));
const TabApprove = lazy(() => import("./pages/moderators/submissions/tabs/TabApprove"));
const TabAssign = lazy(() => import("./pages/moderators/submissions/tabs/TabAssign"));
const TabReviews = lazy(() => import("./pages/moderators/submissions/tabs/TabReviews"));
const ModeratorFeedbackEval = lazy(() => import("./pages/moderators/feedback-evaluation"));
const ModeratorReports = lazy(() => import("./pages/moderators/reports"));
const ModeratorCategoryPage = lazy(() => import("./pages/moderators/category-manager/category-page"));
const ModeratorSemesterPhase = lazy(() => import("./pages/moderators/semester-phase"));

const NotFoundPage = lazy(() => import("./pages/not-found-page"));

function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<LectureLayout />}>
          <Route path="/home" element={<Home />} />

          <Route path="/create-project" element={<CreateTopicPage />} />
          <Route
            path="/supervisors/topics/topic-page"
            element={<AllTopics />}
          />
          <Route
            path="/supervisors/topics/myTopic-page"
            element={<AllMyTopics />}
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

          <Route path="/topics/my/:id" element={<MyTopicDetailPage />} />
          <Route
            path="/topics/:topicId/versions/:versionId"
            element={<TopicVersionDetailPage />}
          />
          <Route
            path="/topics/:topicId/versions/new"
            element={<TopicVersionCreatePage />}
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
            path="/admins/auth-management/account-provision"
            element={<AccountProvisionPage />}
          />

          <Route path="/reviewers/dashboard" element={<ReviewerDashboard />} />
          <Route path="/reviewers/assigned-topics/list" element={<ReviewerAssignedList />} />
          <Route path="/reviewers/assigned-topics/detail" element={<ReviewerAssignedDetail />} />
          <Route path="/reviewers/feedback-history" element={<ReviewerFeedbackHistory />} />
          <Route path="/reviewers/topic-archive" element={<ReviewerTopicArchive />} />
          <Route path="/reviewers/evaluation-stats" element={<ReviewerStats />} />
          <Route path="/reviewers/evaluate-topics/:assignmentId" element={<ReviewerReview />}
          />

          <Route path="/moderators/dashboard" element={<ModeratorDashboard />} />
          <Route path="/moderators/submissions" element={<ModeratorSubmissionsLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<TabOverview />} />
            <Route path="approve" element={<TabApprove />} />
            <Route path="assign" element={<TabAssign />} />
            <Route path="reviews" element={<TabReviews />} />
          </Route>
          <Route path="/moderators/feedback-evaluation" element={<ModeratorFeedbackEval />} />
          <Route path="/moderators/reports" element={<ModeratorReports />} />
          <Route path="/moderators/category-manager/category-page" element={<ModeratorCategoryPage />} />
          <Route path="/moderators/semester-phase" element={<ModeratorSemesterPhase />} />

          <Route path="/*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
