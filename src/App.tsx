import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import routers from "@/routes";
import { useAuthInitializer } from "@/hooks/useAuthInitializer";
import Loading from "@/components/loading/loading";

const queryClient = new QueryClient();

const App = () => {
  const { loading } = useAuthInitializer();

  if (loading) return <div>
    <Loading />
  </div>;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterProvider router={routers} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
