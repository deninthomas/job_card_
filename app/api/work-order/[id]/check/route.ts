import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";

// PATCH /api/work-order/[id]/check
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "check_jobs");
        if (auth instanceof NextResponse) return auth;

        const { id } = await params;
        const workOrder = await WorkOrder.findById(id);
        
        if (!workOrder) {
            return NextResponse.json(
                { error: "Work order not found" },
                { status: 404 }
            );
        }

        if (workOrder.is_deleted) {
            return NextResponse.json(
                { error: "Work order has been deleted" },
                { status: 404 }
            );
        }

        // Validate current status
        const currentStatus = workOrder.job_info?.status || "pending";
        if (currentStatus !== "pending") {
            return NextResponse.json(
                { error: `Cannot check work order with status: ${currentStatus}. Only pending orders can be checked.` },
                { status: 400 }
            );
        }

        // Update status to checked
        workOrder.job_info = workOrder.job_info || {};
        workOrder.job_info.status = "checked";
        workOrder.job_info.checked_by = auth._id.toString();
        workOrder.job_info.checked_at = new Date().toISOString();
        
        await workOrder.save();

        return NextResponse.json(
            { message: "Work order checked successfully", data: workOrder },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Check work order error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

