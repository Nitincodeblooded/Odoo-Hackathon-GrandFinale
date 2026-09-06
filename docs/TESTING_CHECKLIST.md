# PeoplePay360 - Testing Checklist

## Pre-Testing Setup
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connection verified
- [ ] Demo data seeded successfully
- [ ] No console errors on startup

## Module 1: Authentication & Authorization

### Login Flow
- [ ] Can access login page at root URL
- [ ] Can login with admin credentials (admin@example.com / password123)
- [ ] Can login with HR manager credentials (lisa.taylor@company.com / password123)
- [ ] Can login with payroll user (samantha.king@company.com / password123)
- [ ] Can login with employee (john.smith@company.com / password123)
- [ ] Invalid credentials show proper error message
- [ ] JWT token stored properly
- [ ] Redirects to dashboard after login
- [ ] Logout works correctly
- [ ] Protected routes redirect to login when not authenticated

### Registration
- [ ] Can access registration form
- [ ] Form validation works
- [ ] New account created successfully
- [ ] Auto-login after registration

## Module 2: Dashboard

### Data Display
- [ ] All 6 KPI cards display correctly
- [ ] Numbers formatted properly (currency, percentages)
- [ ] Bar chart renders with department data
- [ ] Line chart shows monthly trend
- [ ] Pie chart displays with legend
- [ ] Department breakdown table loads
- [ ] Attendance widget shows health percentage
- [ ] Time-off widget displays data
- [ ] Alerts panel shows operational warnings

### Filters
- [ ] Filter panel toggles correctly
- [ ] Period start/end date filters work
- [ ] Department filter populated and functional
- [ ] Employee type filter works
- [ ] Apply filters updates dashboard
- [ ] Reset filters clears selections
- [ ] Active filter count badge accurate
- [ ] Refresh button reloads data

### Responsiveness
- [ ] Dashboard responsive on mobile
- [ ] Charts resize properly
- [ ] Tables scroll horizontally on small screens

## Module 3: Employees

### List View
- [ ] Employee grid view displays all employees
- [ ] List view toggle works
- [ ] Search functionality filters employees
- [ ] Employee cards show correct information
- [ ] Clicking employee navigates to detail page

### Create Employee (HR/Admin only)
- [ ] Create employee button visible for authorized users
- [ ] Modal opens with form
- [ ] All required fields validated
- [ ] Employee created successfully
- [ ] List updates after creation
- [ ] Proper error messages on failure

### Employee Detail
- [ ] Employee information displayed correctly
- [ ] Related contracts shown
- [ ] Attendance summary visible
- [ ] Time-off balance displayed
- [ ] Navigation back to list works

### Authorization
- [ ] Employee role can only see limited data
- [ ] HR Manager can create/edit employees
- [ ] Admin has full access

## Module 4: Attendance

### View Attendance
- [ ] Attendance table loads with records
- [ ] Shows employee, date, check-in, check-out, status
- [ ] Status badges display correctly
- [ ] Table pagination/scrolling works

### Check-in/Check-out
- [ ] Check-in button creates attendance record
- [ ] Check-out updates existing record
- [ ] Can't check-in twice on same day
- [ ] Proper status calculation
- [ ] Error handling for failed operations

## Module 5: Time-Off

### Allocations
- [ ] Time-off allocations display
- [ ] Shows type, allocated, used, remaining
- [ ] Status badges correct

### Requests
- [ ] Time-off requests list visible
- [ ] Can create new request
- [ ] Form validation works
- [ ] Date range picker functional
- [ ] Request submitted successfully
- [ ] Approval workflow for managers
- [ ] Refusal workflow with reason

## Module 6: Contracts

### Contract List
- [ ] All contracts displayed
- [ ] Shows employee, type, wage, status
- [ ] Status badges styled correctly
- [ ] Click to view details works

### Create/Edit
- [ ] Create contract form accessible (HR/Admin)
- [ ] Employee dropdown populated
- [ ] Schedule dropdown populated
- [ ] Salary structure dropdown populated
- [ ] Date pickers work
- [ ] Contract saved successfully
- [ ] Validation prevents invalid data

## Module 7: Salary Configuration

### Salary Structures
- [ ] List of structures displays
- [ ] Can view structure details
- [ ] Rules listed in sequence order

### Salary Rules
- [ ] Rules table shows all rules
- [ ] Code, name, category, amount displayed
- [ ] Sequence ordering visible
- [ ] Active/inactive status shown

### Authorization
- [ ] Payroll users have read-only access
- [ ] Payroll managers can create/edit
- [ ] Proper permissions enforced

## Module 8: Payroll Processing

### Payrun List
- [ ] All payruns displayed
- [ ] Period and status shown
- [ ] Status badges styled correctly
- [ ] Click navigates to detail page

### Create Payrun Wizard - Step 1
- [ ] Modal opens on "New payrun" click
- [ ] Code field accepts input
- [ ] Name field accepts input
- [ ] Salary structure dropdown populated
- [ ] Period start date picker works
- [ ] Period end date picker works
- [ ] "Next" validates required fields
- [ ] Error messages display for missing fields

### Create Payrun Wizard - Step 2
- [ ] Preview loads eligible employees
- [ ] Shows eligible count
- [ ] Shows ineligible count with reasons
- [ ] Employee list displays with details
- [ ] Warnings shown per employee
- [ ] Checkboxes work for selection
- [ ] "Select all" toggles all checkboxes
- [ ] "Create Payrun" button enabled when employees selected
- [ ] Payrun created successfully
- [ ] Redirects to payrun detail page

### Payrun Detail Page
- [ ] Summary card shows KPIs (employees, gross, net)
- [ ] Payslips table loads
- [ ] All columns display correctly
- [ ] Action buttons shown based on status

### Payrun Actions - Compute
- [ ] "Compute Payslips" button visible for draft
- [ ] Click shows loading spinner
- [ ] Computation completes successfully
- [ ] Status changes to "computed"
- [ ] Payslips created with calculations
- [ ] Warnings displayed if any
- [ ] Page refreshes with updated data

### Payrun Actions - Validate
- [ ] "Validate Payrun" button visible for computed
- [ ] Button disabled if warnings exist
- [ ] Confirmation modal shows
- [ ] Confirm validates payrun
- [ ] Status changes to "validated"
- [ ] Success message displayed

### Payrun Actions - Mark Paid
- [ ] "Mark as Paid" button visible for validated
- [ ] Confirmation modal shows
- [ ] Confirm marks payrun paid
- [ ] Status changes to "paid"
- [ ] Success message displayed

### Payrun Actions - Send Payslips
- [ ] "Send Payslips" button visible for paid
- [ ] Confirmation modal shows
- [ ] Send triggers email delivery
- [ ] Shows sent count and failures
- [ ] Success/error message appropriate

### Payslip Detail
- [ ] Click payslip in table navigates to detail
- [ ] Employee info displayed
- [ ] Period shown
- [ ] Line items table loads
- [ ] All salary components shown (basic, allowances, deductions)
- [ ] Totals calculated correctly
- [ ] PDF download button visible
- [ ] PDF download works (triggers download)

## Module 9: Navigation & UX

### Sidebar Navigation
- [ ] All menu items visible
- [ ] Active route highlighted
- [ ] Icons display correctly
- [ ] Navigation works for all routes
- [ ] User info shown in sidebar
- [ ] Logout button functional

### Page Headers
- [ ] Consistent across all pages
- [ ] Subtitle, title, description display
- [ ] Action buttons in correct position
- [ ] Badges show when needed

### Loading States
- [ ] Loading spinners show during data fetch
- [ ] Skeleton screens or loading states consistent
- [ ] No flash of empty content

### Empty States
- [ ] Empty state messages helpful
- [ ] Icons display correctly
- [ ] Call-to-action buttons where appropriate

### Error Handling
- [ ] Error messages clear and helpful
- [ ] Alert components styled correctly
- [ ] Errors don't crash the application
- [ ] Network errors handled gracefully

### Modals
- [ ] Open/close animations smooth
- [ ] Overlay blocks background interaction
- [ ] Close button works
- [ ] Click outside closes modal
- [ ] ESC key closes modal

## Module 10: Responsive Design

### Mobile (< 768px)
- [ ] Sidebar collapses or transforms
- [ ] Tables scroll horizontally or stack
- [ ] Forms remain usable
- [ ] Charts resize appropriately
- [ ] Buttons not too small
- [ ] Text readable

### Tablet (768px - 1024px)
- [ ] Layout adapts gracefully
- [ ] All features accessible
- [ ] No horizontal scrolling (except tables)

### Desktop (> 1024px)
- [ ] Full layout displays
- [ ] Optimal use of screen space
- [ ] Multi-column layouts work

## Module 11: Performance

### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Route transitions feel instant
- [ ] Lazy loading works (no loading all pages at once)
- [ ] Images/assets optimized

### Browser Console
- [ ] No console errors
- [ ] No console warnings (or only acceptable ones)
- [ ] No 404 errors for assets
- [ ] No CORS errors

### Network
- [ ] API calls use proper HTTP methods
- [ ] No redundant API calls
- [ ] Loading states prevent duplicate requests
- [ ] Proper error responses from backend

## Browser Compatibility
- [ ] Chrome/Edge (Chromium) - Latest
- [ ] Firefox - Latest
- [ ] Safari - Latest (if testing on Mac)

## Final Checklist
- [ ] All critical bugs fixed
- [ ] UI polish complete
- [ ] Demo data works end-to-end
- [ ] README instructions accurate
- [ ] Ready for presentation

## Known Issues Log
(Document any issues found during testing)

### Issue 1:
**Description:** 
**Severity:** Critical / High / Medium / Low
**Status:** Open / Fixed / Won't Fix
**Notes:** 

