import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Roles } from "@/models/Roles";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    // ✅ Parse JSON safely
    const body = await req.json();
    const { email, password } = body;

    console.log("Request body:", body);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ Use aggregation to fetch user with full role details
    const userResults = await User.aggregate([
      { $match: { email: email.toLowerCase() } },
      {
        $lookup: {
          from: "roles", // MongoDB collection name (lowercase plural)
          localField: "role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: {
          path: "$roleDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          first_name: 1,
          last_name: 1,
          email: 1,
          passwordHash: 1,
          role: "$roleDetails._id",
          roleDetails: {
            _id: 1,
            name: 1,
            description: 1,
            modules: 1,
            status: 1,
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

    if (!userResults || userResults.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = userResults[0];

    console.log("User found:", userDoc.email);

    if (!userDoc.passwordHash) {
      console.error("❌ No passwordHash found on user document");
      return NextResponse.json(
        { error: "User record corrupted - missing passwordHash" },
        { status: 500 }
      );
    }

    // ✅ Get user document to use comparePassword method
    const user = await User.findById(userDoc._id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Use model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // ✅ Success response with full role details (omit sensitive data)
    const userData = {
      id: userDoc._id,
      first_name: userDoc.first_name,
      last_name: userDoc.last_name,
      email: userDoc.email,
      role: userDoc.roleDetails,
      phone: userDoc.phone,
      status: userDoc.status,
      is_active: userDoc.is_active,
    };

    // ✅ Create response with HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful", user: userData },
      { status: 200 }
    );

    // Set HTTP-only cookie for security
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
