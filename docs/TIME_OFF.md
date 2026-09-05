# Phase 6: Time Off

Time off follows this business workflow:

```text
Time Off Type -> Allocation -> Employee Balance -> Request -> Approval/Refusal -> Balance deduction
```

## Endpoints

- `GET /api/time-off/types`
- `POST /api/time-off/types` (HR roles)
- `PATCH /api/time-off/types/:typeId` (HR roles)
- `GET /api/time-off/allocations`
- `POST /api/time-off/allocations` (HR roles)
- `POST /api/time-off/allocations/:allocationId/approve` (HR roles)
- `GET /api/time-off/requests`
- `POST /api/time-off/requests`
- `POST /api/time-off/requests/:requestId/approve` (HR roles)
- `POST /api/time-off/requests/:requestId/refuse` (HR roles)

## Business rules

- A type defines days or hours, whether allocation is required, whether approval is required, and whether it integrates with payroll.
- Allocations begin as `draft`; only approved allocations contribute available balance.
- Employee balances are calculated as `allocatedAmount - usedAmount`.
- Day-based requests calculate inclusive calendar days from start to end. Hour-based requests require a positive `requestedAmount`.
- Requests are submitted before approval. Refusal does not consume balance.
- Approval selects an approved allocation valid for the request dates and atomically increments `usedAmount` only when enough balance remains.
- Concurrent approvals cannot consume more than the allocation because the update condition checks remaining balance in the same database operation.
- If a type does not require approval, creation immediately uses the same approval service and consumes the allocation.
- Approved requests retain `allocationId`, approver, approval timestamp, and their original amount for history.
