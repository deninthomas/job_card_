import mongoose, { Document, models, Schema } from "mongoose";

export interface IClient {
    name: string;
    code: string;
    contact_info: {
        phone: string;
        email: string;
    }
}

export interface ILabourEntry {
    date: string;
    description: string;
    hours: number;
    employee_id: Schema.Types.ObjectId;
    cost_per_hour: number;
    total_cost: number;
}

export interface IMaterialEntry {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    amount: number;
    supplier: string;
}

export interface IOrderDetail {
    received_by: string;
    order_date: string;
    order_time: string;
    job_start_date: string;
    date_promised: string;
    date_delivered: string;
}

export interface IJobInfo {
    priority: string;
    type: string;
    description: string;
    status: string;
    checked_by?: string;
    checked_at?: string;
    completed_by?: string;
    completed_at?: string;
}

export interface IApproval {
    approved_by?: string;
    approved_at?: string;
    delivered_by?: string;
    delivered_at?: string;
    delivered_on_time?: boolean;
    remarks?: string;
    customer_signature?: string;
}

export interface ITotal {
    total_labour_hours: number;
    total_labour_cost: number;
    total_material_cost: number;
    grand_total: number;
}

export interface IWorkOrder extends Document {
    order_number: string;
    client: IClient;
    labour_entry: ILabourEntry[];
    material_entry: IMaterialEntry[];
    order_detail: IOrderDetail;
    job_info: IJobInfo;
    approval:IApproval;
    total: ITotal;
    // Estimate-related fields
    estimate_id?: Schema.Types.ObjectId;
    has_estimate: boolean;
    estimate_amount?: number;
    created_by?: Schema.Types.ObjectId;
    is_deleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ClientSchema = new Schema<IClient>({
    code: { type: String, required: true },
    name: { type: String, required: true },
    contact_info: {
        phone: { type: String, },
        email: { type: String, }
    }

})

const LabourEntrySchema = new Schema<ILabourEntry>({
    date: { type: String, required: true },
    description: { type: String, required: true },
    cost_per_hour: { type: Number, required: true },
    employee_id: { type: Schema.Types.ObjectId, required: true },
    hours: { type: Number, required: true },
    total_cost: { type: Number, required: true }
})

const MaterialEntrySchema = new Schema<IMaterialEntry>({
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    unit: { type: String, required: true }

})

const OrderDetailSchema = new Schema<IOrderDetail>({
    date_delivered: String,
    date_promised: String,
    job_start_date: String,
    order_date: String,
    order_time: String,
    received_by: String
})

const JobInfoSchema = new Schema<IJobInfo>({
    description: { type: String },
    priority: { type: String },
    status: String,
    type: String,
    checked_by: String,
    checked_at: String,
    completed_by: String,
    completed_at: String
})


const ApprovalSchema = new Schema<IApproval>({
    approved_by: String,
    approved_at: String,
    delivered_by: String,
    delivered_at: String,
    delivered_on_time: Boolean,
    remarks: String,
    customer_signature: String
})

const TotalSchema = new Schema<ITotal>({
    grand_total: Number,
    total_labour_cost: Number,
    total_labour_hours: Number,
    total_material_cost: Number
})

const WorkOrderSchema = new Schema<IWorkOrder>({
    order_number: String,
    client: ClientSchema,
    labour_entry: [LabourEntrySchema],
    material_entry: [MaterialEntrySchema],
    order_detail: OrderDetailSchema,
    job_info: JobInfoSchema,
    approval: ApprovalSchema,
    total: TotalSchema,
    // Estimate-related fields
    estimate_id: { type: Schema.Types.ObjectId, ref: "Estimate" },
    has_estimate: { type: Boolean, default: false },
    estimate_amount: { type: Number },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_deleted: { type: Boolean, default: false }
}, { timestamps: true })

export default models.WorkOrder || mongoose.model<IWorkOrder>("WorkOrder", WorkOrderSchema);
