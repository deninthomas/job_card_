"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, X } from "lucide-react";
import JobForm from "./jobForm";

interface JobCreateSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JobCreateSheet({
  open,
  setOpen,
  onSuccess,
}: JobCreateSheetProps) {
  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Plus /> Add Work Order
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-md min-h-11/12 flex flex-col">
        <div className="mx-auto w-full max-w-4xl min-w-lg flex flex-col flex-1 overflow-hidden">
          <DrawerHeader>
            <DrawerTitle>Create Work Order</DrawerTitle>
            <DrawerDescription>
              Fill out the form below to create a new work order.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <JobForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
