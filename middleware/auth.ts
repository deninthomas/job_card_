import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Roles } from "@/models/Roles";
import mongoose from "mongoose";

export async function verifyAuth(req: NextRequest, requiredPermission?: string) {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // ✅ Use aggregation to fetch user with full role details
        const userResults = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(decoded.id) } },
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

        if (!userResults || userResults.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userResults[0];

        // Check if user is active
        if (!user.is_active || user.is_deleted) {
            return NextResponse.json({ error: "User account is inactive" }, { status: 403 });
        }

        // ✅ Check permissions using aggregated role data
        // Permission format: "action_module" (e.g., "read_users", "create_roles")
        if (requiredPermission && user.roleDetails) {
            const [action, module] = requiredPermission.split("_");

            const hasPermission = user.roleDetails.modules?.some(
                (m: any) => m.module === module && m.actions.includes(action)
            );

            if (!hasPermission) {
                return NextResponse.json(
                    { error: "Forbidden - Insufficient permissions" },
                    { status: 403 }
                );
            }
        }

        return user; // return user for use in route handlers
    } catch (err: any) {
        console.error("❌ Auth verification error:", err);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
