# Phase 8: Payruns

Payrun creation is deliberately a two-step workflow.

## Step 1: Configure and preview

`POST /api/payruns/preview`

```json
{
  "salaryStructureId": "...",
  "periodStart": "2026-09-01",
  "periodEnd": "2026-09-30"
}
```

The preview returns eligible employees with their applicable period contract and ineligible employees with warnings. No Payrun or Payslip is created.

## Step 2: Explicit employee selection

`POST /api/payruns`

```json
{
  "code": "PAY-2026-09",
  "name": "September 2026 Payroll",
  "salaryStructureId": "...",
  "periodStart": "2026-09-01",
  "periodEnd": "2026-09-30",
  "employeeIds": ["..."]
}
```

Only selected employees are stored on the Payrun. Every selected employee must be eligible for the selected period.

## Processing lifecycle

```text
Draft -> Compute -> Validate -> Mark Paid -> Send Payslips
```

- **Compute** selects the applicable contract for every employee, runs the selected salary structure rules, creates/updates Payslips, and persists Salary Rule Lines.
- **Validate** blocks when warnings exist or the payslip count does not match the explicit employee selection.
- **Mark Paid** is available only after validation and updates the Payrun and Payslip statuses.
- **Send Payslips** is available only after payment and records delivery timestamps. An email provider can be attached at this boundary without changing payroll calculation.

## Endpoints

- `POST /api/payruns/preview`
- `POST /api/payruns`
- `GET /api/payruns`
- `GET /api/payruns/:payrunId`
- `POST /api/payruns/:payrunId/compute`
- `POST /api/payruns/:payrunId/validate`
- `POST /api/payruns/:payrunId/mark-paid`
- `POST /api/payruns/:payrunId/send-payslips`

All Payrun endpoints require an HR Payroll User, HR Payroll Manager, or Admin role.
