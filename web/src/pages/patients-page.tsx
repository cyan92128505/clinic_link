import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavigation } from "@/components/ui/top-navigation";
import { PatientForm } from "@/components/patients/patient-form";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/models";
import { formatDate } from "@/lib/utils";
import { Search, UserPlus, FileEdit, Trash2, FilePlus, Loader2 } from "lucide-react";

export default function PatientsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Fetch patients
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Filter patients based on search
  const filteredPatients = patients?.filter(patient => 
    searchQuery === "" || 
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchQuery))
  );

  // Handle edit patient
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowFormDialog(true);
  };

  // Handle close form dialog
  const handleCloseForm = () => {
    setShowFormDialog(false);
    setSelectedPatient(null);
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
                <h1 className="text-2xl font-semibold text-neutral-800">患者管理</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  查看和管理所有患者資料
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
                  <DialogTrigger asChild>
                    <Button className="space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>新增患者</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>{selectedPatient ? "編輯患者" : "新增患者"}</DialogTitle>
                      <DialogDescription>
                        {selectedPatient ? "更新患者資料" : "創建新的患者記錄"}
                      </DialogDescription>
                    </DialogHeader>
                    <PatientForm 
                      patient={selectedPatient as any} 
                      onSuccess={handleCloseForm} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Patients list */}
            <Card>
              <CardHeader>
                <CardTitle>患者列表</CardTitle>
                <CardDescription>
                  查看和管理所有患者資料
                </CardDescription>
              </CardHeader>

              {/* Search control */}
              <div className="px-6 py-3 border-b border-neutral-200">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="搜尋患者姓名、病歷號碼、電話..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-border" />
                  </div>
                ) : filteredPatients?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">無患者資料</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>病歷號碼</TableHead>
                          <TableHead>姓名</TableHead>
                          <TableHead>聯絡資訊</TableHead>
                          <TableHead>性別</TableHead>
                          <TableHead>出生日期</TableHead>
                          <TableHead>註冊日期</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients?.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">
                              {patient.patientId}
                            </TableCell>
                            <TableCell>
                              {patient.fullName}
                            </TableCell>
                            <TableCell>
                              {patient.phone}
                              {patient.email && (
                                <div className="text-xs text-neutral-500">
                                  {patient.email}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {patient.gender === "male" ? "男" : 
                               patient.gender === "female" ? "女" : 
                               patient.gender || "--"}
                            </TableCell>
                            <TableCell>
                              {formatDate(patient.dateOfBirth)}
                            </TableCell>
                            <TableCell>
                              {formatDate(patient.registrationDate)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleEditPatient(patient)}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                  <FilePlus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
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
          </div>
        </main>
      </div>
    </div>
  );
}
