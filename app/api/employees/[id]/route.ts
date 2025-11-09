import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Employee } from "@/models/Employee";
import { verifyAuth } from "@/middleware/auth";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const auth = await verifyAuth(req, "update_employees");
  if (auth instanceof NextResponse) return auth;

  const { id } = params;
  const body = await req.json();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid employee ID" },
      { status: 400 }
    );
  }

  try {
    const employee = await Employee.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

