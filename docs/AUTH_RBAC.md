# Phase 2: Authentication and RBAC

## Identity model

`User` is the authentication identity. It stores a normalized unique email, bcrypt `passwordHash`, role, active state, login timestamp, and required `employeeId`. `Employee.userId` provides the reverse one-to-one relationship for employee-facing workflows.

Passwords are never returned by queries or API responses. JWTs contain only the user id (`sub`) and role, expire according to `JWT_EXPIRES_IN`, and must be sent as `Authorization: Bearer <token>`.

## Registration and bootstrap

- Public registration creates only the `employee` role.
- The first Admin is created with the backend `seed:admin` command and secret environment variables.
- Only an authenticated Admin can change a user's role.
- Inactive users cannot authenticate, even if a previously issued token has not expired.

## Authorization matrix

- Employee: self-service employee, attendance, and time-off actions.
- HR Manager: employee, attendance, contract, schedule, and time-off administration.
- HR Payroll User: HR Manager permissions plus payrun/payslip create, read, and update; salary configuration read-only.
- HR Payroll Manager: full HR and payroll configuration access.
- Admin: unrestricted platform access, user management, roles, and permissions.

Route handlers should use `authenticate` first and `authorize(...roles)` for module-specific permissions. Ownership checks remain separate from role checks: a valid Employee token must still be limited to that employee's own records.
