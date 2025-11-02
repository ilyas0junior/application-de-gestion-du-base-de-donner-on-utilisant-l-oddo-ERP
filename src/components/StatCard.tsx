import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendLabel, className }: StatCardProps) => {
  const isPositive = trend?.startsWith('+');
  
  return (
    <Card className={cn("transition-shadow hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend} {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
