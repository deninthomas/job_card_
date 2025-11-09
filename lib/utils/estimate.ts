import Estimate from "@/models/Estimate";
import { ILabourEntry, IMaterialEntry, IAdditionalCharge, IDiscount } from "@/models/Estimate";

/**
 * Generate a unique estimate number in format: EST-YYYY-MM-XXXXX
 * @returns Promise<string> - Generated estimate number
 */
export async function generateEstimateNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Find the latest estimate for current month
    const prefix = `EST-${year}-${month}`;
    const latestEstimate = await Estimate.findOne({
        estimate_number: { $regex: `^${prefix}` }
    })
    .sort({ estimate_number: -1 })
    .select("estimate_number");

    let nextNumber = 1;
    
    if (latestEstimate && latestEstimate.estimate_number) {
        // Extract the counter from the last estimate number
        const lastNumber = latestEstimate.estimate_number.split("-").pop();
        if (lastNumber) {
            nextNumber = parseInt(lastNumber, 10) + 1;
        }
    }

    // Format: EST-YYYY-MM-XXXXX (5 digits)
    const counter = String(nextNumber).padStart(5, "0");
    return `${prefix}-${counter}`;
}

/**
 * Calculate subtotal from labour, materials, and additional charges
 */
export function calculateSubtotal(
    labour: ILabourEntry[] = [],
    materials: IMaterialEntry[] = [],
    additionalCharges: IAdditionalCharge[] = []
): number {
    const labourTotal = labour.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);
    const materialTotal = materials.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    const chargesTotal = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    
    return labourTotal + materialTotal + chargesTotal;
}

/**
 * Calculate discount amount based on type and value
 */
export function calculateDiscountAmount(
    subtotal: number,
    discountType: "percentage" | "fixed",
    discountValue: number
): number {
    if (discountType === "percentage") {
        return (subtotal * discountValue) / 100;
    }
    return discountValue;
}

/**
 * Apply all discounts to subtotal
 */
export function applyDiscounts(subtotal: number, discounts: IDiscount[] = []): number {
    const totalDiscount = discounts.reduce((sum, discount) => sum + (discount.amount || 0), 0);
    return Math.max(0, subtotal - totalDiscount);
}

/**
 * Calculate tax amount
 */
export function calculateTax(amountAfterDiscount: number, taxPercentage: number = 0): number {
    return (amountAfterDiscount * taxPercentage) / 100;
}

/**
 * Calculate grand total with all charges, discounts, and tax
 */
export function calculateGrandTotal(
    labour: ILabourEntry[] = [],
    materials: IMaterialEntry[] = [],
    additionalCharges: IAdditionalCharge[] = [],
    discounts: IDiscount[] = [],
    taxPercentage: number = 0
): { subtotal: number; totalDiscount: number; amountAfterDiscount: number; taxAmount: number; grandTotal: number } {
    const subtotal = calculateSubtotal(labour, materials, additionalCharges);
    const totalDiscount = discounts.reduce((sum, discount) => sum + (discount.amount || 0), 0);
    const amountAfterDiscount = Math.max(0, subtotal - totalDiscount);
    const taxAmount = calculateTax(amountAfterDiscount, taxPercentage);
    const grandTotal = amountAfterDiscount + taxAmount;

    return {
        subtotal,
        totalDiscount,
        amountAfterDiscount,
        taxAmount,
        grandTotal
    };
}

/**
 * Recalculate all discount amounts based on subtotal
 * This ensures discount amounts are correct based on their type and value
 */
export function recalculateDiscounts(subtotal: number, discounts: IDiscount[] = []): IDiscount[] {
    return discounts.map(discount => ({
        ...discount,
        amount: calculateDiscountAmount(subtotal, discount.type, discount.value)
    }));
}

