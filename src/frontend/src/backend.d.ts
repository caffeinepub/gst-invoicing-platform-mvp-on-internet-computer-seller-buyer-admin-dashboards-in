import type { Principal } from "@icp-sdk/core/principal";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}

export interface None {
    __kind__: "None";
}

export type Option<T> = Some<T> | None;
export type Time = bigint;

export interface Invoice {
    id: string;
    status: Variant_verified_cancelled_paid_sent_rejected_draft;
    seller: Principal;
    timestamp: Time;
    gstRate: GSTType;
    buyer?: Principal;
    placeOfSupply: string;
    items: Array<[string, bigint]>;
}

export type GSTType = {
    __kind__: "igst";
    igst: number;
} | {
    __kind__: "cgstSgst";
    cgstSgst: number;
};

export interface UserProfile {
    appRole: AppRole;
    gstNumber?: string;
    name: string;
    state?: string;
    companyName?: string;
}

export enum AppRole {
    admin = "admin",
    seller = "seller",
    buyer = "buyer"
}

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

export enum Variant_verified_cancelled_paid_sent_rejected_draft {
    verified = "verified",
    cancelled = "cancelled",
    paid = "paid",
    sent = "sent",
    rejected = "rejected",
    draft = "draft"
}

export interface backendInterface {
    assignAdminRole(user: Principal, profile: UserProfile): Promise<void>;
    assignBuyerRole(user: Principal, profile: UserProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignSellerRole(user: Principal, profile: UserProfile): Promise<void>;
    calculateGST(amount: number, gstType: GSTType): Promise<number>;
    createInvoice(id: string, buyer: Principal | null, items: Array<[string, bigint]>, gstRate: GSTType, pStatus: Variant_verified_cancelled_paid_sent_rejected_draft, placeOfSupply: string): Promise<void>;
    createInvoiceCaller(id: string, buyer: Principal | null, items: Array<[string, bigint]>, gstRate: GSTType, status: Variant_verified_cancelled_paid_sent_rejected_draft, placeOfSupply: string): Promise<void>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAppRole(user: Principal): Promise<AppRole | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInvoice(id: string): Promise<Invoice | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserRole(user: Principal): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    rejectInvoice(id: string): Promise<void>;
    requestInvoiceModification(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateInvoice(id: string, pStatus: Variant_verified_cancelled_paid_sent_rejected_draft): Promise<void>;
    verifyInvoice(id: string): Promise<void>;
}
