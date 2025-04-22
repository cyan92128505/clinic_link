import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const patientFormSchema = z.object({
  patientId: z.string().min(1, { message: "必須提供病歷號碼" }),
  fullName: z.string().min(1, { message: "必須提供患者姓名" }),
  phone: z.string().min(1, { message: "必須提供聯絡電話" }),
  email: z.string().email({ message: "請輸入有效的電子郵件" }).optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

type PatientFormProps = {
  patient?: PatientFormValues;
  onSuccess?: () => void;
};

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!patient;
  
  // Form setup
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient || {
      patientId: "",
      fullName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      medicalHistory: "",
    },
  });

  // Create/update patient mutation
  const patientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      if (isEditing) {
        // Update patient
        const response = await apiRequest("PUT", `/api/patients/${patient.patientId}`, data);
        return response.json();
      } else {
        // Create patient
        const response = await apiRequest("POST", "/api/patients", data);
        return response.json();
      }
    },
    onSuccess: () => {
      // Clear form and refetch data
      if (!isEditing) {
        form.reset();
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      
      toast({
        title: isEditing ? "更新成功" : "建立成功",
        description: isEditing ? "患者資料已更新" : "新患者已建立",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: isEditing ? "更新失敗" : "建立失敗",
        description: error.message,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PatientFormValues) => {
    patientMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "編輯患者資料" : "新增患者"}</CardTitle>
        <CardDescription>
          {isEditing ? "更新現有患者的個人資料" : "建立新的患者記錄"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>病歷號碼</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="輸入病歷號碼" 
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="輸入姓名" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>聯絡電話</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="輸入聯絡電話" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電子郵件</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="輸入電子郵件" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出生日期</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性別</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇性別" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>住址</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="輸入住址" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>病史記錄</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="輸入病史記錄" 
                      rows={3} 
                    />
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
                {isEditing ? "還原" : "清除"}
              </Button>
              <Button
                type="submit"
                className="ml-3"
                disabled={patientMutation.isPending}
              >
                {patientMutation.isPending 
                  ? "處理中..." 
                  : isEditing ? "更新患者" : "建立患者"
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
