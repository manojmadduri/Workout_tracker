import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import TodayWorkout from "@/pages/TodayWorkout";
import WorkoutHistory from "@/pages/WorkoutHistory";
import ProgressStats from "@/pages/ProgressStats";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useState } from "react";

// Available navigation items
export type NavItem = "today" | "history" | "stats";

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("today");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar for desktop */}
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        
        {/* Main content area */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1 pb-16 md:pb-0">
            <Switch>
              <Route path="/">
                <TodayWorkout />
              </Route>
              <Route path="/history">
                <WorkoutHistory />
              </Route>
              <Route path="/stats">
                <ProgressStats />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        
        {/* Mobile navigation */}
        <MobileNav activeNav={activeNav} setActiveNav={setActiveNav} />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
