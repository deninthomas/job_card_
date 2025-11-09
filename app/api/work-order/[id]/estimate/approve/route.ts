import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import Estimate from "@/models/Estimate";
import WorkOrder from "@/models/WorkOrder";

// POST /api/work-order/[id]/estimate/approve - Approve estimate
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workOrderId } = await params;
        await connectDB();

        const auth = await verifyAuth(req, "approve_jobs");
        if (auth instanceof NextResponse) return auth;

        // Find estimate for this work order
        const estimate = await Estimate.findOne({
            work_order_id: workOrderId,
            is_deleted: false
        });

        if (!estimate) {
            return NextResponse.json(
                { error: "Estimate not found" },
                { status: 404 }
            );
        }

        // Prevent approving if already approved
        if (estimate.status === "approved") {
            return NextResponse.json(
                { error: "Estimate is already approved" },
                { status: 400 }
            );
        }

        // Update estimate status to approved
        const currentDate = new Date().toISOString();
        estimate.status = "approved";
        estimate.approved_by = auth._id;
        estimate.approved_at = currentDate;
        await estimate.save();

        // Update work order with final estimate amount
        await WorkOrder.findByIdAndUpdate(workOrderId, {
            estimate_amount: estimate.grand_total
        });

        return NextResponse.json({
            message: "Estimate approved successfully",
            data: estimate
        });
    } catch (error: any) {
        console.error("❌ Estimate approval error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

