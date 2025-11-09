"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IWorkOrder } from "@/types";
import { StatusBadge } from "./components/StatusBadge";
import { AddLabourDialog } from "./components/AddLabourDialog";
import { AddMaterialDialog } from "./components/AddMaterialDialog";
import { WorkflowTimeline } from "./components/WorkflowTimeline";
import { EstimateDialog } from "./components/EstimateDialog";
import { EstimateCard } from "./components/EstimateCard";
import { FinalStatementCard } from "./components/FinalStatementCard";
import {
  ArrowLeft,
  CheckCircle,
  ThumbsUp,
  Package,
  Truck,
  Plus,
  Calendar,
  User,
  Clock,
  DollarSign,
  Building2,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params.id as string;

  const [workOrder, setWorkOrder] = useState<IWorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [labourDialogOpen, setLabourDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchWorkOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/work-order/${workOrderId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch work order");
      }
      
      setWorkOrder(data.data);
    } catch (error: any) {
      console.error("Error fetching work order:", error);
      alert(error.message || "Failed to fetch work order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId]);

  const handleStatusAction = async (action: string, endpoint: string) => {
    try {
      setActionLoading(action);

      const response = await fetch(`/api/work-order/${workOrderId}/${endpoint}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} work order`);
      }

      alert(data.message);
      fetchWorkOrder();
    } catch (error: any) {
      console.error(`Error ${action} work order:`, error);
      alert(error.message || `Failed to ${action} work order`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Work order not found</p>
          <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  const currentStatus = workOrder.job_info?.status || "pending";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push("/jobs")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {workOrder.order_number}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Work Order Details
                </p>
              </div>
            </div>
            <StatusBadge status={currentStatus} className="text-base px-4 py-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Workflow Timeline */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <WorkflowTimeline
              currentStatus={currentStatus}
              orderDate={workOrder.order_detail?.order_date}
              checkedBy={workOrder.job_info?.checked_by}
              checkedAt={workOrder.job_info?.checked_at}
              approvedBy={workOrder.approval?.approved_by}
              approvedAt={workOrder.approval?.approved_at}
              completedBy={workOrder.job_info?.completed_by}
              completedAt={workOrder.job_info?.completed_at}
              deliveredBy={workOrder.approval?.delivered_by}
              deliveredAt={workOrder.approval?.delivered_at}
              onCheck={() => handleStatusAction("check", "check")}
              onApprove={() => handleStatusAction("approve", "approve")}
              onComplete={() => handleStatusAction("complete", "complete")}
              onDeliver={() => handleStatusAction("deliver", "deliver")}
              actionLoading={actionLoading}
            />
          </CardContent>
        </Card>

        {/* Estimate Section */}
        {workOrder.has_estimate ? (
          <EstimateCard workOrderId={workOrderId} onRefresh={fetchWorkOrder} />
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-indigo-50 to-transparent">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                Estimate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">No estimate created yet</p>
              <Button onClick={() => setEstimateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Estimate
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Final Statement (show only if work order is completed) */}
        {(currentStatus === "completed" || currentStatus === "delivered") && (
          <FinalStatementCard workOrderId={workOrderId} />
        )}

        {/* Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                <p className="text-base font-semibold text-gray-900">{workOrder.client?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Code</p>
                <p className="text-base font-mono text-gray-700">{workOrder.client?.code}</p>
              </div>
              {workOrder.client?.contact_info?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{workOrder.client.contact_info.phone}</span>
                </div>
              )}
              {workOrder.client?.contact_info?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{workOrder.client.contact_info.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workOrder.order_detail?.received_by && (
                <div className="flex items-start gap-3 pb-3 border-b">
                  <User className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Received By</p>
                    <p className="text-sm font-medium">{workOrder.order_detail.received_by}</p>
                  </div>
                </div>
              )}
              {workOrder.order_detail?.order_date && (
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-medium">
                      {new Date(workOrder.order_detail.order_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {workOrder.order_detail?.job_start_date && (
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="text-sm font-medium">
                      {new Date(workOrder.order_detail.job_start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {workOrder.order_detail?.date_promised && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Promised Date</p>
                    <p className="text-sm font-medium">
                      {new Date(workOrder.order_detail.date_promised).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workOrder.job_info?.priority && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      workOrder.job_info.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : workOrder.job_info.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {workOrder.job_info.priority.toUpperCase()}
                  </span>
                </div>
              )}
              {workOrder.job_info?.type && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</p>
                  <p className="text-base font-semibold text-gray-900">{workOrder.job_info.type}</p>
                </div>
              )}
              {workOrder.job_info?.description && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{workOrder.job_info.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Labour Entries */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-xl">Labour Entries</CardTitle>
            <Button
              size="sm"
              onClick={() => setLabourDialogOpen(true)}
              className="flex items-center gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Labour
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {workOrder.labour_entry && workOrder.labour_entry.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Cost/Hour</TableHead>
                  <TableHead>Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrder.labour_entry.map((entry: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      {entry.date ? new Date(entry.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {entry.employee
                        ? `${entry.employee.first_name} ${entry.employee.last_name}`
                        : "Unknown"}
                    </TableCell>
                    <TableCell>{entry.description || "-"}</TableCell>
                    <TableCell>{entry.hours || 0}</TableCell>
                    <TableCell>₹{(entry.cost_per_hour || 0).toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      ₹{(entry.total_cost || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No labour entries yet</p>
                <p className="text-sm text-gray-400">Click "Add Labour" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Material Entries */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-green-50 to-transparent">
            <CardTitle className="text-xl">Material Entries</CardTitle>
            <Button
              size="sm"
              onClick={() => setMaterialDialogOpen(true)}
              className="flex items-center gap-2 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {workOrder.material_entry && workOrder.material_entry.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrder.material_entry.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.description || "-"}</TableCell>
                    <TableCell>{entry.quantity || 0}</TableCell>
                    <TableCell>{entry.unit || "-"}</TableCell>
                    <TableCell>₹{(entry.unit_price || 0).toFixed(2)}</TableCell>
                    <TableCell>{entry.supplier || "-"}</TableCell>
                    <TableCell className="font-medium">
                      ₹{(entry.amount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No material entries yet</p>
                <p className="text-sm text-gray-400">Click "Add Material" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="text-white text-xl">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-100">
                  <Clock className="h-4 w-4" />
                  <p className="text-sm font-medium">Labour Hours</p>
                </div>
                <p className="text-3xl font-bold">
                  {workOrder.total?.total_labour_hours?.toFixed(1) || "0.0"}
                </p>
                <p className="text-xs text-blue-200">Total hours worked</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-100">
                  <User className="h-4 w-4" />
                  <p className="text-sm font-medium">Labour Cost</p>
                </div>
                <p className="text-3xl font-bold">
                  ₹{workOrder.total?.total_labour_cost?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-blue-200">Employee wages</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-100">
                  <Package className="h-4 w-4" />
                  <p className="text-sm font-medium">Material Cost</p>
                </div>
                <p className="text-3xl font-bold">
                  ₹{workOrder.total?.total_material_cost?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-blue-200">Materials used</p>
              </div>
              <div className="space-y-2 lg:border-l border-blue-400 lg:pl-6">
                <div className="flex items-center gap-2 text-blue-100">
                  <DollarSign className="h-4 w-4" />
                  <p className="text-sm font-medium">Grand Total</p>
                </div>
                <p className="text-4xl font-bold">
                  ₹{workOrder.total?.grand_total?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-blue-200">Total project cost</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Information */}
        {(workOrder.approval?.approved_by || workOrder.approval?.remarks) && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-yellow-50 to-transparent">
              <CardTitle className="text-xl flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-yellow-600" />
                Approval Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {workOrder.approval.approved_by && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <User className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</p>
                    <p className="text-base font-semibold text-gray-900">{workOrder.approval.approved_by}</p>
                  </div>
                </div>
              )}
              {workOrder.approval.approved_at && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Date</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(workOrder.approval.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {workOrder.approval.remarks && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</p>
                    <p className="text-base text-gray-700 leading-relaxed">{workOrder.approval.remarks}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <AddLabourDialog
          open={labourDialogOpen}
          onClose={() => setLabourDialogOpen(false)}
          workOrderId={workOrderId}
          onSuccess={fetchWorkOrder}
        />

        <AddMaterialDialog
          open={materialDialogOpen}
          onClose={() => setMaterialDialogOpen(false)}
          workOrderId={workOrderId}
          onSuccess={fetchWorkOrder}
        />

        {workOrder && (
          <EstimateDialog
            open={estimateDialogOpen}
            onClose={() => setEstimateDialogOpen(false)}
            workOrder={workOrder}
            onSuccess={fetchWorkOrder}
          />
        )}
      </div>
    </div>
  );
}

