export interface User {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    roleDetails: Role;
    status: string;
    is_active: boolean;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    created_by?: string;
}
interface RolePermission {
    module: string;
    actions: string[];
}

export interface Role {
    _id: string;
    name: string;
    description?: string;
    modules: RolePermission[];
    status: Status;
    is_active: boolean;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    created_by?: string;
}

export interface IClient {
    name: string;
    code: string;
    contact_info?: {
        phone?: string;
        email?: string;
    };
}

export interface ILabourEntry {
    date: string;
    description: string;
    hours: number;
    employee_id: string; // ObjectId as string
    cost_per_hour: number;
    total_cost: number;
}

export interface IMaterialEntry {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    amount: number;
    supplier?: string;
}

export interface IOrderDetail {
    received_by?: string; // ObjectId as string
    order_date?: string;
    order_time?: string;
    job_start_date?: string;
    date_promised?: string;
    date_delivered?: string;
}

export interface IJobInfo {
    priority?: string;
    type?: string;
    description?: string;
    status?: string;
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
    total_labour_hours?: number;
    total_labour_cost?: number;
    total_material_cost?: number;
    grand_total?: number;
}

export interface IWorkOrder {
    _id: string;
    order_number: string;
    client: IClient;
    labour_entry?: ILabourEntry[];
    material_entry?: IMaterialEntry[];
    order_detail?: IOrderDetail;
    job_info?: IJobInfo;
    approval?: IApproval;
    total?: ITotal;
    estimate_id?: string;
    has_estimate?: boolean;
    estimate_amount?: number;
    created_by?: string;
    is_deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IAdditionalCharge {
    description: string;
    amount: number;
}

export interface IDiscount {
    description: string;
    type: "percentage" | "fixed";
    value: number;
    amount: number;
}

export interface IEstimate {
    _id: string;
    work_order_id: string;
    estimate_number: string;
    estimate_date: string;
    valid_until: string;
    estimated_labour: ILabourEntry[];
    estimated_materials: IMaterialEntry[];
    additional_charges?: IAdditionalCharge[];
    discounts?: IDiscount[];
    tax_percentage?: number;
    tax_amount?: number;
    subtotal: number;
    grand_total: number;
    notes?: string;
    terms_and_conditions?: string;
    status: "draft" | "sent" | "approved" | "rejected" | "expired";
    approved_by?: string;
    approved_at?: string;
    created_by?: string;
    is_deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}



export enum Status {
    Active = "active",
    Inactive = "inactive",
    Invited = "invited",
    Blocked = "blocked",
}

export interface Employee {
    _id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    minimum_wage: number;
    status: string;
    is_active: boolean;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    created_by?: string;
}