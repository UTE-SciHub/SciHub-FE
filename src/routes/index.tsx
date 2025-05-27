import { createBrowserRouter } from "react-router-dom";
import UserLayout from "@/components/layout/user/UserLayout";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import Index from "@/pages/Index";
import TopicApproval from "@/pages/TopicApproval";
import Contracts from "@/pages/Contracts";
import TopicExecution from "@/pages/TopicExecution";
import TopicCompletion from "@/pages/TopicCompletion";
import Archive from "@/pages/Archive";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminFinance from "@/pages/admin/AdminFinance";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminUsers from "@/pages/admin/users/ListUsers";
import CreateRegistrationPeriod from "@/pages/admin/registration/create-registration";
import AdminRegistrationPeriods from "@/pages/admin/registration/list-registration";
import Login from "@/pages/Login";
import ProfilePage from "@/pages/user/Profile";
import ListDepartment from "@/pages/admin/department/ListDepartment";
import UpdateRegistrationPeriod from "@/pages/admin/registration/update-registration";
import { RoleGuard } from "@/middleware/RoleGuard";
import TopicProposal from "@/pages/topics/TopicProposal";
import ListResearchField from "@/pages/admin/research-field/ListResearchField";
import ListResearchType from "@/pages/admin/research-type/ListResearchType";
import RegistrationPeriodDetail from "@/pages/RegistrationDetail";
import ListCategory from "@/pages/admin/category/ListCategories";
import ListTopics from "@/pages/admin/topics";
import ForbiddenPage from "@/pages/ForbiddenPage";
import EditTopic from "@/pages/topics/edit/EditTopic";
import MyTopic from "@/pages/topics/MyTopic";
import ViewTopic from "@/pages/topics/view/ViewTopic";
import { AuthGuard } from "@/middleware/AuthGuard";
import AssignTopicPage from "@/pages/admin/topics/manage/AssignTopicPage";
import InitialReviewTopicPage from "@/pages/admin/topics/manage/InitialReviewTopicPage";
import ReviewTopicPage from "@/pages/admin/topics/manage/ReviewTopicPage";
import EvaluateTopicPage from "@/pages/admin/topics/manage/EvaluateTopicPage";
import ReviewTopic from "@/pages/admin/topics/manage/review/ReviewTopic";
import PMReviewPage from "@/pages/admin/topics/manage/PMReview/PMReviewPage";
import RegisterCNDTPage from "@/pages/admin/registration-cndt/RegistrationCNDTPage";
import CreateCouncilPage from "@/pages/admin/council/create/CreateCouncilPage";
import CouncilManagementPage from "@/pages/admin/council/CouncilsManagePage";
import CouncilDetailPage from "@/pages/admin/council/CouncilDetailPage";
import EditCouncilPage from "@/pages/admin/council/EditCouncilPage";
import CouncilTopicsPage from "@/pages/admin/council/evaluation/CouncilTopicsPage";
import MeetingMinutesPage from "@/pages/admin/council/MeetingMinutes";
import LecturerTopicsPage from "@/pages/admin/topics/my-topic/LecturerTopicsPage";
import TopicFeedbackPage from "@/pages/admin/topics/feedback/TopicFeedbackPage";
import TopicProgressPage from "@/pages/admin/topics/feedback/TopicProgressPage";
import ContractList from "@/pages/admin/contract/ContractList";
import SettingsPage from "@/pages/admin/settings/SettingsPage";

const routers = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "topic-approval", element: <TopicApproval /> },
      { path: "contracts", element: <Contracts /> },
      { path: "topic-execution", element: <TopicExecution /> },
      { path: "topic-completion", element: <TopicCompletion /> },
      { path: "archive", element: <Archive /> },
      { path: "profile", element: <ProfilePage /> },
      {
        element: <AuthGuard />,
        children: [
          { path: "registration/:id", element: <RegistrationPeriodDetail /> },
          { path: "topic-proposal", element: <TopicProposal /> },
          { path: "my-topics", element: <MyTopic /> },
          { path: "topic/edit/:id", element: <EditTopic /> },
          { path: "topic/:id", element: <ViewTopic /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleGuard>
        <AdminLayout children={""} />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      {
        path: "topics",
        children: [
          { index: true, element: <ListTopics /> },
          { path: ":id", element: <ViewTopic /> },
          { path: "assign/:id", element: <AssignTopicPage /> },
          { path: "initial-review/:id", element: <InitialReviewTopicPage /> },
          { path: "classification", element: <EvaluateTopicPage /> },
          { path: ":id/classification", element: <ReviewTopic /> },
          { path: "pm-evaluate/:id", element: <PMReviewPage /> },
        ],
      },
      {
        path: "councils", children: [
          { index: true, element: <CouncilManagementPage /> },
          { path: "create", element: <CreateCouncilPage /> },
          { path: ":id", element: <CouncilDetailPage /> },
          { path: ":id/topics", element: <CouncilTopicsPage /> },
          { path: "edit/:id", element: <EditCouncilPage /> },
          { path: "metting-minutes", element: <MeetingMinutesPage /> },
          { path: ":councilId/feedback/:topicId", element: <TopicFeedbackPage /> },
        ]
      },
      { path: "contracts", element: <ContractList /> },
      { path: "finance", element: <AdminFinance /> },
      { path: "announcements", element: <AdminAnnouncements /> },
      { path: "lecturer-topics", element: <LecturerTopicsPage /> },
      { path: "lecturer-topics/feedback/:id", element: <TopicFeedbackPage /> },
      { path: "lecturer/topic-progress/:id", element: <TopicProgressPage /> },
      { path: "users", element: <AdminUsers /> },
      {
        path: "registration",
        children: [
          { index: true, element: <AdminRegistrationPeriods /> },
          { path: "add", element: <CreateRegistrationPeriod /> },
          { path: ":id", element: <UpdateRegistrationPeriod /> },
        ],
      },
      { path: "departments", element: <ListDepartment /> },
      { path: "research-fields", element: <ListResearchField /> },
      { path: "research-types", element: <ListResearchType /> },
      { path: "categories", element: <ListCategory /> },
      { path: "registration-cndt", element: <RegisterCNDTPage /> },
      { path: "settings", element: <SettingsPage /> }
    ],
  },
  { path: "*", element: <NotFoundPage /> },
  { path: "/forbidden", element: <ForbiddenPage /> },
]);

export default routers;