# PeoplePay360: HR & Payroll Management System

A comprehensive, integrated HR and payroll operations platform built with React, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)

### Installation

1. **Clone and install dependencies:**
```bash
npm install
npm run install:all
```

2. **Setup environment files:**
```bash
# Copy environment templates
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

3. **Configure MongoDB Atlas:**
   - Create a MongoDB Atlas project and free cluster
   - Create a database user with credentials
   - In **Network Access**, whitelist your IP address
   - In **Connect > Drivers**, copy the connection string
   - Update `backend/.env` with your connection string (include database name `peoplepay360`)

Example connection string:
```text
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_URL/peoplepay360?retryWrites=true&w=majority
```

4. **Add JWT secret to backend/.env:**
```text
JWT_SECRET=your-super-secret-key-here
```

### Running the Application

**Option 1: Run both frontend and backend together:**
```bash
npm run dev
```

**Option 2: Run separately:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Seeding Demo Data

**Seed comprehensive demo data (recommended for testing):**
```bash
npm run seed:demo --prefix backend
```

This creates:
- 20 employees across 6 departments
- User accounts with different roles
- Active contracts with salary structures
- 90 days of attendance records
- Time-off allocations and requests
- 3 months of completed payruns with payslips

**Demo Login Credentials:**
- **Admin:** `admin@example.com` / `password123`
- **HR Manager:** `lisa.taylor@company.com` / `password123`
- **Payroll Specialist:** `samantha.king@company.com` / `password123`
- **Employee:** `john.smith@company.com` / `password123`

**Or create just an admin account:**
```bash
# Set ADMIN_* variables in backend/.env first
npm run seed:admin --prefix backend
```

## 📋 Features

### Core Modules

✅ **Employee Management**
- Grid and list views with search
- Complete employee profiles
- Department and job position tracking
- Bank account information
- CRUD operations with role-based access

✅ **Attendance Tracking**
- Daily check-in/check-out
- Attendance status tracking (present, late, overtime, absent)
- Historical attendance records
- 90-day attendance health metrics

✅ **Time-Off Management**
- Multiple leave types (annual, sick, PTO)
- Allocation and request workflows
- Approval/refusal with reason tracking
- Balance tracking per employee

✅ **Contract & Schedule Management**
- Multiple contract types (permanent, fixed-term, part-time)
- Working schedule configuration
- Period-based contract validation
- Wage and currency management

✅ **Payroll Processing**
- 2-step payrun creation wizard
- Eligible employee preview with warnings
- Salary structure with configurable rules
- Payrun workflow: draft → compute → validate → paid
- Automatic payslip computation
- PDF generation
- Email delivery system

✅ **Dashboard & Analytics**
- Real-time KPI cards
- Interactive period and department filters
- Salary cost visualizations (bar, line, pie charts)
- Department breakdown table
- Attendance and time-off overview widgets
- Operational alerts panel

### Technical Features

- **Authentication & Authorization:** JWT-based with 5 role levels
- **Role-Based Access Control (RBAC):** Granular permissions per module
- **Responsive Design:** Mobile-friendly interface
- **Real-time Updates:** Dynamic data refresh
- **Error Handling:** Comprehensive validation and user feedback
- **PDF Generation:** Payslip PDF export
- **Email Notifications:** Automated payslip delivery

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19 with Vite
- React Router v7+ (lazy loading, protected routes)
- Recharts for data visualization
- Lucide React for icons
- Custom component library
- CSS with design system

**Backend:**
- Express.js with ES modules
- MongoDB with Mongoose ODM
- JWT authentication
- bcryptjs for password hashing
- PDFKit for PDF generation
- Nodemailer for email delivery
- Clean MVC architecture

### Project Structure

```text
frontend/
  src/
    components/       # Reusable UI components
    contexts/         # React contexts (Auth)
    layouts/          # Page layouts (AppLayout)
    pages/            # Route pages
    services/         # API service layer
    styles.css        # Global styles

backend/
  src/
    config/           # Database and environment config
    controllers/      # Request handlers
    middleware/       # Auth and error middleware
    models/           # Mongoose schemas
    routes/           # API routes
    services/         # Business logic
    scripts/          # Seed scripts
    index.js          # Express app entry

docs/                 # Documentation and requirements
```

## 👥 User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Employee** | View own details, check-in/out, request time-off, view own payslips |
| **HR Manager** | Employee management, attendance, contracts, schedules, time-off administration |
| **HR Payroll User** | HR Manager access + payrun/payslip operations, read-only salary config |
| **HR Payroll Manager** | Full HR and payroll access, salary configuration |
| **Admin** | All modules, user management, role assignment, system configuration |

## 📊 Data Model

Key entities:
- **Employee** - Personal info, department, position, bank details
- **User** - Authentication credentials, role, linked to employee
- **Contract** - Employment contract with wage, schedule, salary structure
- **WorkingSchedule** - Weekly working hours configuration
- **Attendance** - Daily check-in/out records
- **TimeOffType** - Leave type definitions (annual, sick, etc.)
- **TimeOffAllocation** - Employee leave balance
- **TimeOffRequest** - Leave requests with approval workflow
- **SalaryStructure** - Collection of salary rules
- **SalaryRule** - Formula-based salary component (basic, allowance, deduction)
- **Payrun** - Batch payroll processing period
- **Payslip** - Individual employee payment slip
- **PayslipLine** - Detailed salary calculation breakdown

## 🔐 API Authentication

All protected endpoints require JWT bearer token:
```http
Authorization: Bearer <your-jwt-token>
```

**Auth Endpoints:**
- `POST /api/auth/register` - Create employee account
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user profile

## 🧪 Testing

1. Start the application with demo data seeded
2. Login with demo credentials
3. Test workflows:
   - Navigate between modules
   - Create a new employee
   - Record attendance
   - Submit time-off request
   - Create a payrun and process payslips
   - View dashboard analytics

## 📝 Development Scripts

**Backend:**
```bash
cd backend
npm start              # Start server
npm run dev            # Start with hot reload
npm run seed:demo      # Seed demo data
npm run seed:admin     # Create admin user
```

**Frontend:**
```bash
cd frontend
npm run dev            # Start dev server
npm run build          # Production build
npm run preview        # Preview production build
```

## 🎨 Design System

**Colors:**
- Primary Green: `#295448`
- Accent Orange: `#bd5c35`
- Neutral Cream: `#f8f5f0`
- Text Gray: `#788278`

**Typography:**
- Headings: Georgia, serif
- Body: system-ui, -apple-system, sans-serif

## 📖 Additional Documentation

- [Problem Statement](docs/PROBLEM_STATEMENT.md) - Original requirements
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Development roadmap
- [Data Model](docs/DATA_MODEL.md) - Database schema details
- [API Documentation](docs/) - Module-specific API docs

## 🤝 Contributing

This project was built for the Odoo Hackathon Grand Finale. The implementation focuses on:
- Clean, maintainable code
- Comprehensive feature coverage
- Production-ready error handling
- User-friendly interface
- Complete payroll workflow

## 📄 License

This project is created for educational and demonstration purposes.

---

**Built with ❤️ for the Odoo Hackathon**