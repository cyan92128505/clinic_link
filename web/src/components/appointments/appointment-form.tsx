import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: "必須提供病歷號碼" }),
  patientName: z.string().min(1, { message: "必須提供患者姓名" }),
  departmentId: z.string().min(1, { message: "請選擇科別" }),
  doctorId: z.string().min(1, { message: "請選擇醫師" }),
  type: z.enum(["pre_booked", "walk_in"], { required_error: "請選擇掛號類型" }),
  date: z.date({ required_error: "請選擇日期" }),
  timeSlot: z.string().min(1, { message: "請選擇時段" }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export function AppointmentForm() {
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  
  // Form setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      patientName: "",
      departmentId: "",
      doctorId: "",
      type: "pre_booked",
      date: new Date(),
      timeSlot: "",
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
    mutationFn: async (data: AppointmentFormValues) => {
      // Format date and time
      const scheduledTime = new Date(data.date);
      const [hours, minutes] = data.timeSlot.split(':').map(Number);
      scheduledTime.setHours(hours, minutes);

      // Create appointment data
      const appointmentData = {
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        roomId: 1, // This would be dynamic based on selected doctor
        appointmentNumber: `A-${Math.floor(Math.random() * 100)}`, // This would be generated server-side
        scheduledTime: scheduledTime.toISOString(),
        type: data.type,
        status: "scheduled",
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
        title: "預約成功",
        description: "患者已成功預約掛號",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "預約失敗",
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

  // Generate time slots (30-minute intervals from 8:00 to 17:30)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Handle form submission
  const onSubmit = (data: AppointmentFormValues) => {
    createAppointment.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>預約掛號</CardTitle>
        <CardDescription>
          建立患者預約掛號
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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>掛號類型</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pre_booked" id="pre_booked" />
                        <Label htmlFor="pre_booked">預約掛號</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="walk_in" id="walk_in" />
                        <Label htmlFor="walk_in">現場掛號</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>日期</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>選擇日期</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>時段</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇時段" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {createAppointment.isPending ? "處理中..." : "建立預約"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
