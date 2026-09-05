# PeoplePay360: HR & Payroll

PeoplePay360 is an integrated HR and payroll operations platform. The employee record is the central hub connecting contracts, working schedules, attendance, time off, and payroll.

## Product goal

Support the complete employee lifecycle from master data and daily time tracking through salary computation, payslip generation, payment status, and reporting.

## Roles

- **Employee**: View personal details, attendance, and leave balances; create attendance entries and time-off requests.
- **HR Manager**: Manage employees, contracts, schedules, attendance, and time off; approve or refuse requests.
- **HR Payroll User**: HR Manager permissions plus create/read/update payruns and payslips; read-only salary configuration.
- **HR Payroll Manager**: Full HR and payroll configuration access, including salary structures and rules.
- **Admin**: Full system access, user management, roles, and permissions.

## Core modules

1. **Employees**: Kanban/list/form views, employee identity, department, manager, job position, schedule, status, and related-record actions.
2. **Contracts**: Historical contracts with period-specific selection, wage, department, position, and salary structure. Payroll must use exactly the applicable contract for the selected period.
3. **Working schedules**: Weekly day/start/end/break patterns with automatically calculated weekly hours.
4. **Attendance**: Check-in, check-out, worked hours, exceptions, corrections, overtime, and missing check-out tracking.
5. **Time off**: Leave types, allocations, requests, approvals/refusals, balances, validity periods, and automatic consumption of approved allocations.
6. **Salary structures and rules**: Ordered rules for basic salary, allowances, gross, deductions, contributions, and net salary using fixed amounts, percentages, or formulas.
7. **Payruns and payslips**: Period and structure selection, explicit employee selection, compute, warnings, validate, mark paid, PDF generation, and bulk delivery.
8. **Dashboard and reporting**: Live KPIs, department salary costs, monthly net trends, attendance, leave, staffing, payroll warnings, and filters by period, department, and employee type.

## Critical business rules

- Payroll selects the contract valid for the payrun period.
- Concurrent or duplicate applicable contracts must be surfaced as warnings.
- Salary rules execute in sequence so later rules can depend on earlier totals.
- Approved time off consumes the matching allocation and updates the balance.
- Payrun creation is a two-step flow: configure period/structure, select employees, then create.
- Missing bank details, incomplete employee data, duplicate payslips, and contract issues block or warn before finalization.
- Dashboard values must come from operational records, not static chart data.

## Required demo flows

### Employee to payslip

Create an employee and valid contract, assign a schedule and salary structure, record attendance, create a payrun for a period, select the employee, compute and validate the payslip, then view the breakdown and generate a PDF.

### Leave allocation to request

Configure a time-off type, allocate days to an employee, submit a request, approve it, and verify that the remaining balance is reduced.
