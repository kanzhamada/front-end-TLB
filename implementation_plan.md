# Voucher Management Implementation Plan

## Goal
Implement the Admin Voucher Management module, allowing admins to view, create, update, and delete vouchers and redeem codes.

## Proposed Changes

### API Layer
- [x] Create `src/lib/api/admin/voucher.ts` with `getVouchers`, `createVoucher`, `updateVoucher`, `deleteVoucher`.

### UI Components

#### Voucher List Page (`src/routes/(admin)/a1-portal-a16-tlb/(dashboard)/Voucher/+page.svelte`)
- Fetch and display list of vouchers.
- Columns: Title, Type, Value, Start Date, Expire Date, Status (Active/Expired).
- Actions: Edit, Delete.
- "Create New Voucher" button.

#### Create Voucher Page (`src/routes/(admin)/a1-portal-a16-tlb/(dashboard)/Voucher/Create/+page.svelte`)
- Form to create a new voucher.
- Fields: Type (Voucher/Redeem Code), Title, Value, Start Date, Expire Date, Description, Code (if Redeem Code).

#### Edit Voucher Page (`src/routes/(admin)/a1-portal-a16-tlb/(dashboard)/Voucher/[id]/+page.svelte`)
- Form to edit an existing voucher.
- Pre-fill data from `getVouchers` (or fetch single if endpoint exists, otherwise filter from list).
- *Note: API docs don't show "Get Single Voucher", so we might need to pass data or filter from the list if possible, or just use the update endpoint blindly if we have the data.* -> *Actually, usually we fetch the list and find the item, or there's a get-by-id. I'll check if I can just use the list data.*

## Verification Plan
- Verify `getVouchers` loads data.
- Verify `createVoucher` adds a new item.
- Verify `updateVoucher` modifies the item.
- Verify `deleteVoucher` removes the item.
