import { NavItem } from "@/App";
import { Link } from "wouter";
import { CalendarIcon, ClipboardIcon, BarChart3Icon } from "lucide-react";

interface MobileNavProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
}

export default function MobileNav({ activeNav, setActiveNav }: MobileNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
      <div className="flex justify-around">
        <Link 
          href="/"
          onClick={() => setActiveNav("today")}
          className="flex flex-col items-center py-2 px-3"
        >
          <CalendarIcon 
            className={`h-6 w-6 ${activeNav === "today" ? "text-primary-600" : "text-gray-500"}`} 
          />
          <span className={`text-xs mt-1 ${activeNav === "today" ? "text-primary-600" : "text-gray-500"}`}>
            Today
          </span>
        </Link>
        
        <Link 
          href="/history"
          onClick={() => setActiveNav("history")}
          className="flex flex-col items-center py-2 px-3"
        >
          <ClipboardIcon 
            className={`h-6 w-6 ${activeNav === "history" ? "text-primary-600" : "text-gray-500"}`} 
          />
          <span className={`text-xs mt-1 ${activeNav === "history" ? "text-primary-600" : "text-gray-500"}`}>
            History
          </span>
        </Link>
        
        <Link 
          href="/stats"
          onClick={() => setActiveNav("stats")}
          className="flex flex-col items-center py-2 px-3"
        >
          <BarChart3Icon 
            className={`h-6 w-6 ${activeNav === "stats" ? "text-primary-600" : "text-gray-500"}`} 
          />
          <span className={`text-xs mt-1 ${activeNav === "stats" ? "text-primary-600" : "text-gray-500"}`}>
            Stats
          </span>
        </Link>
      </div>
    </div>
  );
}
