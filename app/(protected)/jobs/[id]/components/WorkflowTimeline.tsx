"use client";

import { CheckCircle2, Clock, Package, ThumbsUp, Truck, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineStage {
  status: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  date?: string;
  user?: string;
}

interface WorkflowTimelineProps {
  currentStatus: string;
  orderDate?: string;
  checkedBy?: string;
  checkedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  completedBy?: string;
  completedAt?: string;
  deliveredBy?: string;
  deliveredAt?: string;
  onCheck?: () => void;
  onApprove?: () => void;
  onComplete?: () => void;
  onDeliver?: () => void;
  actionLoading?: string | null;
}

export function WorkflowTimeline({
  currentStatus = "pending",
  orderDate,
  checkedBy,
  checkedAt,
  approvedBy,
  approvedAt,
  completedBy,
  completedAt,
  deliveredBy,
  deliveredAt,
  onCheck,
  onApprove,
  onComplete,
  onDeliver,
  actionLoading,
}: WorkflowTimelineProps) {
  const stages: TimelineStage[] = [
    {
      status: "pending",
      label: "Order Received",
      icon: Circle,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      date: orderDate,
    },
    {
      status: "checked",
      label: "Quality Checked",
      icon: CheckCircle2,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      date: checkedAt,
      user: checkedBy,
    },
    {
      status: "approved",
      label: "Approved",
      icon: ThumbsUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      date: approvedAt,
      user: approvedBy,
    },
    {
      status: "completed",
      label: "Completed",
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-100",
      date: completedAt,
      user: completedBy,
    },
    {
      status: "delivered",
      label: "Delivered",
      icon: Truck,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      date: deliveredAt,
      user: deliveredBy,
    },
  ];

  const statusOrder = ["pending", "checked", "approved", "completed", "delivered"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const isStageCompleted = (stageIndex: number) => {
    return stageIndex <= currentIndex;
  };

  const isStageCurrent = (stageIndex: number) => {
    return stageIndex === currentIndex;
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative py-8">
      {/* Timeline Line */}
      <div className="absolute top-14 left-0 right-0 h-0.5 bg-gray-200 hidden md:block" />
      <div
        className="absolute top-14 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 hidden md:block"
        style={{
          width: `${(currentIndex / (stages.length - 1)) * 100}%`,
        }}
      />

      {/* Timeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const completed = isStageCompleted(index);
          const current = isStageCurrent(index);

          return (
            <div
              key={stage.status}
              className={cn(
                "relative flex flex-col items-center text-center transition-all duration-300",
                completed ? "opacity-100" : "opacity-40"
              )}
            >
              {/* Icon Container */}
              <div
                className={cn(
                  "relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white shadow-lg",
                  completed ? stage.bgColor : "bg-gray-100",
                  current && "ring-4 ring-offset-2",
                  current && completed && "ring-blue-500",
                  completed && !current && "ring-2 ring-offset-2 ring-gray-300"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-300",
                    completed ? stage.color : "text-gray-400",
                    current && "animate-pulse"
                  )}
                />
              </div>

              {/* Stage Label */}
              <div className="mt-3 space-y-1">
                <p
                  className={cn(
                    "font-semibold text-sm transition-all duration-300",
                    completed ? "text-gray-900" : "text-gray-400",
                    current && "text-blue-600"
                  )}
                >
                  {stage.label}
                </p>

                {/* Status Badge */}
                {current && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                    In Progress
                  </span>
                )}

                {completed && !current && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                )}

                {/* Date and User Info */}
                {completed && stage.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(stage.date)}
                  </p>
                )}

                {completed && stage.user && (
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    by {stage.user}
                  </p>
                )}

                {/* Action Button for Current Stage */}
                {current && !completed && (
                  <div className="mt-3">
                    {stage.status === "checked" && onCheck && (
                      <Button
                        size="sm"
                        onClick={onCheck}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 shadow-lg"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {actionLoading === "check" ? "Checking..." : "Check Order"}
                      </Button>
                    )}
                    {stage.status === "approved" && onApprove && (
                      <Button
                        size="sm"
                        onClick={onApprove}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 shadow-lg bg-yellow-600 hover:bg-yellow-700"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {actionLoading === "approve" ? "Approving..." : "Approve"}
                      </Button>
                    )}
                    {stage.status === "completed" && onComplete && (
                      <Button
                        size="sm"
                        onClick={onComplete}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 shadow-lg bg-green-600 hover:bg-green-700"
                      >
                        <Package className="h-3.5 w-3.5" />
                        {actionLoading === "complete" ? "Completing..." : "Complete"}
                      </Button>
                    )}
                    {stage.status === "delivered" && onDeliver && (
                      <Button
                        size="sm"
                        onClick={onDeliver}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-1.5 shadow-lg bg-purple-600 hover:bg-purple-700"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        {actionLoading === "deliver" ? "Delivering..." : "Deliver"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Line for Mobile */}
              {index < stages.length - 1 && (
                <div className="md:hidden absolute left-7 top-14 w-0.5 h-16 bg-gray-200">
                  {completed && (
                    <div className="w-full bg-gradient-to-b from-blue-500 to-green-500 h-full transition-all duration-1000" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Percentage */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Progress: {Math.round((currentIndex / (stages.length - 1)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

