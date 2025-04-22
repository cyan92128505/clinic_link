import { useState, useEffect } from "react";
import { useMqtt } from "@/hooks/use-mqtt";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/ui/top-navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUp, ArrowDown, Play, Pause, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useClinicContext } from "@/hooks/use-clinic-context";

type RoomWithQueueInfo = {
  id: number;
  name: string;
  departmentId: number;
  doctorName: string;
  isActive: boolean;
  currentAppointment?: {
    id: number;
    appointmentNumber: string;
    patientId: number;
    patientName?: string;
    status: string;
  };
  waitingCount: number;
  estimatedWaitTime: number;
};

type NextAppointment = {
  id: number;
  appointmentNumber: string;
  patientId: number;
  patientName?: string;
  roomId: number;
  roomName?: string;
  doctorId: number;
  doctorName?: string;
  type: "pre_booked" | "walk_in";
  scheduledTime?: string;
  arrivalTime?: string;
  status: string;
  estimatedWaitTime: number;
};

type QueueData = {
  rooms: RoomWithQueueInfo[];
  nextAppointments: NextAppointment[];
};

export default function QueuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const queryClient = useQueryClient();
  const { currentClinic } = useClinicContext();

  // Set up MQTT connection
  const { status: mqttStatus, subscribe, publish } = useMqtt({
    onConnect: () => {
      toast({
        title: "連線成功",
        description: "已成功連接到MQTT即時更新服務",
      });
      
      // Subscribe to queue updates when connected
      if (currentClinic?.id) {
        const topic = `cms/clinic/${currentClinic.id}/queue/updates`;
        subscribe(topic);
      }
    },
    onMessage: (message) => {
      // Check if message is a queue update from our clinic
      if (currentClinic?.id && message.topic.includes(`cms/clinic/${currentClinic.id}/queue/updates`)) {
        try {
          // Parse payload
          const data = typeof message.payload === 'string' 
            ? JSON.parse(message.payload) 
            : message.payload;
            
          if (data.type === 'queueUpdate') {
            setQueueData(data.data);
          }
        } catch (err) {
          console.error("Error processing MQTT message:", err);
        }
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "連線失敗",
        description: "無法連接到MQTT即時更新服務，請重新整理頁面",
      });
    }
  });

  // Subscribe to the clinic-specific queue topic when clinic changes
  useEffect(() => {
    if (mqttStatus === 'connected' && currentClinic?.id) {
      const topic = `cms/clinic/${currentClinic.id}/queue/updates`;
      subscribe(topic);
    }
  }, [mqttStatus, currentClinic?.id, subscribe]);

  // Toggle room active status mutation
  const toggleRoomStatus = useMutation({
    mutationFn: async ({ roomId, isActive }: { roomId: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/rooms/${roomId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: error.message,
      });
    },
  });

  // Update appointment status mutation
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: number; status: string }) => {
      await apiRequest("PUT", `/api/appointments/${appointmentId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: error.message,
      });
    },
  });

  // Filter rooms by department
  const filteredRooms = queueData?.rooms.filter(room => {
    if (selectedDepartment === "all") return true;
    return room.departmentId === parseInt(selectedDepartment);
  });

  // Handle next patient
  const handleNextPatient = (roomId: number) => {
    const room = queueData?.rooms.find(r => r.id === roomId);
    const nextAppointment = queueData?.nextAppointments.find(a => a.roomId === roomId && a.status === "checked_in");
    
    if (room?.currentAppointment) {
      // Complete current appointment
      updateAppointmentStatus.mutate({ 
        appointmentId: room.currentAppointment.id, 
        status: "completed" 
      });
    }
    
    if (nextAppointment) {
      // Start next appointment
      updateAppointmentStatus.mutate({ 
        appointmentId: nextAppointment.id, 
        status: "in_progress" 
      });
    }
  };

  // Handle toggle room status
  const handleToggleRoomStatus = (roomId: number, isActive: boolean) => {
    toggleRoomStatus.mutate({ roomId, isActive: !isActive });
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
            {/* Page header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold text-neutral-800">看診進度追蹤</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  即時查看各診間看診狀態與等候人數
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "space-x-2",
                    mqttStatus === "connected" 
                      ? "bg-success/10 text-success" 
                      : "bg-warning/10 text-warning"
                  )}
                >
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    mqttStatus === "connected" ? "bg-success" : "bg-warning"
                  )}></span>
                  <span>{mqttStatus === "connected" ? "即時連線中" : "連線中..."}</span>
                </Badge>
              </div>
            </div>

            {/* Department tabs */}
            <Tabs defaultValue="all" onValueChange={setSelectedDepartment} className="mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">全部科別</TabsTrigger>
                <TabsTrigger value="1">家醫科</TabsTrigger>
                <TabsTrigger value="2">內科</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Rooms and queue status */}
            <div className="grid grid-cols-1 gap-6">
              {/* Queue status table */}
              <Card>
                <CardHeader>
                  <CardTitle>診間看診狀態</CardTitle>
                  <CardDescription>
                    管理診間看診狀態與病患叫號
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {!queueData ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-border" />
                    </div>
                  ) : filteredRooms?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-neutral-500">無診間資料</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>診間</TableHead>
                            <TableHead>醫師</TableHead>
                            <TableHead>目前看診</TableHead>
                            <TableHead>等候人數</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRooms?.map((room) => (
                            <TableRow key={room.id} className="hover:bg-neutral-50">
                              <TableCell className="font-medium">
                                {room.name}
                              </TableCell>
                              <TableCell>
                                {room.doctorName || "醫師"} {/* Would come from room data */}
                              </TableCell>
                              <TableCell>
                                {room.currentAppointment ? (
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary">
                                      {room.currentAppointment.appointmentNumber}
                                    </span>
                                    <span className="ml-2">{room.currentAppointment.patientName || "患者"}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                                      --
                                    </span>
                                    <span className="ml-2">--</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  room.isActive 
                                    ? "bg-success/10 text-success" 
                                    : "bg-warning/10 text-warning"
                                )}>
                                  <span className={cn(
                                    "h-1.5 w-1.5 mr-1.5 rounded-full",
                                    room.isActive ? "bg-success" : "bg-warning"
                                  )}></span>
                                  {room.isActive ? "看診中" : "暫停中"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="space-x-1"
                                    onClick={() => handleNextPatient(room.id)}
                                    disabled={!room.isActive || room.waitingCount === 0}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                    <span>下一位</span>
                                  </Button>
                                  <Button 
                                    variant={room.isActive ? "outline" : "default"} 
                                    size="sm"
                                    className="space-x-1"
                                    onClick={() => handleToggleRoomStatus(room.id, room.isActive)}
                                  >
                                    {room.isActive ? (
                                      <>
                                        <Pause className="h-3 w-3" />
                                        <span>暫停</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-3 w-3" />
                                        <span>開始</span>
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Waiting patients list */}
              <Card>
                <CardHeader>
                  <CardTitle>等待中病患</CardTitle>
                  <CardDescription>
                    目前所有等待中的病患列表
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {!queueData ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-border" />
                    </div>
                  ) : queueData.nextAppointments?.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-neutral-500">無等待中的病患</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>號碼</TableHead>
                            <TableHead>患者資訊</TableHead>
                            <TableHead>診間</TableHead>
                            <TableHead>醫師</TableHead>
                            <TableHead>類型</TableHead>
                            <TableHead>到達時間</TableHead>
                            <TableHead>預估等候</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queueData.nextAppointments?.map((appointment) => {
                            const appointmentTime = appointment.arrivalTime 
                              ? new Date(appointment.arrivalTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) 
                              : appointment.scheduledTime 
                                ? new Date(appointment.scheduledTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
                                : "--:--";
                              
                            return (
                              <TableRow key={appointment.id}>
                                <TableCell className={cn(
                                  "font-medium",
                                  appointment.type === "pre_booked" 
                                    ? "text-primary" 
                                    : "text-accent"
                                )}>
                                  {appointment.appointmentNumber}
                                </TableCell>
                                <TableCell>
                                  {appointment.patientName || "患者"}
                                  <div className="text-xs text-neutral-500">
                                    ID: {appointment.patientId}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {appointment.roomName || `診間 ${appointment.roomId}`}
                                </TableCell>
                                <TableCell>
                                  {appointment.doctorName || `醫師 ${appointment.doctorId}`}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn(
                                    appointment.type === "pre_booked" 
                                      ? "bg-primary-light/10 text-primary" 
                                      : "bg-accent-light/10 text-accent"
                                  )}>
                                    {appointment.type === "pre_booked" ? "預約" : "現場掛號"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {appointmentTime}
                                </TableCell>
                                <TableCell>
                                  {appointment.estimatedWaitTime} 分鐘
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="space-x-1"
                                      onClick={() => updateAppointmentStatus.mutate({ 
                                        appointmentId: appointment.id, 
                                        status: "in_progress" 
                                      })}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                      <span>呼叫</span>
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="space-x-1"
                                      onClick={() => updateAppointmentStatus.mutate({ 
                                        appointmentId: appointment.id, 
                                        status: "completed" 
                                      })}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      <span>完成</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}