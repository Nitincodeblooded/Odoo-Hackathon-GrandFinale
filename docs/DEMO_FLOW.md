# PeoplePay360 - Demo Flow Guide

This guide provides a step-by-step walkthrough for demonstrating the complete functionality of PeoplePay360.

## Pre-Demo Setup

### 1. Environment Preparation
```bash
# Ensure MongoDB is running and accessible
# Backend should be running on http://localhost:5000
# Frontend should be running on http://localhost:5173

# Seed demo data (if not already done)
cd backend
npm run seed:demo
```

### 2. Verify Services
- ✅ Backend health check: http://localhost:5000/api/health
- ✅ Frontend loads: http://localhost:5173
- ✅ No console errors in browser developer tools

## Demo Script

### Act 1: Authentication & Dashboard (5 minutes)

#### Scene 1: Login as Admin
1. Navigate to http://localhost:5173
2. Login with admin credentials:
   - **Email:** `admin@example.com`
   - **Password:** `password123`
3. **Highlight:** Secure JWT-based authentication with role-based access control

#### Scene 2: Dashboard Overview
1. **Point out the comprehensive "Payroll Control Room":**
   - 6 KPI cards showing real-time metrics
   - Net salary paid: $111,000+ across all employees
   - Payslips generated, average salary, time-off, attendance health
   - Active employees count

2. **Interactive Filters:**
   - Click "Filters" button
   - Show period date range selection
   - Department filter dropdown (populated with actual departments)
   - Employee type filter options
   - Apply and reset functionality

3. **Rich Visualizations:**
   - **Bar Chart:** Salary cost by department
   - **Line Chart:** Monthly net salary trend (3 months historical)
   - **Pie Chart:** Department distribution with percentages
   - **Department Breakdown Table:** Headcount, total salary, average per department

4. **Operational Alerts:**
   - Live signals about missing employee data
   - Payroll warnings and status updates
   - Severity indicators (error/warning)

### Act 2: Employee Management (5 minutes)

#### Scene 1: Employee Grid View
1. Navigate to **Employees** from sidebar
2. **Show 20 employees across 6 departments:**
   - Engineering, Sales, HR, Finance, Operations, Marketing
   - Grid view with employee cards showing photos, names, positions, departments

3. **Search Functionality:**
   - Type "John" in search bar
   - Shows filtered results in real-time

4. **View Toggle:**
   - Switch between Grid and List views
   - List view shows tabular format

#### Scene 2: Create New Employee
1. Click **"+ Create Employee"** button
2. Fill form with sample data:
   - Employee Number: EMP021
   - Name: Alex Rodriguez
   - Email: alex.rodriguez@company.com
   - Department: Engineering
   - Position: DevOps Engineer
   - Type: Full Time
   - Bank details

3. Submit and show employee created
4. **Highlight:** Role-based access - only HR/Admin can create employees

#### Scene 3: Employee Detail View
1. Click on any employee card (e.g., John Smith)
2. **Show comprehensive employee profile:**
   - Personal information
   - Contact details
   - Employment details (hire date, type, status)
   - Bank information
   - Department and job position

3. **Related Records:**
   - Active contracts
   - Attendance summary
   - Time-off balance

### Act 3: Attendance Tracking (3 minutes)

1. Navigate to **Attendance** from sidebar
2. **Show attendance table:**
   - 90 days of historical records (~1,400 entries)
   - Employee name, date, check-in, check-out, status
   - Status badges (present, late, overtime, absent)
   - 95% attendance health rate

3. **Check-In Functionality:**
   - Click "Check In" button
   - Creates attendance record for current user
   - Shows timestamp

4. **Highlight:** Real-time tracking for workforce management

### Act 4: Time-Off Management (4 minutes)

#### Scene 1: Time-Off Overview
1. Navigate to **Time Off** from sidebar
2. **Balance Overview:**
   - Show all allocations (60 total)
   - 3 types: Annual Leave (21 days), Sick Leave (10 days), PTO (40 hours)
   - Remaining balance visible for each employee

#### Scene 2: Time-Off Requests
1. **View existing requests:**
   - 10 approved requests visible
   - Future dates, reasons, amounts
   - Status badges

2. **Create New Request:**
   - Click "Request Time Off"
   - Select type: Annual Leave
   - Choose date range (e.g., 2 weeks from now, 5 days)
   - Add reason: "Family vacation"
   - Submit request

3. **Highlight:** Approval workflow for managers

### Act 5: Contract Management (3 minutes)

1. Navigate to **Contracts** (HR/Admin only)
2. **Show contract list:**
   - All 20 employee contracts
   - Contract types: Permanent, Part-Time
   - Wages ranging $3,000-$7,500
   - Status badges (active)

3. **Contract Details:**
   - Click any contract
   - Shows employee, period, wage, schedule, salary structure
   - Active/expired status

4. **Highlight:** Foundation for payroll calculations

### Act 6: Payroll Processing - The Main Event (10 minutes)

#### Scene 1: Payrun List
1. Navigate to **Payroll** from sidebar
2. **Show existing payruns:**
   - 3 months of completed, paid payruns
   - Period displayed (e.g., "January 2024 Payroll")
   - Status badges (all showing "paid")

#### Scene 2: Create New Payrun - Step 1
1. Click **"+ New payrun"** button
2. **Wizard Step 1 opens:**
   - Enter Code: `PAY-2024-04`
   - Enter Name: `April 2024 Payroll`
   - Select Salary Structure: `Standard Monthly Salary`
   - Period Start: First day of current/next month
   - Period End: Last day of current/next month

3. Click **"Next: Select employees"**
4. **Highlight:** Structure selection determines salary rules

#### Scene 3: Create New Payrun - Step 2
1. **Preview screen shows:**
   - Eligible employees: 20
   - Ineligible employees: 0 (all have contracts)
   - Each employee listed with:
     - Name, department, wage
     - Data quality warnings (if any)

2. **Show employee selection:**
   - All pre-selected by default
   - Can deselect individuals
   - "Select all" toggle
   - Warnings displayed (e.g., "missing bank information")

3. Click **"Create Payrun"**
4. Redirects to payrun detail page
5. **Highlight:** Smart eligibility checking prevents errors

#### Scene 4: Payrun Detail & Actions
1. **Payrun Summary Card shows:**
   - Employees: 20
   - Total Gross: $0 (not computed yet)
   - Total Net: $0
   - Payslips: 0

2. **Status: Draft**
   - Show "Compute Payslips" button
   - Click to compute

3. **Computing Process:**
   - Loading spinner appears
   - Backend processes all 20 employees
   - Applies salary rules
   - Creates payslips with line items

4. **Status: Computed**
   - Summary updates:
     - Total Gross: ~$130,000
     - Total Net: ~$95,000
   - Payslips table populated with 20 entries
   - Shows warnings if any data issues
   - **Actions available:**
     - "Validate Payrun" (if no warnings)
     - "Re-compute" (to recalculate)

5. **Click "Validate Payrun":**
   - Confirmation modal appears
   - Explain: Locks payslips, prevents modifications
   - Confirm validation

6. **Status: Validated**
   - **Action:** "Mark as Paid"
   - Click and confirm
   - Indicates payments processed through bank

7. **Status: Paid**
   - **Action:** "Send Payslips"
   - Click and confirm
   - Triggers email delivery to all employees
   - Shows success count / failure count
   - **Note:** Requires SMTP config for actual emails

8. **Highlight:** Complete state machine ensures payroll accuracy

#### Scene 5: Payslip Detail
1. Click any payslip in the table
2. **Payslip Detail Page shows:**
   - Employee name and period
   - Status badge
   - **Line Items Table:**
     - Basic Salary: $5,500
     - Housing Allowance: $825 (15%)
     - Transport Allowance: $300
     - Gross Salary: $6,625
     - Tax Deduction: -$1,325 (20%)
     - Social Security: -$464 (7%)
     - Net Salary: $4,836

3. **Download PDF:**
   - Click "Download PDF" button
   - Opens PDF in new tab
   - Professional payslip document

4. **Highlight:** Complete salary breakdown with all rules applied

### Act 7: Salary Configuration (3 minutes)

1. Navigate to **Salary** (Payroll users only)
2. **Show salary structure:**
   - Name: "Standard Monthly Salary"
   - Code: STANDARD_MONTHLY
   - Status: Active

3. **Salary Rules:**
   - 7 rules in sequence
   - Categories: Basic, Allowance, Gross, Deduction, Contribution, Net
   - Formula-based calculations
   - Percentages and fixed amounts

4. **Highlight:** Flexible rule engine supports complex payroll requirements

### Act 8: Role-Based Access Control (2 minutes)

1. **Logout** from admin account
2. **Login as regular employee:**
   - Email: `john.smith@company.com`
   - Password: `password123`

3. **Show restricted access:**
   - Can view own dashboard
   - Can view own attendance
   - Can request time-off
   - **Cannot access:**
     - Other employees (except basic info)
     - Salary configuration
     - Payroll processing
     - Contract management

4. **Logout and login as HR Manager:**
   - Email: `lisa.taylor@company.com`
   - Password: `password123`
   - Show expanded access (employees, contracts, schedules)
   - Still no payroll access

5. **Highlight:** 5 role levels with granular permissions

## Key Talking Points

### Technical Excellence
✅ **Full-stack MERN application** (MongoDB, Express, React, Node.js)
✅ **Modern architecture:** React Router, lazy loading, context API, hooks
✅ **Security:** JWT authentication, role-based access control, input validation
✅ **UX:** Loading states, error handling, confirmation modals, responsive design
✅ **Performance:** Code splitting, optimized re-renders, efficient API calls
✅ **Visualization:** Recharts integration for rich analytics

### Business Value
✅ **Complete HR & Payroll solution** in one platform
✅ **Automated payroll processing** reduces manual errors
✅ **Real-time dashboard** for operational insights
✅ **Compliance tracking** with alerts for missing data
✅ **Employee self-service** reduces HR workload
✅ **Audit trail** with payrun status history
✅ **Scalable architecture** supports growth

### Implementation Highlights
✅ **20 employees** across 6 departments (demo data)
✅ **3 months** of payroll history
✅ **1,400+ attendance records** over 90 days
✅ **60 payslips** generated and paid
✅ **7 salary rules** in computation engine
✅ **4 role levels** for access control
✅ **11 routes/pages** with lazy loading
✅ **14 reusable components** in design system

## Troubleshooting Demo Issues

### If login doesn't work:
- Verify backend is running: http://localhost:5000/api/health
- Check MongoDB connection in backend console
- Ensure demo data was seeded: `npm run seed:demo --prefix backend`

### If data doesn't display:
- Check browser console for errors
- Verify API calls succeed in Network tab
- Ensure JWT token in localStorage (check Application tab)

### If charts don't render:
- Refresh the page
- Check that demo data includes payslips and attendance
- Verify Recharts is installed: `npm list recharts` in frontend directory

### If PDF download fails:
- Check backend logs for PDFKit errors
- Verify payslip exists and has line items
- Try viewing payslip detail page first

## Demo Environment Recommendations

- **Browser:** Use Chrome or Edge for best compatibility
- **Screen Resolution:** 1920x1080 or higher recommended
- **Network:** Local development for best performance
- **Data:** Use seeded demo data for consistency
- **Preparation:** Test entire flow once before actual demo

## Post-Demo Q&A Topics

Be prepared to discuss:
- Deployment strategy (Docker, cloud platforms)
- Scalability (load balancing, database sharding)
- Security enhancements (2FA, audit logs, encryption)
- Integration possibilities (HRIS, banking, accounting)
- Customization options (salary rules, workflows, reports)
- Mobile app potential
- Multi-tenant architecture
- Compliance requirements (GDPR, SOC 2)

---

**Good luck with your demonstration! This platform showcases professional-grade full-stack development.**
