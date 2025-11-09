import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";
import { workOrderSchema } from "@/lib/validations/workOrder";

// ✅ POST /api/work-order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await connectDB();
        const auth = await verifyAuth(req, "create_jobs");
        if (auth instanceof NextResponse) return auth;

        // Validate input
        const validated = workOrderSchema.parse(body);

        // Clean up empty strings to prevent cast errors
        const cleanData = JSON.parse(JSON.stringify(validated, (key, value) => {
            return value === "" ? undefined : value;
        }));

        // Ensure default status is set to pending if not provided
        if (!cleanData.job_info) {
            cleanData.job_info = {};
        }
        if (!cleanData.job_info.status) {
            cleanData.job_info.status = "pending";
        }

        console.log("Clean data:", cleanData);

        // Check for duplicate order number
        const existing = await WorkOrder.findOne({ order_number: cleanData.order_number });
        if (existing) {
            return NextResponse.json(
                { error: "Work order with this order number already exists" },
                { status: 400 }
            );
        }

        // Create work order
        const workOrder = await WorkOrder.create({
            ...cleanData,
            created_by: auth._id,
        });

        return NextResponse.json(
            { message: "Work order created successfully", data: workOrder },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Work order creation error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        const workOrders = await WorkOrder.find({ is_deleted: false }).sort({
            createdAt: -1,
        });
        return NextResponse.json({ message: "Work orders fetched successfully", data: workOrders });
    } catch (error) {
        console.error("❌ Fetch work orders error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
