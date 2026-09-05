# Phase 1: Database Architecture

MongoDB stores each major business object as a collection. Relationships use ObjectId references, while finalized payroll documents keep snapshots of the values used for calculation.

## Entity map

```text
Employee
  |-- Contract --> SalaryStructure --> SalaryRule
  |-- WorkingSchedule
  |-- Attendance
  |-- TimeOffRequest --> TimeOffType
  |-- TimeOffAllocation --> TimeOffType

Payrun --> Payslip --> PayslipLine --> SalaryRule
```

## Collections and keys

| Collection | Parent references | Important keys and indexes |
|---|---|---|
| `employees` | optional `userId`, `managerId`, `workingScheduleId` | unique `employeeNumber`; sparse unique `workEmail`; `department`, `status` |
| `contracts` | `employeeId`, `salaryStructureId`, optional `workingScheduleId` | `employeeId + startDate/endDate`; status; period lookup |
| `working_schedules` | none | unique name; active |
| `salary_structures` | none | unique code; active |
| `salary_rules` | `salaryStructureId` | unique `salaryStructureId + code`; execution sequence |
| `attendances` | `employeeId` | unique `employeeId + workDate`; status |
| `time_off_types` | none | unique code; active |
| `time_off_allocations` | `employeeId`, `timeOffTypeId` | employee/type/status; validity period |
| `time_off_requests` | `employeeId`, `timeOffTypeId`, optional `allocationId` | employee/status; date range |
| `payruns` | `salaryStructureId` | unique `code`; period/status |
| `payslips` | `payrunId`, `employeeId`, `contractId`, `salaryStructureId` | unique `payrunId + employeeId`; employee/period |
| `payslip_lines` | `payslipId`, `salaryRuleId` | unique `payslipId + code`; payslip/sequence |

## Enums

- Employee status: `active`, `inactive`, `terminated`
- Contract status: `draft`, `active`, `expired`, `cancelled`
- Attendance status: `present`, `late`, `absent`, `overtime`, `missing_checkout`, `corrected`
- Time-off request status: `draft`, `submitted`, `approved`, `refused`, `cancelled`
- Allocation status: `draft`, `approved`, `expired`, `cancelled`
- Payrun status: `draft`, `computing`, `computed`, `validated`, `paid`, `cancelled`
- Payslip status: `draft`, `computed`, `validated`, `paid`, `cancelled`
- Salary rule amount type: `fixed`, `percentage`, `formula`
- Salary rule category: `basic`, `allowance`, `gross`, `deduction`, `contribution`, `net`

## Constraints

- Employee number and work email are unique when present.
- Contract end date must be on or after start date.
- Attendance check-out cannot be before check-in; worked hours cannot be negative.
- Time-off request end date cannot precede its start date; approved requests require an allocation when the type requires allocation.
- Payrun end date cannot precede its start date.
- A payrun can contain only one payslip per employee.
- A payslip can contain only one line per salary-rule code.
- Salary rules execute in ascending sequence; rule codes are unique inside a structure.
- Application services must reject overlapping active contracts for the same employee and period.
- Finalized payslips store employee, contract, and salary-structure snapshots for historical accuracy.

## Lifecycle guidance

Use `createdAt` and `updatedAt` on every collection. Do not delete finalized contracts, payruns, payslips, attendance corrections, or approved time-off records; transition their status and preserve the history instead.
