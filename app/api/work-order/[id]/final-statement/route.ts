import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyAuth } from "@/middleware/auth";
import WorkOrder from "@/models/WorkOrder";
import Estimate from "@/models/Estimate";

interface LabourComparison {
    description: string;
    estimated_hours: number;
    actual_hours: number;
    estimated_cost: number;
    actual_cost: number;
    variance: number;
}

interface MaterialComparison {
    description: string;
    estimated_quantity: number;
    actual_quantity: number;
    estimated_amount: number;
    actual_amount: number;
    variance: number;
}

interface FinalStatement {
    work_order: any;
    estimate: any | null;
    has_estimate: boolean;
    labour_comparison: LabourComparison[];
    material_comparison: MaterialComparison[];
    financial_summary: {
        estimated: {
            labour_cost: number;
            material_cost: number;
            additional_charges: number;
            subtotal: number;
            discount: number;
            tax: number;
            grand_total: number;
        };
        actual: {
            labour_cost: number;
            material_cost: number;
            grand_total: number;
        };
        variance: {
            labour_cost: number;
            material_cost: number;
            total: number;
            percentage: number;
        };
    };
}

// GET /api/work-order/[id]/final-statement - Generate final statement
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workOrderId } = await params;
        await connectDB();

        const auth = await verifyAuth(req, "read_jobs");
        if (auth instanceof NextResponse) return auth;

        // Fetch work order with all details
        const workOrder = await WorkOrder.findById(workOrderId);
        if (!workOrder) {
            return NextResponse.json(
                { error: "Work order not found" },
                { status: 404 }
            );
        }

        // Fetch estimate if exists
        const estimate = await Estimate.findOne({
            work_order_id: workOrderId,
            is_deleted: false
        });

        // Calculate actual costs from work order
        const actualLabourCost = workOrder.labour_entry?.reduce(
            (sum: number, entry: any) => sum + (entry.total_cost || 0),
            0
        ) || 0;

        const actualMaterialCost = workOrder.material_entry?.reduce(
            (sum: number, entry: any) => sum + (entry.amount || 0),
            0
        ) || 0;

        const actualGrandTotal = actualLabourCost + actualMaterialCost;

        // Initialize final statement
        const finalStatement: FinalStatement = {
            work_order: workOrder,
            estimate: estimate,
            has_estimate: !!estimate,
            labour_comparison: [],
            material_comparison: [],
            financial_summary: {
                estimated: {
                    labour_cost: 0,
                    material_cost: 0,
                    additional_charges: 0,
                    subtotal: 0,
                    discount: 0,
                    tax: 0,
                    grand_total: 0,
                },
                actual: {
                    labour_cost: actualLabourCost,
                    material_cost: actualMaterialCost,
                    grand_total: actualGrandTotal,
                },
                variance: {
                    labour_cost: 0,
                    material_cost: 0,
                    total: 0,
                    percentage: 0,
                },
            },
        };

        // If estimate exists, perform detailed comparison
        if (estimate) {
            // Calculate estimated costs
            const estimatedLabourCost = estimate.estimated_labour?.reduce(
                (sum: number, entry: any) => sum + (entry.total_cost || 0),
                0
            ) || 0;

            const estimatedMaterialCost = estimate.estimated_materials?.reduce(
                (sum: number, entry: any) => sum + (entry.amount || 0),
                0
            ) || 0;

            const estimatedAdditionalCharges = estimate.additional_charges?.reduce(
                (sum: number, charge: any) => sum + (charge.amount || 0),
                0
            ) || 0;

            const estimatedDiscount = estimate.discounts?.reduce(
                (sum: number, discount: any) => sum + (discount.amount || 0),
                0
            ) || 0;

            finalStatement.financial_summary.estimated = {
                labour_cost: estimatedLabourCost,
                material_cost: estimatedMaterialCost,
                additional_charges: estimatedAdditionalCharges,
                subtotal: estimate.subtotal || 0,
                discount: estimatedDiscount,
                tax: estimate.tax_amount || 0,
                grand_total: estimate.grand_total || 0,
            };

            // Calculate variances
            const labourVariance = actualLabourCost - estimatedLabourCost;
            const materialVariance = actualMaterialCost - estimatedMaterialCost;
            const totalVariance = actualGrandTotal - (estimate.grand_total || 0);
            const variancePercentage = estimate.grand_total 
                ? (totalVariance / estimate.grand_total) * 100 
                : 0;

            finalStatement.financial_summary.variance = {
                labour_cost: labourVariance,
                material_cost: materialVariance,
                total: totalVariance,
                percentage: variancePercentage,
            };

            // Labour comparison - match by description (simplified approach)
            const labourMap = new Map<string, any>();
            
            estimate.estimated_labour?.forEach((estimated: any) => {
                labourMap.set(estimated.description.toLowerCase(), {
                    description: estimated.description,
                    estimated_hours: estimated.hours || 0,
                    actual_hours: 0,
                    estimated_cost: estimated.total_cost || 0,
                    actual_cost: 0,
                    variance: 0,
                });
            });

            workOrder.labour_entry?.forEach((actual: any) => {
                const key = actual.description.toLowerCase();
                if (labourMap.has(key)) {
                    const entry = labourMap.get(key);
                    entry.actual_hours = actual.hours || 0;
                    entry.actual_cost = actual.total_cost || 0;
                    entry.variance = entry.actual_cost - entry.estimated_cost;
                } else {
                    // New labour entry not in estimate
                    labourMap.set(key, {
                        description: actual.description,
                        estimated_hours: 0,
                        actual_hours: actual.hours || 0,
                        estimated_cost: 0,
                        actual_cost: actual.total_cost || 0,
                        variance: actual.total_cost || 0,
                    });
                }
            });

            finalStatement.labour_comparison = Array.from(labourMap.values());

            // Material comparison - match by description (simplified approach)
            const materialMap = new Map<string, any>();

            estimate.estimated_materials?.forEach((estimated: any) => {
                materialMap.set(estimated.description.toLowerCase(), {
                    description: estimated.description,
                    estimated_quantity: estimated.quantity || 0,
                    actual_quantity: 0,
                    estimated_amount: estimated.amount || 0,
                    actual_amount: 0,
                    variance: 0,
                });
            });

            workOrder.material_entry?.forEach((actual: any) => {
                const key = actual.description.toLowerCase();
                if (materialMap.has(key)) {
                    const entry = materialMap.get(key);
                    entry.actual_quantity = actual.quantity || 0;
                    entry.actual_amount = actual.amount || 0;
                    entry.variance = entry.actual_amount - entry.estimated_amount;
                } else {
                    // New material entry not in estimate
                    materialMap.set(key, {
                        description: actual.description,
                        estimated_quantity: 0,
                        actual_quantity: actual.quantity || 0,
                        estimated_amount: 0,
                        actual_amount: actual.amount || 0,
                        variance: actual.amount || 0,
                    });
                }
            });

            finalStatement.material_comparison = Array.from(materialMap.values());
        }

        return NextResponse.json({
            message: "Final statement generated successfully",
            data: finalStatement
        });
    } catch (error: any) {
        console.error("❌ Final statement generation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

