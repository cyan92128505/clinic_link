import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type NextAppointment = {
  id: number;
  appointmentNumber: string;
  patientName: string;
  roomName: string;
  doctorName: string;
  type: "pre_booked" | "walk_in";
  scheduledTime?: string;
  arrivalTime?: string;
  estimatedWaitTime: number;
};

export function NextAppointments() {
  // This would fetch the next appointments data from the API
  const { data: nextAppointments, isLoading } = useQuery<NextAppointment[]>({
    queryKey: ["/api/v1/appointments", { status: "checked_in" }],
  });

  const getAppointmentTypeClass = (type: string) => {
    return type === "pre_booked" 
      ? "bg-primary-light/10 text-primary" 
      : "bg-accent-light/10 text-accent";
  };

  const getAppointmentTypeText = (type: string) => {
    return type === "pre_booked" ? "預約" : "現場掛號";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>下一位病患</CardTitle>
        <CardDescription>
          依照看診順序排列的即將看診病患
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : nextAppointments?.length === 0 ? (
          <div className="text-center p-6 text-neutral-500">
            目前沒有等候中的病患
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {nextAppointments?.map((appointment) => (
              <li key={appointment.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-primary font-medium",
                        appointment.type === "pre_booked" ? "bg-primary-light/15" : "bg-accent-light/15"
                      )}>
                        {appointment.appointmentNumber}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {appointment.patientName}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {appointment.roomName} - {appointment.doctorName}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getAppointmentTypeClass(appointment.type)
                      )}>
                        {getAppointmentTypeText(appointment.type)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-neutral-500">
                        {appointment.type === "pre_booked" ? (
                          <>
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                            {appointment.scheduledTime ? new Date(appointment.scheduledTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '--:--'} 預約
                          </>
                        ) : (
                          <>
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                            {appointment.arrivalTime ? new Date(appointment.arrivalTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : '--:--'} 到達
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                      <p>
                        預估等候: <span className="text-neutral-900 font-medium">{appointment.estimatedWaitTime} 分鐘</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
