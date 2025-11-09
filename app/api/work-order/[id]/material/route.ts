import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";
import { materialEntrySchema } from "@/lib/validations/workOrder";

// POST /api/work-order/[id]/material
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "update_jobs");
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        
        // Validate material entry
        const validated = materialEntrySchema.parse(body);

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

        // Add material entry
        workOrder.material_entry = workOrder.material_entry || [];
        workOrder.material_entry.push(validated);

        // Recalculate totals
        const total_labour_hours = workOrder.labour_entry?.reduce(
            (sum, entry) => sum + entry.hours,
            0
        ) || 0;
        
        const total_labour_cost = workOrder.labour_entry?.reduce(
            (sum, entry) => sum + entry.total_cost,
            0
        ) || 0;
        
        const total_material_cost = workOrder.material_entry.reduce(
            (sum, entry) => sum + entry.amount,
            0
        );
        
        const grand_total = total_labour_cost + total_material_cost;

        workOrder.total = {
            total_labour_hours,
            total_labour_cost,
            total_material_cost,
            grand_total,
        };

        await workOrder.save();

        return NextResponse.json(
            { message: "Material entry added successfully", data: workOrder },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Add material entry error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

