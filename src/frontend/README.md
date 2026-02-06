# GST Ledger - Frontend

A comprehensive GST invoicing and compliance management platform built on the Internet Computer.

## Architecture

This application uses a single Motoko backend canister with a React + TypeScript frontend. The architecture follows these principles:

- **Authentication**: Internet Identity for secure, decentralized authentication
- **Authorization**: Role-based access control (RBAC) with three roles: Seller, Buyer, and Admin
- **State Management**: React Query for server state, React hooks for local UI state
- **Real-time Updates**: Polling-based refresh (10-15s intervals) for near-real-time data
- **Styling**: Tailwind CSS with shadcn/ui components

### Architecture Diagram

