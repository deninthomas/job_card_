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
import { Role, User } from "@/types";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { RoleForm } from "./components/roleForm";
import moment from "moment";

export default function RolesPage() {
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);

  const filtered = roles;

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/roles");
      const data = await response.json();
      console.log;
      setRoles(data.data);
    } catch (error) {
      console.error("Error fetching Roles:", error);
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
    fetchRoles();
  }, [pagination]);

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
        <RoleForm
          open={isRoleFormOpen}
          setOpen={setIsRoleFormOpen}
          onSuccess={fetchRoles}
        />
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Role Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ---------- SEARCH + FILTER ---------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
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
            <Table className="border-separate border-spacing-y-3 p-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((role, i) => (
                  <TableRow key={i} className="">
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell className="capitalize">
                      {role.modules.map((module) => module.module).join(" ,")}
                    </TableCell>
                    <TableCell className="capitalize">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          role.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {role.status}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {role?.created_by || "N/A"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {moment(role.createdAt).format("MMM DD, YYYY")}
                    </TableCell>
                    <TableCell className="capitalize">
                      <Button variant="ghost" size="icon">
                        <MoreVertical />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ---------- PAGINATION ---------- */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">Showing 1–4 of 24 users</p>
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
