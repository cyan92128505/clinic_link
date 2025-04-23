import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { PlusCircle, ClipboardList, CheckCircle, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityLog = {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  relatedEntity: string;
  relatedEntityId: number;
  timestamp: string;
  user?: {
    fullName: string;
  };
};

export function RecentActivity() {
  // Fetch recent activity logs
  const { data: activityLogs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/v1/activity-logs"],
  });

  // Get activity icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return (
          <div className="h-10 w-10 rounded-full bg-primary-light/20 flex items-center justify-center ring-8 ring-white">
            <PlusCircle className="h-5 w-5 text-primary" />
          </div>
        );
      case "update":
        return (
          <div className="h-10 w-10 rounded-full bg-secondary-light/20 flex items-center justify-center ring-8 ring-white">
            <ClipboardList className="h-5 w-5 text-secondary" />
          </div>
        );
      case "complete":
        return (
          <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center ring-8 ring-white">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-accent-light/20 flex items-center justify-center ring-8 ring-white">
            <Bell className="h-5 w-5 text-accent" />
          </div>
        );
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: zhTW
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活動</CardTitle>
        <CardDescription>
          系統最近的操作紀錄與通知
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : activityLogs?.length === 0 ? (
          <div className="text-center p-6 text-neutral-500">
            暫無活動記錄
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activityLogs?.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index < activityLogs.length - 1 && (
                      <span 
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" 
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <a href="#" className="font-medium text-neutral-900">
                              {activity.user?.fullName || "使用者"}
                            </a>
                          </div>
                          <p className="mt-0.5 text-sm text-neutral-500">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          <p>{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            查看更多
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
