"use client";
import { Button } from "@/components/ui/button";
import { FileText, HomeIcon, Shield, User, UserCog } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const route = useRouter();
  const pathname = usePathname();
  console.log("pathname", pathname);
  return (
    <aside className="w-20 bg-white border-r border-gray-200">
      <div className="h-full flex flex-col items-center py-4">
        <div className="p-2">logo</div>

        <nav className="flex-1 w-full px-2 space-y-2 mt-6">
          <Button
            size="icon"
            variant={"outline"}
            className={`${
              pathname === "/" ? "bg-accent text-accent-foreground" : ""
            } w-full`}
            onClick={() => route.push("/")}
          >
            <HomeIcon />
          </Button>

          <Button
            size="icon"
            variant={"outline"}
            className={`${
              pathname === "/users" ? "bg-accent text-accent-foreground" : ""
            } w-full`}
            onClick={() => route.push("/users")}
          >
            <User />
          </Button>

          <Button
            size="icon"
            className={`${
              pathname === "/jobs" ? "bg-accent text-accent-foreground" : ""
            } w-full`}
            variant={"outline"}
            onClick={() => route.push("/jobs")}
          >
            <FileText />
          </Button>

          <Button
            size="icon"
            className={`${
              pathname === "/roles" ? "bg-accent text-accent-foreground" : ""
            } w-full`}
            variant={"outline"}
            onClick={() => route.push("/roles")}
          >
            <Shield />
          </Button>

          <Button
            size="icon"
            className={`${
              pathname === "/employees" ? "bg-accent text-accent-foreground" : ""
            } w-full`}
            variant={"outline"}
            onClick={() => route.push("/employees")}
          >
            <UserCog />
          </Button>

        </nav>

        <div className="mt-auto pb-4">
          <button className="w-12 h-12 rounded-full overflow-hidden">
            logo
          </button>
        </div>
      </div>
    </aside>
  );
}
