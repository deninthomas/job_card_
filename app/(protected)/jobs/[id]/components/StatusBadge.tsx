"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export function StatusBadge({ status = "pending", className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "checked":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "delivered":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  );
}

