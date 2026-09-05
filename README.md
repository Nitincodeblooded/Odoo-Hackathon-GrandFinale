# PeoplePay360: HR & Payroll

An integrated HR and payroll operations platform for the Odoo hackathon.

The product brief is captured in [docs/PROBLEM_STATEMENT.md](docs/PROBLEM_STATEMENT.md), and the staged delivery plan is in [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

## Project structure

```text
frontend/    React and Vite application
backend/     Express and MongoDB Atlas API
docs/        Product requirements and implementation plan
```

## Development approach

We are building vertical slices in this order:

1. Foundation, authentication, roles, and permissions
2. Employees
3. Contracts and working schedules
4. Attendance and time off
5. Salary structures and rules
6. Payruns and payslips
7. Dashboard, reporting, and demo polish

The first milestone is an authorized user creating an employee through the API and viewing it in the frontend.

## Phase 0 setup

```bash
npm install
npm run install:all
```

Copy the environment templates before running the applications:

```bash
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## MongoDB Atlas setup

1. Create a MongoDB Atlas project and free cluster.
2. Create a database user and store its username and password securely.
3. In **Network Access**, add the IP address used by the development machine.
4. In **Connect > Drivers**, copy the Node.js connection string.
5. Replace the placeholders in `backend/.env` and keep that file out of Git.

The connection string should use the `mongodb+srv://` format and include the `peoplepay360` database name, for example:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER_URL/peoplepay360?retryWrites=true&w=majority&appName=PeoplePay360
```

Start both applications with:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`. The backend runs at `http://localhost:5000`, and its health endpoint is `http://localhost:5000/api/health`.

The API still starts when Atlas is unavailable, while `/api/health` exposes the current database state. Never commit `backend/.env` or place Atlas credentials in source files.

## Phase 2 authentication

Roles are ordered by responsibility: `employee`, `hr_manager`, `hr_payroll_user`, `hr_payroll_manager`, and `admin`.

| Role | Access |
|---|---|
| Employee | Own employee details, attendance, and time-off workflows |
| HR Manager | Employee, attendance, contract, schedule, and time-off administration |
| HR Payroll User | HR Manager access plus payrun/payslip create, read, and update; read-only salary configuration |
| HR Payroll Manager | Full HR and payroll configuration access |
| Admin | All modules, users, roles, and permissions |

Public registration always creates an `employee` account. Bootstrap the first Admin through environment variables:

```powershell
Copy-Item backend/.env.example backend/.env
# Set ADMIN_* and Atlas values in backend/.env
npm run seed:admin --prefix backend
```

Authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` with `Authorization: Bearer <token>`
- `PATCH /api/auth/users/:userId/role` for Admin only

Protected employee endpoints include `GET /api/employees` for all authenticated roles and `POST /api/employees` for HR and Admin roles.