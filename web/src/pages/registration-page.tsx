import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/ui/top-navigation";
import { QuickRegistration } from "@/components/dashboard/quick-registration";
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
import { PatientForm } from "@/components/patients/patient-form";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Appointment } from "@/models";
import { formatDate, formatTime, getStatusInfo } from "@/lib/utils";
import { 
  ClipboardList, 
  UserPlus, 
  CalendarPlus, 
  ClipboardCheck, 
  Clock,
  CheckCircle,
  Loader2 
} from "lucide-react";

export default function RegistrationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("walk-in");

  // Fetch today's appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/v1/appointments", { date: new Date().toISOString().split('T')[0] }],
  });

  // Filter appointments by type (walk-in or pre-booked)
  const filteredAppointments = appointments?.filter(appointment => 
    activeTab === "walk-in" 
      ? appointment.source === "WALK_IN" 
      : appointment.source != "WALK_IN"
  );

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
                <h1 className="text-2xl font-semibold text-neutral-800">掛號系統</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  管理現場掛號與預約掛號
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>新增患者</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>新增患者</DialogTitle>
                      <DialogDescription>
                        創建新的患者記錄
                      </DialogDescription>
                    </DialogHeader>
                    <PatientForm onSuccess={() => setShowPatientDialog(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
                  <DialogTrigger asChild>
                    <Button className="space-x-2">
                      <CalendarPlus className="h-4 w-4" />
                      <span>預約掛號</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                      <DialogTitle>預約掛號</DialogTitle>
                      <DialogDescription>
                        為患者建立新預約
                      </DialogDescription>
                    </DialogHeader>
                    <AppointmentForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Registration forms and list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick registration form */}
              <div className="lg:col-span-1">
                <QuickRegistration />
              </div>

              {/* Today's registrations */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>今日掛號列表</CardTitle>
                    <CardDescription>
                      今日所有掛號與預約資訊
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Tabs defaultValue="walk-in" onValueChange={setActiveTab}>
                      <div className="border-b border-neutral-200 px-6 py-3">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="walk-in" className="space-x-2">
                            <ClipboardCheck className="h-4 w-4" />
                            <span>現場掛號</span>
                          </TabsTrigger>
                          <TabsTrigger value="pre-booked" className="space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>預約掛號</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="walk-in" className="pt-0">
                        {isLoading ? (
                          <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-border" />
                          </div>
                        ) : !filteredAppointments || filteredAppointments.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-neutral-500">今日無現場掛號記錄</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>掛號號碼</TableHead>
                                  <TableHead>患者資訊</TableHead>
                                  <TableHead>到達時間</TableHead>
                                  <TableHead>診間/醫師</TableHead>
                                  <TableHead>狀態</TableHead>
                                  <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAppointments?.map((appointment) => {
                                  const { color, text } = getStatusInfo(appointment.status);
                                  
                                  return (
                                    <TableRow key={appointment.id}>
                                      <TableCell className="font-medium text-accent">
                                        {appointment.appointmentNumber}
                                      </TableCell>
                                      <TableCell>
                                        患者名稱 {/* Would display patient name from joined data */}
                                        <div className="text-xs text-neutral-500">
                                          ID: {appointment.patientId}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {formatTime(appointment.checkinTime)}
                                      </TableCell>
                                      <TableCell>
                                        診間 {appointment.roomId}
                                        <div className="text-xs text-neutral-500">
                                          醫師 {appointment.doctorId}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className={color}>
                                          {text}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="space-x-2">
                                          <CheckCircle className="h-4 w-4" />
                                          <span>報到</span>
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="pre-booked" className="pt-0">
                        {isLoading ? (
                          <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-border" />
                          </div>
                        ) : !filteredAppointments || filteredAppointments.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-neutral-500">今日無預約掛號記錄</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>預約號碼</TableHead>
                                  <TableHead>患者資訊</TableHead>
                                  <TableHead>預約時間</TableHead>
                                  <TableHead>診間/醫師</TableHead>
                                  <TableHead>狀態</TableHead>
                                  <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAppointments?.map((appointment) => {
                                  const { color, text } = getStatusInfo(appointment.status);
                                  
                                  return (
                                    <TableRow key={appointment.id}>
                                      <TableCell className="font-medium text-primary">
                                        {appointment.appointmentNumber}
                                      </TableCell>
                                      <TableCell>
                                        患者名稱 {/* Would display patient name from joined data */}
                                        <div className="text-xs text-neutral-500">
                                          ID: {appointment.patientId}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {formatTime(appointment.appointmentTime)}
                                      </TableCell>
                                      <TableCell>
                                        診間 {appointment.roomId}
                                        <div className="text-xs text-neutral-500">
                                          醫師 {appointment.doctorId}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className={color}>
                                          {text}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="space-x-2">
                                          <CheckCircle className="h-4 w-4" />
                                          <span>報到</span>
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
