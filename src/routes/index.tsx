import { createBrowserRouter } from "react-router-dom";
import UserLayout from "@/components/layout/user/UserLayout";
import AdminLayout from "@/components/layout/admin/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import TopicRegistration from "@/pages/TopicRegistration";
import TopicApproval from "@/pages/TopicApproval";
import Contracts from "@/pages/Contracts";
import TopicExecution from "@/pages/TopicExecution";
import TopicCompletion from "@/pages/TopicCompletion";
import Archive from "@/pages/Archive";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTopics from "@/pages/admin/AdminTopics";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminFinance from "@/pages/admin/AdminFinance";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminUsers from "@/pages/admin/users/AdminUsers";
import CreateRegistrationPeriod from "@/pages/admin/registration/page";
import ExamplePage from "@/pages/example";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "topic-registration", element: <TopicRegistration /> },
      { path: "topic-approval", element: <TopicApproval /> },
      { path: "contracts", element: <Contracts /> },
      { path: "topic-execution", element: <TopicExecution /> },
      { path: "topic-completion", element: <TopicCompletion /> },
      { path: "archive", element: <Archive /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout children={""} />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "topics", element: <AdminTopics /> },
      { path: "contracts", element: <AdminContracts /> },
      { path: "finance", element: <AdminFinance /> },
      { path: "registration", element: <CreateRegistrationPeriod /> },
      { path: "announcements", element: <AdminAnnouncements /> },
      { path: "users", element: <AdminUsers /> },
      { path: "loading", element: <ExamplePage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default routers;
