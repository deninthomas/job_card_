import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";

// PATCH /api/work-order/[id]/deliver
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "deliver_jobs");
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
        if (currentStatus !== "completed") {
            return NextResponse.json(
                { error: `Cannot deliver work order with status: ${currentStatus}. Only completed orders can be delivered.` },
                { status: 400 }
            );
        }

        // Update status to delivered
        workOrder.job_info = workOrder.job_info || {};
        workOrder.job_info.status = "delivered";
        
        // Update delivery information
        workOrder.approval = workOrder.approval || {};
        workOrder.approval.delivered_by = auth._id.toString();
        workOrder.approval.delivered_at = new Date().toISOString();
        
        workOrder.order_detail = workOrder.order_detail || {};
        workOrder.order_detail.date_delivered = new Date().toISOString().split("T")[0];
        
        await workOrder.save();

        return NextResponse.json(
            { message: "Work order delivered successfully", data: workOrder },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Deliver work order error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

