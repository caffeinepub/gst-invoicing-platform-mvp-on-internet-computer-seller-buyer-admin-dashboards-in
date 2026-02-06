import type { Principal } from "@dfinity/principal";
import type { Time, Invoice } from '../backend';

// Payment types (to be implemented in backend)
export enum PaymentStatus {
    pending = "pending",
    partial = "partial",
    completed = "completed"
}

export interface Payment {
    invoiceId: string;
    amount: number;
    status: PaymentStatus;
    timestamp: Time;
    payer: Principal;
}

// Inventory types (to be implemented in backend)
export interface InventoryItem {
    id: string;
    name: string;
    quantity: bigint;
    threshold: bigint;
    unit: string;
}

export interface LowStockAlert {
    item: InventoryItem;
    currentQuantity: bigint;
    threshold: bigint;
}

// GST Return types (to be implemented in backend)
export interface GSTR1Data {
    period: string;
    totalTaxableValue: number;
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    invoiceCount: bigint;
    invoices: Array<Invoice>;
}

export interface GSTR3BData {
    period: string;
    outwardSupplies: number;
    inwardSupplies: number;
    itcAvailable: number;
    totalTax: number;
}

// Audit log types (to be implemented in backend)
export interface AuditLog {
    id: string;
    timestamp: Time;
    actor: Principal;
    action: string;
    details: string;
    invoiceId?: string;
}

export interface AuditFilters {
    actionType?: string;
    startDate?: Time;
    endDate?: Time;
    limit?: bigint;
    offset?: bigint;
}

// Extended Invoice type with verification history
export interface InvoiceWithHistory extends Invoice {
    verificationHistory?: {
        actor: Principal;
        action: string;
        timestamp: Time;
    };
}
