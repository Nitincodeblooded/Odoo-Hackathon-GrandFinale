# Phase 3: Employee Management

The Employee record is the operational hub for HR activity. Contracts, schedules, attendance, time off, and allocations reference `employeeId` and are reachable from the employee detail view through related counts.

## API

- `GET /api/employees`: HR and Admin roles receive the employee directory; an Employee receives only their own record.
- `GET /api/employees/:employeeId`: view an employee and related-record counts.
- `POST /api/employees`: create an employee; HR and Admin roles only.
- `PATCH /api/employees/:employeeId`: update employee identity, department, manager, job position, schedule, type, or status; HR and Admin roles only.
- `DELETE /api/employees/:employeeId`: soft-deactivate by setting `status=terminated`, recording `terminationDate`, and disabling the linked user; HR and Admin roles only.

## Management rules

- Employee numbers and work emails remain unique.
- Managers must be active employees, and an employee cannot manage themselves.
- Working schedules must exist and be active before assignment.
- Deactivation preserves the employee and all related history.
- A deactivated employee's login cannot authenticate.
