import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { Roles } from "@/models/Roles";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";

// ✅ Zod validation schema
const moduleSchema = z.object({
  module: z.string().min(1, "Module name is required"),
  actions: z.array(z.string().min(1)).nonempty("At least one action required"),
});

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
  modules: z.array(moduleSchema).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
  created_by: z.string().optional(),
});

// ✅ POST /api/roles
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();
    const auth = await verifyAuth(req, "create_roles");
    if (auth instanceof NextResponse) return auth;

    // Validate input
    const validated = roleSchema.parse(body);


    // Check for duplicate role name
    const existing = await Roles.findOne({ name: validated.name });
    if (existing) {
      return NextResponse.json(
        { error: "Role with this name already exists" },
        { status: 400 }
      );
    }

    // Create role
    const role = await Roles.create({
      ...validated,
      created_by: auth._id,
    });

    return NextResponse.json(
      { message: "Role created successfully", data: role },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Role creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const roles = await Roles.find({ is_deleted: false }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ message: "Roles fetched successfully", data: roles });
  } catch (error) {
    console.error("❌ Fetch roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
