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
import { Employee } from "@/types";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmployeeForm } from "./components/employeeForm";
import moment from "moment";

export default function EmployeesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    filter: {
      status: "all",
    },
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter((emp) => {
    if (filterStatus === "All") return true;
    return emp.status === filterStatus;
  });

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.append("q", search);
      }
      const response = await fetch(`/api/employees?${queryParams.toString()}`);
      const data = await response.json();
      setEmployees(data.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
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
    fetchEmployees();
  }, [pagination]);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEmployeeFormOpen(true);
  };

  const handleFormClose = () => {
    setIsEmployeeFormOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <EmployeeForm
          open={isEmployeeFormOpen}
          setOpen={setIsEmployeeFormOpen}
          onSuccess={fetchEmployees}
          employee={editingEmployee}
          onClose={handleFormClose}
        />
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Employee Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ---------- SEARCH + FILTER ---------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
            <Table className="border-separate border-spacing-y-3 p-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Minimum Wage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500"
                    >
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((employee) => (
                    <TableRow key={employee._id} className="">
                      <TableCell className="font-medium">
                        {employee.employee_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone || "-"}</TableCell>
                      <TableCell>${employee.minimum_wage.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            employee.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {moment(employee.createdAt).format("MMM DD, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ---------- PAGINATION ---------- */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} employee(s)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

