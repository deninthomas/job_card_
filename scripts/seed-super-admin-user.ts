// scripts/seed-super-admin-user.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "@/models/User";
import { Roles } from "@/models/Roles";
import path from "path";
import bcrypt from "bcryptjs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function seedSuperAdminUser() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "myDatabase",
    });
    console.log("✅ Connected to MongoDB");

    const superAdminRole = await Roles.findOne({ name: "Super Admin" });
    if (!superAdminRole) throw new Error("Super Admin role not found. Seed roles first.");

    const email = "superadmin@system.com";
    const existingUser = await User.deleteOne({ email });


    // Create user and set password via virtual
    const user = new User({
      first_name: "Super",
      last_name: "Admin",
      email,
      role: superAdminRole._id,
      is_active: true,
      is_deleted: false,
      status: "active",
    } as any);

    // Set password using virtual field - will be hashed automatically by pre-save hook
    (user as any).password = "Super@123";

    await user.save();

    console.log("✅ Super Admin user seeded:", { email, password: "Super@123" });

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedSuperAdminUser();
