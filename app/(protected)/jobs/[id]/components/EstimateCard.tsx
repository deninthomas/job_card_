"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IEstimate } from "@/types";
import { FileText, Calendar, DollarSign, CheckCircle, Clock, XCircle, AlertCircle, Printer } from "lucide-react";

interface EstimateCardProps {
  workOrderId: string;
  onRefresh: () => void;
}

export function EstimateCard({ workOrderId, onRefresh }: EstimateCardProps) {
  const [estimate, setEstimate] = useState<IEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch estimate on mount
  useEffect(() => {
    fetchEstimate();
  }, [workOrderId]);

  const fetchEstimate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/work-order/${workOrderId}/estimate`);
      const data = await response.json();

      if (response.ok) {
        setEstimate(data.data);
      } else if (response.status === 404) {
        setEstimate(null);
      } else {
        throw new Error(data.error || "Failed to fetch estimate");
      }
    } catch (err: any) {
      console.error("Error fetching estimate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this estimate? It cannot be edited after approval.")) {
      return;
    }

    try {
      setActionLoading("approve");
      const response = await fetch(`/api/work-order/${workOrderId}/estimate/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve estimate");
      }

      alert("Estimate approved successfully!");
      fetchEstimate();
      onRefresh();
    } catch (err: any) {
      console.error("Error approving estimate:", err);
      alert(err.message || "Failed to approve estimate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setActionLoading(newStatus);
      const response = await fetch(`/api/work-order/${workOrderId}/estimate/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      alert(`Estimate status updated to ${newStatus}!`);
      fetchEstimate();
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      draft: { icon: Clock, color: "bg-gray-100 text-gray-700", label: "Draft" },
      sent: { icon: AlertCircle, color: "bg-blue-100 text-blue-700", label: "Sent" },
      approved: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
      expired: { icon: Clock, color: "bg-orange-100 text-orange-700", label: "Expired" },
    };

    const config = configs[status as keyof typeof configs] || configs.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading estimate...</p>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) {
    return null; // Don't show card if no estimate exists
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-indigo-50 to-transparent">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          Estimate Details
        </CardTitle>
        {getStatusBadge(estimate.status)}
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Estimate Information */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate Number</p>
            <p className="text-base font-semibold text-gray-900">{estimate.estimate_number}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate Date</p>
            <p className="text-base text-gray-700">
              {new Date(estimate.estimate_date).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</p>
            <p className="text-base text-gray-700">
              {new Date(estimate.valid_until).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</p>
            <p className="text-2xl font-bold text-indigo-600">₹{estimate.grand_total.toFixed(2)}</p>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{estimate.subtotal.toFixed(2)}</span>
          </div>
          {estimate.discounts && estimate.discounts.length > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discounts:</span>
              <span>
                -₹{estimate.discounts.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
              </span>
            </div>
          )}
          {estimate.tax_amount && estimate.tax_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({estimate.tax_percentage}%):</span>
              <span className="font-medium">₹{estimate.tax_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total:</span>
            <span className="text-indigo-600">₹{estimate.grand_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Labour & Materials Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3 bg-blue-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Labour Entries</p>
            <p className="text-2xl font-bold text-blue-600">{estimate.estimated_labour?.length || 0}</p>
            <p className="text-xs text-gray-600">
              Total: ₹{estimate.estimated_labour?.reduce((sum, l) => sum + l.total_cost, 0).toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="border rounded-lg p-3 bg-green-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Material Entries</p>
            <p className="text-2xl font-bold text-green-600">{estimate.estimated_materials?.length || 0}</p>
            <p className="text-xs text-gray-600">
              Total: ₹{estimate.estimated_materials?.reduce((sum, m) => sum + m.amount, 0).toFixed(2) || "0.00"}
            </p>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{estimate.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap border-t pt-4">
          {estimate.status === "draft" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("sent")}
                disabled={!!actionLoading}
              >
                {actionLoading === "sent" ? "Sending..." : "Mark as Sent"}
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={!!actionLoading}
              >
                {actionLoading === "approve" ? "Approving..." : "Approve Estimate"}
              </Button>
            </>
          )}
          {estimate.status === "sent" && (
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={!!actionLoading}
            >
              {actionLoading === "approve" ? "Approving..." : "Approve Estimate"}
            </Button>
          )}
          {estimate.status === "approved" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Approved on {estimate.approved_at ? new Date(estimate.approved_at).toLocaleDateString() : "N/A"}
              </span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

