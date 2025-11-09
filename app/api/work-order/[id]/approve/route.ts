import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";

// PATCH /api/work-order/[id]/approve
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "approve_jobs");
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
        if (currentStatus !== "checked") {
            return NextResponse.json(
                { error: `Cannot approve work order with status: ${currentStatus}. Only checked orders can be approved.` },
                { status: 400 }
            );
        }

        // Update status to approved
        workOrder.job_info = workOrder.job_info || {};
        workOrder.job_info.status = "approved";
        
        // Update approval information
        workOrder.approval = workOrder.approval || {};
        workOrder.approval.approved_by = auth._id.toString();
        workOrder.approval.approved_at = new Date().toISOString();
        
        await workOrder.save();

        return NextResponse.json(
            { message: "Work order approved successfully", data: workOrder },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Approve work order error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

