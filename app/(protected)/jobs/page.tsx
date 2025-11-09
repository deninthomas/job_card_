"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IWorkOrder, User } from "@/types";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { JobCreateSheet } from "./components/jobCreateSheet";

export default function JobsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    filter: {
      role: "all",
    },
  });
  const [jobs, setJobs] = useState<IWorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);

  const filtered = jobs;

  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/work-order");
      const data = await response.json();
      setJobs(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(
      () => setPagination((prev) => ({ ...prev, search })),
      500
    );
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchWorkOrders();
  }, [pagination]);

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <JobCreateSheet
          open={isJobFormOpen}
          setOpen={setIsJobFormOpen}
          onSuccess={fetchWorkOrders}
        />
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Jobs Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ---------- SEARCH + FILTER ---------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                Sort <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ---------- TABLE ---------- */}
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length > 0 ? (
                  filtered.map((workOrder) => (
                    <TableRow key={workOrder._id}>
                      <TableCell className="font-medium">
                        {workOrder.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{workOrder.client?.name}</div>
                          <div className="text-sm text-gray-500">{workOrder.client?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{workOrder.job_info?.type || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            workOrder.job_info?.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : workOrder.job_info?.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {workOrder.job_info?.priority?.toUpperCase() || "LOW"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {workOrder.order_detail?.order_date
                          ? new Date(workOrder.order_detail.order_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{workOrder.total?.grand_total?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                          {workOrder.job_info?.status || "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/jobs/${workOrder._id}`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-8"
                    >
                      No work orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ---------- PAGINATION ---------- */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Showing {filtered.length > 0 ? 1 : 0}–{filtered.length} of {jobs.length} work orders
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
