import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Room } from "@/models";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RoomWithQueueInfo = Room & {
  currentAppointment?: any;
  waitingCount: number;
  estimatedWaitTime: number;
  status?: string;
};

export function QueueStatus() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  const { data: rooms, isLoading } = useQuery<RoomWithQueueInfo[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: departments } = useQuery<{id: number, name: string}[]>({
    queryKey: ["/api/departments"],
  });

  // Filter rooms by department
  const filteredRooms = rooms?.filter(room => {
    if (selectedDepartment === "all") return true;
    return room.departmentId === parseInt(selectedDepartment);
  });

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success";
      case "paused":
        return "bg-warning/10 text-warning";
      default:
        return "bg-neutral-100 text-neutral-500";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return "看診中";
      case "paused":
        return "暫停中";
      default:
        return "未看診";
    }
  };

  const getStatusDot = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "paused":
        return "bg-warning";
      default:
        return "bg-neutral-500";
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between px-6">
        <div>
          <CardTitle>看診進度追蹤</CardTitle>
          <CardDescription>
            即時查看各診間看診狀態與等候人數
          </CardDescription>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setSelectedDepartment}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">全部</TabsTrigger>
            {departments?.map(dept => (
              <TabsTrigger key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  診間
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  醫師
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  目前看診
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  等候人數
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-border mx-auto" />
                  </td>
                </tr>
              ) : filteredRooms?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    無診間資料
                  </td>
                </tr>
              ) : (
                filteredRooms?.map((room) => (
                  <tr key={room.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      王小明醫師 {/* Placeholder, would come from room data */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {room.currentAppointment ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary">
                            {room.currentAppointment.appointmentNumber}
                          </span>
                          <span className="ml-2">{room.currentAppointment.patientName || "Patient Name"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            --
                          </span>
                          <span className="ml-2">--</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      <div className="flex items-center">
                        <span className={cn(
                          "font-medium",
                          room.waitingCount > 0 ? "text-primary" : "text-neutral-500"
                        )}>
                          {room.waitingCount}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          {room.waitingCount > 0 
                            ? `(約 ${room.estimatedWaitTime} 分鐘)` 
                            : "(--)"
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusBadgeClass(room.isActive ? "active" : "inactive")
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 mr-1.5 rounded-full",
                          getStatusDot(room.isActive ? "active" : "inactive")
                        )}></span>
                        {getStatusText(room.isActive ? "active" : "inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm">
                        詳情
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
