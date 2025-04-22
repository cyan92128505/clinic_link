import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  subText?: string;
  className?: string;
};

export function StatCard({
  icon,
  iconColor,
  iconBgColor,
  title,
  value,
  subText,
  className
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={cn("h-6 w-6", iconColor)}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-neutral-900">
                    {value}
                  </div>
                  {subText && (
                    <div className="ml-2 text-sm text-neutral-500">
                      {subText}
                    </div>
                  )}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
