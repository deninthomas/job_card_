import dotenv from "dotenv";
import mongoose from "mongoose";
import { Roles } from "@/models/Roles";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seedSuperAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error("❌ MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(MONGODB_URI,{
      bufferCommands: false,
      dbName: "myDatabase",
    });
    console.log("✅ Connected to MongoDB");

    const superAdminRoleData = {
      name: "Super Admin",
      description: "Has full access to all system modules and actions.",
      modules: [
        {
          module: "users",
          actions: ["create", "read", "update", "delete"],
        },
        {
          module: "roles",
          actions: ["create", "read", "update", "delete"],
        },
        {
          module: "jobs",
          actions: ["create", "read", "update", "delete", "check", "approve", "complete", "deliver"],
        },
        {
          module: "employees",
          actions: ["create", "read", "update", "delete"],
        },
      ],
      status: "active",
      is_active: true,
      is_deleted: false,
    };

    const existingRole = await Roles.findOne({ name: "Super Admin" });
    if (existingRole) {
      // Update existing role to ensure it has all permissions including employees
      existingRole.modules = superAdminRoleData.modules;
      existingRole.description = superAdminRoleData.description;
      await existingRole.save();
      console.log("✅ Super Admin role updated with all permissions including employees!");
    } else {
      await Roles.create(superAdminRoleData);
      console.log("✅ Super Admin role seeded successfully!");
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
