import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import MealsPage from "./pages/MealsPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import BodyPage from "./pages/BodyPage";
import FoodsPage from "./pages/FoodsPage";
import NotFound from "./pages/NotFound";
import { HealthDataProvider } from "@/contexts/HealthDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <HealthDataProvider>
          <div className="max-w-lg mx-auto min-h-screen">
            <Routes>
              <Route path="/" element={<MealsPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/body" element={<BodyPage />} />
              <Route path="/foods" element={<FoodsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </HealthDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
