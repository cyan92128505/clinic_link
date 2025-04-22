import { useState, useEffect } from "react";
import { Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TopNavigationProps = {
  onMenuClick: () => void;
};

export function TopNavigation({ onMenuClick }: TopNavigationProps) {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    // Update the date and time
    function updateDateTime() {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      setDateTime(now.toLocaleDateString('zh-TW', options));
    }
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="lg:hidden text-neutral-600"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">開啟選單</span>
        </Button>

        {/* Date and time display */}
        <div className="hidden sm:flex items-center">
          <div className="text-sm text-neutral-500">
            {dateTime}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6 text-neutral-600" />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-destructive animate-pulse"></span>
            <span className="sr-only">通知</span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-6 w-6 text-neutral-600" />
            <span className="sr-only">說明</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
