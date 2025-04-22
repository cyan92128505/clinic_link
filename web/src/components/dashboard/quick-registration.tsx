import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const quickRegistrationSchema = z.object({
  patientId: z.string().min(1, { message: "必須提供病歷號碼" }),
  patientName: z.string().min(1, { message: "必須提供患者姓名" }),
  departmentId: z.string().min(1, { message: "請選擇科別" }),
  doctorId: z.string().min(1, { message: "請選擇醫師" }),
  notes: z.string().optional(),
});

type QuickRegistrationValues = z.infer<typeof quickRegistrationSchema>;

export function QuickRegistration() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  
  // Form setup
  const form = useForm<QuickRegistrationValues>({
    resolver: zodResolver(quickRegistrationSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      departmentId: "",
      doctorId: "",
      notes: "",
    },
  });

  // Get departments and doctors data
  const { data: departments } = useQuery<{id: number, name: string}[]>({
    queryKey: ["/api/departments"],
  });

  const { data: doctors } = useQuery<{id: number, fullName: string, departmentId: number}[]>({
    queryKey: ["/api/doctors"],
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: QuickRegistrationValues) => {
      // Create a walk-in appointment
      const appointmentData = {
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        roomId: 1, // This would be dynamic based on selected doctor
        appointmentNumber: `B-${Math.floor(Math.random() * 100)}`, // This would be generated server-side
        type: "walk_in",
        status: "checked_in",
        notes: data.notes
      };

      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      // Clear form and refetch data
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "掛號成功",
        description: "患者已成功掛號",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "掛號失敗",
        description: error.message,
      });
    },
  });

  // Search for a patient by ID
  const handleSearch = async () => {
    if (!searchValue) return;
    
    try {
      // This would make an API call to search for the patient
      const response = await fetch(`/api/patients?patientId=${searchValue}`);
      if (!response.ok) throw new Error("找不到此病歷號碼的患者");
      
      const patient = await response.json();
      if (patient) {
        form.setValue("patientId", patient.id.toString());
        form.setValue("patientName", patient.fullName);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "查詢失敗",
        description: "找不到此病歷號碼的患者",
      });
    }
  };

  // Filter doctors by selected department
  const filteredDoctors = form.watch("departmentId") 
    ? doctors?.filter(doctor => doctor.departmentId === parseInt(form.watch("departmentId")))
    : doctors;

  // Handle form submission
  const onSubmit = (data: QuickRegistrationValues) => {
    createAppointment.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>快速掛號</CardTitle>
        <CardDescription>
          為現場病患建立新掛號
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>病歷號</FormLabel>
                      <div className="relative rounded-md shadow-sm">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="輸入病歷號碼"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                          />
                        </FormControl>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleSearch}
                            className="h-5 w-5 text-neutral-400 hover:text-neutral-600"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>患者姓名</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="輸入姓名" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>科別</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇科別" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>醫師</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch("departmentId")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="請選擇醫師" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredDoctors?.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備註</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="輸入備註事項" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                清除
              </Button>
              <Button
                type="submit"
                className="ml-3"
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? "處理中..." : "建立掛號"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
