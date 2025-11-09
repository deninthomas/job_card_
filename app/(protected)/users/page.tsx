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
import { User } from "@/types";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserForm } from "./components/userForm";
import { da } from "zod/v4/locales";
import moment from "moment";

export default function UsersPage() {
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
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const filtered = users;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      console.log("data",data);
      setUsers(data.data);
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
    fetchUsers();
  }, [pagination]);

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">
      {/* ---------- PAGE HEADER ---------- */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <UserForm open={isUserFormOpen} setOpen={setIsUserFormOpen} onSuccess={fetchUsers}/>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">User Management</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ---------- SEARCH + FILTER ---------- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user, i) => (
                  <TableRow key={i} className="">
                    <TableCell className="font-medium">{user.first_name}{" "}{user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roleDetails.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{moment(user.createdAt).format("MMM DD, yyyy")}</TableCell>
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
