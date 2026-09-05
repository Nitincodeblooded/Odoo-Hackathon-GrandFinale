# Phase 11: Live Payroll Dashboard

`GET /api/dashboard` returns live aggregates from Employees, Contracts, Attendance, Time Off Requests, Payruns, and Payslips.

## Filters

- `periodStart`
- `periodEnd`
- `department`
- `employeeType`

The default period is the previous twelve months through today. Terminated employees are excluded from operational filters.

## KPIs

- `totalNetSalaryPaid`: sum of paid payslip net amounts.
- `payslipsGenerated`: count of paid payslips in the selected period.
- `averageSalary`: total paid net salary divided by paid payslips.
- `approvedTimeOff`: sum of approved request amounts overlapping the period.
- `attendanceHealth`: present, late, overtime, and corrected records as a percentage of attendance records.

## Charts and alerts

- Salary cost by department uses paid payslip snapshots and employee department data.
- Monthly net salary trend groups paid payslips by payroll start month.
- Missing information alerts inspect current employee email, department, position, and bank fields.
- Duplicate payslip alerts use database aggregation by employee and payroll period.
- Contract alerts call the same applicable-contract service used by payroll.
- Payroll status and persisted Payrun warnings are included in the operational alert feed.

The frontend dashboard consumes this endpoint and renders the returned values; it does not contain static chart or KPI data.
