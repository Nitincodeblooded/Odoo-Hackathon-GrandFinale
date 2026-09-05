# Implementation Plan

Build in vertical slices so every stage leaves a demonstrable workflow.

## Step 1: Foundation

- Establish root scripts for frontend and backend.
- Add MongoDB connection configuration and a consistent API response/error shape.
- Define authentication, roles, and permission middleware.
- Create the first health endpoint and seed strategy.

## Step 2: Database architecture

- Define Mongoose models for employees, contracts, schedules, attendance, time off, salary configuration, payruns, payslips, and payslip lines.
- Use ObjectId references for parent-child relationships and timestamps for historical tracking.
- Add enums, validation, uniqueness rules, and period-oriented indexes.
- Preserve finalized payroll values through employee and contract snapshots on payslips.
- Keep cross-document rules such as overlapping-contract detection in application services.

## Step 3: Authentication and RBAC

- Add User identities linked one-to-one with Employees.
- Hash passwords with bcrypt and issue expiring JWT access tokens.
- Protect routes with authentication and role authorization middleware.
- Keep public registration limited to Employee accounts; bootstrap and manage elevated roles through Admin-only operations.
- Preserve ownership checks as a separate layer from role checks for employee self-service data.

## Step 4: Employee foundation

- Employee, department, job position, and user models.
- Employee list/form views and role-aware navigation.
- Related-record counts and employee detail route.

## Step 5: Contracts and schedules

- Historical contract model with period validation.
- Working schedule model with calculated weekly hours.
- Employee assignment and applicable-contract service.

## Step 6: Attendance and time off

- Attendance records, exception states, corrections, and worked-hour calculation.
- Time-off types, allocations, requests, approval workflow, and balance consumption.

## Step 7: Salary configuration

- Salary categories, structures, and ordered rules.
- A tested calculation service supporting fixed amounts, percentages, and formulas.

## Step 8: Payruns and payslips

- Two-step payrun creation flow.
- Contract selection, salary calculation, warnings, compute, validate, and paid states.
- Payslip detail view, PDF generation, and bulk delivery boundary.

## Step 9: Dashboard and polish

- Live dashboard aggregations and filters.
- Kanban/list/form usability, loading/error/empty states, permissions, and audit history.
- Seeded demo data and the two five-minute walkthroughs.

Phase 3 employee management is the first complete operational hub slice: it provides role-aware employee listing, detail views, CRUD management, soft deactivation, relationship validation, and related-record counts.

Phase 4 contracts and working schedules now provide derived weekly hours, historical contract records, active-period overlap validation, and a single applicable-contract service for payroll consumption.

Phase 5 attendance now provides check-in/check-out lifecycle handling, derived worked hours, missing-checkout exceptions, and role-restricted manual corrections.

Phase 6 time off now provides policy types, approved allocations, employee balances, request submission, approval/refusal, and atomic balance deduction.

Phase 7 salary structures and rules now provide ordered fixed, percentage, and formula calculations with dependencies and payslip-ready lines.

Phase 8 Payruns now provide two-step employee selection, contract-aware computation, salary-rule-driven payslips, guarded validation/payment transitions, and delivery timestamps.

Phase 9 now combines contract wage, attendance, approved leave, employee data, and configuration-driven salary rules into historical payslips with blocking payroll warnings.

## First technical milestone

Complete Step 1 and the employee foundation with one vertical check: an authorized user can create an employee, retrieve it through the API, and see it in the frontend.
