import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Employee } from "@/models/Employee";
import { verifyAuth } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const auth = await verifyAuth(req, "read_employees");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");
  const filter: any = { is_deleted: false };

  if (search) {
    filter.$or = [
      { employee_id: { $regex: search, $options: "i" } },
      { first_name: { $regex: search, $options: "i" } },
      { last_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const employees = await Employee.find(filter)
    .populate("created_by", "first_name last_name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    message: "Employees fetched successfully",
    data: employees as any,
  });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await verifyAuth(req, "create_employees");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  try {
    const employee = new Employee(body);
    employee.created_by = auth._id;
    await employee.save();
    return NextResponse.json(
      { message: "Employee created successfully", data: employee },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

