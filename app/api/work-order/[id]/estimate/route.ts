import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import Estimate from "@/models/Estimate";
import WorkOrder from "@/models/WorkOrder";
import { estimateSchema, estimateUpdateSchema } from "@/lib/validations/estimate";
import { 
    generateEstimateNumber, 
    calculateGrandTotal, 
    recalculateDiscounts 
} from "@/lib/utils/estimate";

// POST /api/work-order/[id]/estimate - Create new estimate
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workOrderId } = await params;
        const body = await req.json();
        await connectDB();

        const auth = await verifyAuth(req, "create_jobs");
        if (auth instanceof NextResponse) return auth;

        // Validate work order exists
        const workOrder = await WorkOrder.findById(workOrderId);
        if (!workOrder) {
            return NextResponse.json(
                { error: "Work order not found" },
                { status: 404 }
            );
        }

        // Check if estimate already exists for this work order
        const existingEstimate = await Estimate.findOne({ 
            work_order_id: workOrderId,
            is_deleted: false 
        });
        if (existingEstimate) {
            return NextResponse.json(
                { error: "Estimate already exists for this work order" },
                { status: 400 }
            );
        }

        // Validate input
        const validated = estimateSchema.parse({
            ...body,
            work_order_id: workOrderId
        });

        // Recalculate discounts to ensure amounts are correct
        const recalculatedDiscounts = recalculateDiscounts(
            validated.subtotal,
            validated.discounts || []
        );

        // Calculate all financial totals
        const financials = calculateGrandTotal(
            validated.estimated_labour || [],
            validated.estimated_materials || [],
            validated.additional_charges || [],
            recalculatedDiscounts,
            validated.tax_percentage || 0
        );

        // Generate unique estimate number
        const estimateNumber = await generateEstimateNumber();

        // Create estimate
        const estimate = await Estimate.create({
            work_order_id: workOrderId,
            estimate_number: estimateNumber,
            estimate_date: validated.estimate_date,
            valid_until: validated.valid_until,
            estimated_labour: validated.estimated_labour || [],
            estimated_materials: validated.estimated_materials || [],
            additional_charges: validated.additional_charges || [],
            discounts: recalculatedDiscounts,
            tax_percentage: validated.tax_percentage || 0,
            tax_amount: financials.taxAmount,
            subtotal: financials.subtotal,
            grand_total: financials.grandTotal,
            notes: validated.notes,
            terms_and_conditions: validated.terms_and_conditions,
            status: validated.status || "draft",
            created_by: auth._id,
        });

        // Update work order with estimate reference
        await WorkOrder.findByIdAndUpdate(workOrderId, {
            estimate_id: estimate._id,
            has_estimate: true,
            estimate_amount: financials.grandTotal
        });

        return NextResponse.json(
            { 
                message: "Estimate created successfully", 
                data: estimate 
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Estimate creation error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// GET /api/work-order/[id]/estimate - Get estimate for work order
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workOrderId } = await params;
        await connectDB();

        const auth = await verifyAuth(req, "read_jobs");
        if (auth instanceof NextResponse) return auth;

        // Find estimate for this work order
        const estimate = await Estimate.findOne({
            work_order_id: workOrderId,
            is_deleted: false
        }).populate("work_order_id");

        if (!estimate) {
            return NextResponse.json(
                { error: "Estimate not found for this work order" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Estimate fetched successfully",
            data: estimate
        });
    } catch (error: any) {
        console.error("❌ Fetch estimate error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/work-order/[id]/estimate - Update estimate
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

        // Find existing estimate
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

        // Prevent editing if estimate is already approved
        if (estimate.status === "approved") {
            return NextResponse.json(
                { error: "Cannot edit approved estimate" },
                { status: 400 }
            );
        }

        // Validate update input
        const validated = estimateUpdateSchema.parse(body);

        // Use existing values if not provided in update
        const labourEntries = validated.estimated_labour ?? estimate.estimated_labour;
        const materialEntries = validated.estimated_materials ?? estimate.estimated_materials;
        const additionalCharges = validated.additional_charges ?? estimate.additional_charges;
        const discounts = validated.discounts ?? estimate.discounts;
        const taxPercentage = validated.tax_percentage ?? estimate.tax_percentage;

        // Recalculate discounts if provided
        const recalculatedDiscounts = validated.discounts 
            ? recalculateDiscounts(validated.subtotal || estimate.subtotal, discounts)
            : discounts;

        // Recalculate financials
        const financials = calculateGrandTotal(
            labourEntries,
            materialEntries,
            additionalCharges,
            recalculatedDiscounts,
            taxPercentage
        );

        // Update estimate
        const updatedEstimate = await Estimate.findByIdAndUpdate(
            estimate._id,
            {
                ...validated,
                discounts: recalculatedDiscounts,
                tax_amount: financials.taxAmount,
                subtotal: financials.subtotal,
                grand_total: financials.grandTotal,
            },
            { new: true }
        );

        // Update work order estimate amount
        await WorkOrder.findByIdAndUpdate(workOrderId, {
            estimate_amount: financials.grandTotal
        });

        return NextResponse.json({
            message: "Estimate updated successfully",
            data: updatedEstimate
        });
    } catch (error: any) {
        console.error("❌ Estimate update error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

