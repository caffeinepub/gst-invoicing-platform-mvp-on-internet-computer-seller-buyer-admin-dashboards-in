export const POLLING_CONFIG = {
  default: 10000, // 10 seconds
  invoices: 10000, // 10 seconds - invoice list and detail views
  inventory: 15000, // 15 seconds - inventory and low stock alerts
  payments: 10000, // 10 seconds - payment status tracking
  audit: 15000, // 15 seconds - audit log updates
};
