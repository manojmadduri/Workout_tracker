import { NavItem } from "@/App";
import { Link } from "wouter";
import { CalendarIcon, ClipboardIcon, BarChart3Icon } from "lucide-react";

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
}

export default function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-primary-600 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-white text-2xl font-bold">FitTrack</h1>
        </div>
        <div className="mt-8 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            <Link 
              href="/"
              onClick={() => setActiveNav("today")}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeNav === "today" 
                  ? "bg-primary-700 text-white" 
                  : "text-white hover:bg-primary-700"
              }`}
            >
              <CalendarIcon className="mr-3 h-6 w-6" />
              Today's Workout
            </Link>
            
            <Link 
              href="/history"
              onClick={() => setActiveNav("history")}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeNav === "history" 
                  ? "bg-primary-700 text-white" 
                  : "text-white hover:bg-primary-700"
              }`}
            >
              <ClipboardIcon className="mr-3 h-6 w-6" />
              History
            </Link>
            
            <Link 
              href="/stats"
              onClick={() => setActiveNav("stats")}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeNav === "stats" 
                  ? "bg-primary-700 text-white" 
                  : "text-white hover:bg-primary-700"
              }`}
            >
              <BarChart3Icon className="mr-3 h-6 w-6" />
              Progress Stats
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
