# Phase 4: Contracts and Working Schedules

## Working schedules

A working schedule contains one entry per working day with:

- `dayOfWeek` from `0` (Sunday) through `6` (Saturday)
- `startTime` and `endTime` in `HH:mm`
- `breakMinutes`

`weeklyHours` is derived during model validation from the net daily intervals. It cannot be trusted as user-entered data. Duplicate days, end times before start times, and breaks longer than the interval are rejected.

Endpoints:

- `GET /api/working-schedules`
- `GET /api/working-schedules/:scheduleId`
- `POST /api/working-schedules`
- `PATCH /api/working-schedules/:scheduleId`
- `DELETE /api/working-schedules/:scheduleId` (deactivates the schedule)

## Contracts

Contracts retain their historical records and reference an employee, salary structure, and optional working schedule. Each contract stores start/end dates, wage, currency, department, position, and lifecycle status.

Active contracts cannot overlap for the same employee. A contract with no end date is open-ended and overlaps any later active contract until it is closed or cancelled.

Endpoints:

- `GET /api/contracts`
- `GET /api/contracts/:contractId`
- `POST /api/contracts`
- `PATCH /api/contracts/:contractId`
- `GET /api/contracts/applicable?employeeId=<id>&periodStart=<date>&periodEnd=<date>`

## Payroll contract selection rule

`findApplicableContract(employeeId, periodStart, periodEnd)` selects only `active` contracts whose period overlaps the payroll period:

```text
contract.startDate <= payroll.periodEnd
AND (contract.endDate is empty OR contract.endDate >= payroll.periodStart)
```

The service fails when there is no applicable contract or more than one applicable contract. Payroll must call this service before computing a payslip; it must never choose an arbitrary contract.
