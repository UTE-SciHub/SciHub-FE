import { createBrowserRouter } from "react-router-dom";
import UserLayout from "@/components/layout/user/UserLayout";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import Index from "@/pages/Index";
import TopicRegistration from "@/pages/TopicRegistration";
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
import { AuthGuard } from "@/middleware/AuthGuard";
import TopicProposal from "@/pages/topics/TopicProposal";
import ListResearchField from "@/pages/admin/research-field/ListResearchField";
import ListResearchType from "@/pages/admin/research-type/ListResearchType";
import RegistrationPeriodDetail from "@/pages/RegistrationDetail";
import ListCategory from "@/pages/admin/category/ListCategories";
import ListTopics from "@/pages/admin/topics";
import ForbiddenPage from "@/pages/ForbiddenPage";

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
      { path: "topic-proposal", element: <TopicProposal /> },
      { path: "registration/:id", element: <RegistrationPeriodDetail /> },
      { path: "my-topics", element: <TopicRegistration /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard>
        <AdminLayout children={""} />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "topics", element: <ListTopics /> },
      { path: "contracts", element: <AdminContracts /> },
      { path: "finance", element: <AdminFinance /> },
      { path: "announcements", element: <AdminAnnouncements /> },
      { path: "users", element: <AdminUsers /> },
      { path: "registration", element: <AdminRegistrationPeriods /> },
      { path: "registration/add", element: <CreateRegistrationPeriod /> },
      { path: "registration/:id", element: <UpdateRegistrationPeriod /> },
      { path: "departments", element: <ListDepartment /> },
      { path: "research-fields", element: <ListResearchField /> },
      { path: "research-types", element: <ListResearchType /> },
      { path: "categories", element: <ListCategory /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
  { path: "/forbidden", element: <ForbiddenPage /> },
]);

export default routers;