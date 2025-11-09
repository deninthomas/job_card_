import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import Estimate from "@/models/Estimate";
import { estimateStatusSchema } from "@/lib/validations/estimate";

// PATCH /api/work-order/[id]/estimate/status - Update estimate status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workOrderId } = await params;
        const body = await req.json();
        await connectDB();

        const auth = await verifyAuth(req, "edit_jobs");
        if (auth instanceof NextResponse) return auth;

        // Validate input
        const validated = estimateStatusSchema.parse(body);

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

        // Prevent changing status if already approved (except by admin with special permission)
        if (estimate.status === "approved" && validated.status !== "approved") {
            return NextResponse.json(
                { error: "Cannot change status of approved estimate" },
                { status: 400 }
            );
        }

        // Validate status transitions
        const validTransitions: Record<string, string[]> = {
            draft: ["sent", "rejected"],
            sent: ["approved", "rejected", "expired"],
            rejected: ["draft"], // Allow re-opening rejected estimates
            expired: ["draft"], // Allow re-opening expired estimates
            approved: [] // Approved estimates cannot be changed (handled above)
        };

        const allowedStatuses = validTransitions[estimate.status] || [];
        if (!allowedStatuses.includes(validated.status) && estimate.status !== validated.status) {
            return NextResponse.json(
                { 
                    error: `Cannot transition from ${estimate.status} to ${validated.status}`,
                    allowed: allowedStatuses
                },
                { status: 400 }
            );
        }

        // Update estimate status
        estimate.status = validated.status;
        await estimate.save();

        return NextResponse.json({
            message: "Estimate status updated successfully",
            data: estimate
        });
    } catch (error: any) {
        console.error("❌ Estimate status update error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

