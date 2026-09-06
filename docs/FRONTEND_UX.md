# Phase 12: Frontend Integration and UX

The frontend is organized as one operational workspace rather than disconnected CRUD pages.

## Navigation

- Dashboard: live payroll KPIs, charts, and alerts
- Employees: searchable directory and employee hub records
- Attendance: daily records, exceptions, and self-service check-in
- Time off: request and approval records
- Payroll: Payrun status and net totals

## Employee hub

Selecting an employee opens a detail view with profile data, manager, working schedule, employment type, and related-record smart counts for contracts, attendance, time off, and allocations.

## UX states

The shell includes authenticated sign-in, loading states, API error notices, empty states, responsive navigation, mobile layouts, and sign-out. Role-restricted APIs fail independently so an Employee can still use permitted views when dashboard or payroll data is unavailable.

The dashboard and module lists consume live API responses; no business metrics or chart values are hardcoded in the frontend.
