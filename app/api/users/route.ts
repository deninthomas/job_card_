import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { verifyAuth } from "@/middleware/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const auth = await verifyAuth(req, "read_users");
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q");
  const filter: any = {};

  if (search) {
    filter.$or = [
      { first_name: { $regex: search, $options: "i" } },
      { last_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "roleDetails",
      },
    },
    {
      $unwind: {
        path: "$roleDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        first_name: 1,
        last_name: 1,
        email: 1,
        role: "$roleDetails._id",
        roleDetails: {
          _id: 1,
          name: 1,
          description: 1,
          modules: 1,
          status: 1,
          is_active: 1,
        },
        phone: 1,
        is_active: 1,
        is_deleted: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return NextResponse.json({message: "Users fetched successfully", data: users as any});
}

export async function POST(req: NextRequest) {
  await connectDB();
  const auth = await verifyAuth(req, "create_users");
  if (auth instanceof NextResponse) return auth;
console.log(auth)
  const body = await req.json();
  try {
    const user = new User(body);
    (user as any).password = body.password; // trigger virtual hashing
    user.created_by = auth._id
    await user.save();
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
