import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./Table";
import { formatCurrency, formatNumber } from "../../lib/utils";

export interface StatItem {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  label: string;
  value: number;
  formatType?: "number" | "currency";
}

interface StatsSectionProps {
  stats: StatItem[];
  className?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  className = "",
}) => {
  const formatValue = (value: number, formatType: "number" | "currency" = "number") => {
    return formatType === "currency" ? formatCurrency(value) : formatNumber(value);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.iconBgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatValue(stat.value, stat.formatType)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
