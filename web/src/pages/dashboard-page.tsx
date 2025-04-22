import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Download,
  Plus 
} from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/ui/top-navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { QueueStatus } from "@/components/dashboard/queue-status";
import { NextAppointments } from "@/components/dashboard/next-appointments";
import { QuickRegistration } from "@/components/dashboard/quick-registration";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/stats/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
      return res.json();
    },
  });

  // Default values if data is not available yet
  const dashboardStats = stats || {
    waitingCount: 0,
    todayAppointments: 0,
    walkInsToday: 0,
    completedToday: 0,
    averageWaitTime: 0,
    averageConsultationTime: 0
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <TopNavigation onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-neutral-800">今日診間概況</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  即時監控診所狀況、病患流量與等候情形
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                <Button variant="outline" className="space-x-2">
                  <Download className="h-4 w-4" />
                  <span>匯出報表</span>
                </Button>
                <Button className="space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>新增掛號</span>
                </Button>
              </div>
            </div>

            {/* Dashboard stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {/* Waiting patients */}
              <StatCard 
                icon={<Clock className="h-6 w-6" />}
                iconColor="text-primary"
                iconBgColor="bg-primary-light/20"
                title="等候看診"
                value={dashboardStats.waitingCount}
                subText={`平均等候: ${dashboardStats.averageWaitTime}分鐘`}
              />

              {/* Today's appointments */}
              <StatCard 
                icon={<Calendar className="h-6 w-6" />}
                iconColor="text-secondary"
                iconBgColor="bg-secondary-light/20"
                title="今日預約"
                value={dashboardStats.todayAppointments}
                subText={`已到診: ${dashboardStats.todayAppointments - dashboardStats.walkInsToday}`}
              />

              {/* Walk-ins */}
              <StatCard 
                icon={<ArrowRight className="h-6 w-6" />}
                iconColor="text-accent"
                iconBgColor="bg-accent-light/20"
                title="現場掛號"
                value={dashboardStats.walkInsToday}
                subText={`總數: ${dashboardStats.todayAppointments}`}
              />

              {/* Completed consultations */}
              <StatCard 
                icon={<CheckCircle className="h-6 w-6" />}
                iconColor="text-success"
                iconBgColor="bg-success/20"
                title="已完成看診"
                value={dashboardStats.completedToday}
                subText={`平均: ${dashboardStats.averageConsultationTime}分鐘/人`}
              />
            </div>

            {/* Department status and queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Queue status table */}
              <QueueStatus />

              {/* Next appointments */}
              <NextAppointments />
            </div>

            {/* Recent activity and quick registration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick registration */}
              <QuickRegistration />

              {/* Recent activity */}
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
