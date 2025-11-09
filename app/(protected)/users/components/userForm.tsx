"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { watch } from "fs";
import { Cross, CrossIcon, Plus, X } from "lucide-react";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z, { set } from "zod";
interface UserFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}
const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
});

type FormData = z.infer<typeof formSchema>;

export function UserForm({ open, setOpen, onSuccess }: UserFormProps) {
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [openRoleSelect, setOpenRoleSelect] = useState(false);
  const {
    watch,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form submitted:", data);
      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      reset();
      setOpen(false);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      setIsRolesLoading(true);
      const response = await fetch("/api/roles");
      const data = await response.json();
      setRoles(data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  console.log(errors);
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Plus /> Add User
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-md">
        <div className="mx-auto w-full max-w-lg min-w-lg">
          <DrawerHeader className="shadow">
            <div>
              <DrawerTitle>Add User</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" className="absolute top-4 right-4">
                  <X />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("first_name")}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("last_name")}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">
                    {errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  {...register("password")}
                  placeholder="Enter passsword"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => {
                    setOpenRoleSelect(true);
                  }}
                >
                  {watch("role")
                    ? roles.find((r) => r._id === watch("role"))?.name
                    : "Select Role"}
                </Button>
                <SearchableSelect
                  open={openRoleSelect}
                  setOpen={setOpenRoleSelect}
                  roles={roles}
                  setSelectedStatus={(value) => setValue("role", value!)}
                />
              </div>

              <DrawerFooter className="flex flex-row justify-end absolute bottom-0 right-0 space-x-2 w-full px-4 pb-4 shadow border-t-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
                <Button type="submit">Submit</Button>
              </DrawerFooter>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SearchableSelect({
  open,
  setOpen,
  setSelectedStatus,
  roles,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelectedStatus: (status: string | null) => void;
  roles: Role[];
}) {
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Filter status..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {roles.map((role) => (
            <CommandItem
              key={role._id}
              value={role._id}
              onSelect={(value: string) => {
                setSelectedStatus(
                  roles.find((v) => v._id === value)?._id || null
                );
                setOpen(false);
              }}
            >
              {role.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
