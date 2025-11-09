"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { get } from "http";
import { Cross, CrossIcon, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z, { set } from "zod";
interface UserFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

interface IAction {
  name: string;
  key: string;
}

interface IModule {
  _id: string;
  name: string;
  key: string;
  actions: IAction[];
}

const formSchema = z.object({
  name: z.string().min(1, "First name is required"),
  description: z.string().min(1, "Last name is required"),
  modules: z.record(z.string(), z.array(z.string())),
});

type FormData = z.infer<typeof formSchema>;

export function RoleForm({ open, setOpen, onSuccess }: UserFormProps) {
  const [modules, setModules] = useState<IModule[]>([]);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const {
    watch,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting, },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      modules: {},
    },
  });

  console.log(getValues());

  const togglePermission = (moduleKey: string, actionKey: string) => {
    const current = watch("modules") || {};
    const modulePermissions = current[moduleKey] || [];
    const updated = modulePermissions.includes(actionKey)
      ? modulePermissions.filter((a) => a !== actionKey)
      : [...modulePermissions, actionKey];

    setValue("modules", { ...current, [moduleKey]: updated });
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    const payload = {
      name: data.name,
      description: data.description,
      modules: Object.entries(data.modules).map(([key, actions]) => ({
        module: key,
        actions: actions,
      })),
    };

    await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    // You can make an API call here
    reset();
    setOpen(false);
  };

  const fetchModules = async () => {
    try {
      setIsModuleLoading(true);
      const response = await fetch("/api/modules");
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setIsModuleLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);


  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Plus /> Add Role
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-lg">
        <div className="mx-auto w-full max-w-lg min-w-lg">
          <DrawerHeader className="shadow">
            <div>
              <DrawerTitle>Add Role</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" className="absolute top-4 right-4">
                  <X />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* ---------- Role Info ---------- */}
              <div className="grid gap-4 md:grid-cols-1 space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Admin"
                    {...register("name", { required: true })}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Short description"
                    {...register("description")}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* ---------- Permissions ---------- */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Module Permissions</h3>

                {modules.map((module) => {
                  const selected = watch("modules")?.[module.key] || [];
                  return (
                    <div
                      key={module._id}
                      className="border border-gray-100 rounded-xl p-4 shadow-sm"
                    >
                      <h4 className="font-medium mb-2">{module.name}</h4>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 space-y-2">
                        {module.actions.map((action) => (
                          <label
                            key={action.key}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={selected.includes(action.key)}
                              onCheckedChange={() =>
                                togglePermission(module.key, action.key)
                              }
                            />
                            <span className="text-sm">{action.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <DrawerFooter className="flex flex-row justify-end absolute bottom-0 right-0 space-x-2 w-full px-4 pb-4 shadow border-t-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
                <Button type="submit">Create Role</Button>
              </DrawerFooter>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
