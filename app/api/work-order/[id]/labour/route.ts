import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";
import { labourEntrySchema } from "@/lib/validations/workOrder";

// POST /api/work-order/[id]/labour
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "update_jobs");
        if (auth instanceof NextResponse) return auth;

        const body = await req.json();
        console.log("Received labour entry body:", body);
        
        // Validate labour entry
        const validated = labourEntrySchema.parse(body);
        console.log("Validated labour entry:", validated);

        const { id } = await params;
        console.log("Work order ID:", id);
        const workOrder = await WorkOrder.findById(id);
        console.log("Found work order:", workOrder ? "Yes" : "No");
        
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

        // Add labour entry
        workOrder.labour_entry = workOrder.labour_entry || [];
        console.log("Current labour entries count:", workOrder.labour_entry.length);
        workOrder.labour_entry.push(validated);
        console.log("After adding, labour entries count:", workOrder.labour_entry.length);

        // Recalculate totals
        const total_labour_hours = workOrder.labour_entry.reduce(
            (sum, entry) => sum + entry.hours,
            0
        );
        
        const total_labour_cost = workOrder.labour_entry.reduce(
            (sum, entry) => sum + entry.total_cost,
            0
        );
        
        const total_material_cost = workOrder.material_entry?.reduce(
            (sum, entry) => sum + entry.amount,
            0
        ) || 0;
        
        const grand_total = total_labour_cost + total_material_cost;

        workOrder.total = {
            total_labour_hours,
            total_labour_cost,
            total_material_cost,
            grand_total,
        };

        console.log("Saving work order with totals:", workOrder.total);
        const savedWorkOrder = await workOrder.save();
        console.log("Work order saved successfully, labour entries:", savedWorkOrder.labour_entry.length);

        return NextResponse.json(
            { message: "Labour entry added successfully", data: savedWorkOrder },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Add labour entry error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

