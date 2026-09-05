# Phase 7: Salary Structures and Rules

Salary configuration is executable payroll logic, not static reference data.

## Structure

A salary structure groups ordered rules such as:

```text
Regular Salary
  BASIC -> HRA -> ALLOWANCE -> GROSS -> TAX -> DEDUCTION -> NET
```

Each rule has a unique code within its structure, category, sequence, amount type, and optional dependencies.

Supported amount types:

- `fixed`: uses `amount`.
- `percentage`: applies `percentage` to the sum of the rules listed in `dependsOn`.
- `formula`: evaluates a safe arithmetic expression such as `BASIC + HRA - TAX`.

Formulas support rule codes, numbers, parentheses, and `+ - * /`. Arbitrary JavaScript is never executed.

## Calculation behavior

`calculateSalaryRules` sorts active rules by sequence, verifies dependencies have already been calculated, calculates each amount, and emits payslip-ready lines. It also derives:

- `grossAmount` from `basic`, `allowance`, and `gross` lines
- `deductionAmount` from `deduction` and `contribution` lines
- `netAmount` from the explicit `NET` value or gross minus deductions

This service is the calculation boundary that Payrun/Payslip generation must call. Salary rules therefore actively drive payslip lines and totals.

## API

- `GET /api/salary-structures`: HR Payroll User, HR Payroll Manager, Admin
- `GET /api/salary-structures/:structureId`
- `GET /api/salary-structures/:structureId/rules`
- `POST /api/salary-structures`: HR Payroll Manager, Admin
- `PATCH /api/salary-structures/:structureId`: HR Payroll Manager, Admin
- `POST /api/salary-structures/:structureId/rules`: HR Payroll Manager, Admin
- `PATCH /api/salary-structures/:structureId/rules/:ruleId`: HR Payroll Manager, Admin
- `DELETE /api/salary-structures/:structureId/rules/:ruleId`: deactivates a rule
- `POST /api/salary-structures/:structureId/calculate`: previews calculation from `{ "inputs": { ... } }`
