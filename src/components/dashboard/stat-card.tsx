"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  iconColor?: string;
  className?: ReactNode;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor = "#6366f1" }: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.positive
                ? "bg-accent-secondary/15 text-accent-secondary"
                : "bg-accent-danger/15 text-accent-danger"
            )}
          >
            {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-text-primary mb-1">{value}</p>
      <p className="text-sm text-text-muted">{title}</p>
    </div>
  );
}
