# Phase 9: Payslip and Payroll Engine

The Payrun computation boundary combines:

```text
Employee
  + applicable period contract
  + attendance
  + approved leave
  + salary structure
  + ordered salary rules
  -> Payslip and Payslip Lines
```

## Calculation inputs

- `BASIC`: applicable contract wage; a BASIC fixed rule uses this payroll input.
- `WORKED_DAYS`: attendance records with present, late, overtime, or corrected status.
- `APPROVED_LEAVE_DAYS`: approved day-based time off overlapping the payroll period.
- `APPROVED_LEAVE_HOURS`: approved hour-based time off overlapping the payroll period.
- Structure-specific rule codes and dependencies.

The configured salary rules produce the Basic, Allowances, Gross, Deductions, and Net values. No payroll totals are hardcoded in the Payrun service.

## Warnings

Computation persists warnings on the Payrun and validation is blocked until they are resolved:

- Missing bank information
- Duplicate payslip for the employee and period
- Missing applicable contract
- Applicable contract using a different salary structure
- Incomplete employee information such as email, department, or position
- Invalid or empty salary-rule configuration
- Salary-rule calculation or dependency failures

Missing employee bank information is a warning for review; missing contracts, duplicate payslips, and invalid configuration prevent a payslip from being generated for that employee or Payrun.

## Historical output

Each generated Payslip stores the selected employee, contract, structure, period, amounts, and employee/contract snapshots. Each Salary Rule Line stores the exact rule code, category, sequence, and calculated amount used for that payslip.
