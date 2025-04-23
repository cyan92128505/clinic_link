import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/ui/top-navigation";
import { AppointmentForm } from "@/components/appointments/appointment-form";
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
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/models";
import { formatDate, formatTime, getStatusInfo } from "@/lib/utils";
import { Search, FileEdit, Trash2, CalendarPlus, Loader2 } from "lucide-react";

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/v1/appointments", { date: selectedDate }],
  });

  // Filter appointments based on search and status
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = searchQuery === "" || 
      appointment.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-2xl font-semibold text-neutral-800">預約管理</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  管理所有預約掛號與現場掛號
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button 
                  className="space-x-2"
                  onClick={() => setShowForm(!showForm)}
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>{showForm ? "隱藏表單" : "新增預約"}</span>
                </Button>
              </div>
            </div>

            {/* Appointment form (toggleable) */}
            {showForm && (
              <div className="mb-6">
                <AppointmentForm />
              </div>
            )}

            {/* Appointments list */}
            <Card>
              <CardHeader>
                <CardTitle>預約列表</CardTitle>
                <CardDescription>
                  查看和管理所有預約
                </CardDescription>
              </CardHeader>

              {/* Filter controls */}
              <div className="px-6 py-3 border-b border-neutral-200 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="搜尋預約號碼..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="篩選狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有狀態</SelectItem>
                    <SelectItem value="scheduled">已預約</SelectItem>
                    <SelectItem value="checked_in">等候中</SelectItem>
                    <SelectItem value="in_progress">看診中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                    <SelectItem value="no_show">未到診</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-border" />
                  </div>
                ) : filteredAppointments?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">無預約資料</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>預約編號</TableHead>
                          <TableHead>患者資訊</TableHead>
                          <TableHead>預約時間</TableHead>
                          <TableHead>診間/醫師</TableHead>
                          <TableHead>狀態</TableHead>
                          <TableHead>預約類型</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments?.map((appointment) => {
                          const { color, text } = getStatusInfo(appointment.status);
                          
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">
                                {appointment.appointmentNumber}
                              </TableCell>
                              <TableCell>
                                患者名稱 {/* Would display patient name from joined data */}
                                <div className="text-xs text-neutral-500">
                                  ID: {appointment.patientId}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(appointment.scheduledTime)}
                                <div className="text-xs text-neutral-500">
                                  {formatTime(appointment.scheduledTime)}
                                </div>
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
                              <TableCell>
                                {appointment.type === "pre_booked" ? "預約掛號" : "現場掛號"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="icon">
                                    <FileEdit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
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
        </main>
      </div>
    </div>
  );
}
