import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";
import { Employee } from "@/models/Employee";

// GET /api/work-order/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const auth = await verifyAuth(req, "read_jobs");
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

        // Populate employee details for labour entries
        const employeeIds = workOrder.labour_entry?.map(entry => entry.employee_id) || [];
        const employees = await Employee.find({ _id: { $in: employeeIds } });
        
        // Create a map of employee data
        const employeeMap = new Map(employees.map(emp => [emp._id.toString(), emp]));
        
        // Enrich labour entries with employee details
        const enrichedWorkOrder = {
            ...workOrder.toObject(),
            labour_entry: workOrder.labour_entry?.map(entry => ({
                ...entry,
                employee: employeeMap.get(entry.employee_id.toString())
            }))
        };

        return NextResponse.json(
            { message: "Work order fetched successfully", data: enrichedWorkOrder },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Fetch work order error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

