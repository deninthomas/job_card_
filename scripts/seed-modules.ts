import dotenv from "dotenv";
import mongoose from "mongoose";
import Module from "../models/Modules";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

async function seedModules() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "myDatabase",
    });
    console.log("✅ Connected to MongoDB");

    const modules = [
      {
        name: "Users",
        key: "users",
        actions: [
          { name: "View Users", key: "view_users" },
          { name: "Create User", key: "create_user" },
          { name: "Edit User", key: "edit_user" },
          { name: "Delete User", key: "delete_user" },
        ],
      },
      {
        name: "Jobs",
        key: "jobs",
        actions: [
          { name: "View Jobs", key: "view_jobs" },
          { name: "Create Job", key: "create_job" },
          { name: "Edit Job", key: "edit_job" },
          { name: "Update Job", key: "update_job" },
          { name: "Delete Job", key: "delete_job" },
          { name: "Check Job", key: "check_job" },
          { name: "Approve Job", key: "approve_job" },
          { name: "Complete Job", key: "complete_job" },
          { name: "Deliver Job", key: "deliver_job" },
        ],
      },
      {
        name: "Roles",
        key: "roles",
        actions: [
          { name: "View Roles", key: "view_roles" },
          { name: "Create Role", key: "create_role" },
          { name: "Edit Role", key: "edit_role" },
          { name: "Delete Role", key: "delete_role" },
        ],
      },
      {
        name: "Employees",
        key: "employees",
        actions: [
          { name: "View Employees", key: "view_employees" },
          { name: "Create Employee", key: "create_employees" },
          { name: "Edit Employee", key: "update_employees" },
          { name: "Delete Employee", key: "delete_employees" },
        ],
      },
    ];

    await Module.deleteMany({});
    await Module.insertMany(modules);

    console.log("🌱 Seeded default modules successfully!");
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seedModules();
