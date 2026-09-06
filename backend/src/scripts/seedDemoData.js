import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import Employee from '../models/Employee.js'
import User from '../models/User.js'
import Contract from '../models/Contract.js'
import WorkingSchedule from '../models/WorkingSchedule.js'
import Attendance from '../models/Attendance.js'
import TimeOffType from '../models/TimeOffType.js'
import TimeOffAllocation from '../models/TimeOffAllocation.js'
import TimeOffRequest from '../models/TimeOffRequest.js'
import SalaryStructure from '../models/SalaryStructure.js'
import SalaryRule from '../models/SalaryRule.js'
import Payrun from '../models/Payrun.js'
import Payslip from '../models/Payslip.js'
import PayslipLine from '../models/PayslipLine.js'

console.log('🌱 Starting database seed...\n')

// Connect to database
const connected = await connectDatabase(env.mongodbUri)
if (!connected) throw new Error('MongoDB connection failed')

// Clear existing data (optional - comment out to preserve existing data)
console.log('🗑️  Clearing existing data...')
await Promise.all([
  User.deleteMany({}),
  Employee.deleteMany({}),
  Contract.deleteMany({}),
  WorkingSchedule.deleteMany({}),
  Attendance.deleteMany({}),
  TimeOffType.deleteMany({}),
  TimeOffAllocation.deleteMany({}),
  TimeOffRequest.deleteMany({}),
  SalaryStructure.deleteMany({}),
  SalaryRule.deleteMany({}),
  Payrun.deleteMany({}),
  Payslip.deleteMany({}),
  PayslipLine.deleteMany({}),
])
console.log('✅ Data cleared\n')

// Helper function for date manipulation
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

function daysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function monthsAgo(months) {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

// 1. Create Working Schedules
console.log('📅 Creating working schedules...')
const scheduleFullTime = await WorkingSchedule.create({
  name: 'Standard 40-Hour Week',
  code: 'FULL_TIME_40',
  weeklyHours: 40,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  active: true,
})

const schedulePartTime = await WorkingSchedule.create({
  name: 'Part-Time 20-Hour Week',
  code: 'PART_TIME_20',
  weeklyHours: 20,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
  active: true,
})
console.log('✅ Working schedules created\n')

// 2. Create Salary Structure and Rules
console.log('💰 Creating salary structure and rules...')
const salaryStructure = await SalaryStructure.create({
  name: 'Standard Monthly Salary',
  code: 'STANDARD_MONTHLY',
  active: true,
})

const salaryRules = await SalaryRule.insertMany([
  {
    salaryStructureId: salaryStructure._id,
    name: 'Basic Salary',
    code: 'BASIC',
    category: 'basic',
    sequence: 1,
    amountType: 'formula',
    amount: 0,
    formula: 'BASIC',
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Housing Allowance',
    code: 'HOUSING',
    category: 'allowance',
    sequence: 2,
    amountType: 'percentage',
    percentage: 15,
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Transport Allowance',
    code: 'TRANSPORT',
    category: 'allowance',
    sequence: 3,
    amountType: 'fixed',
    amount: 300,
    formula: '300',
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Gross Salary',
    code: 'GROSS',
    category: 'gross',
    sequence: 4,
    amountType: 'formula',
    amount: 0,
    formula: 'BASIC + HOUSING + TRANSPORT',
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Tax Deduction',
    code: 'TAX',
    category: 'deduction',
    sequence: 5,
    amountType: 'percentage',
    percentage: 20,
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Social Security',
    code: 'SOCIAL',
    category: 'contribution',
    sequence: 6,
    amountType: 'percentage',
    percentage: 7,
    active: true,
  },
  {
    salaryStructureId: salaryStructure._id,
    name: 'Net Salary',
    code: 'NET',
    category: 'net',
    sequence: 7,
    amountType: 'formula',
    amount: 0,
    formula: 'GROSS - TAX - SOCIAL',
    active: true,
  },
])
console.log('✅ Salary structure and rules created\n')

// 3. Create Time-Off Types
console.log('🏖️  Creating time-off types...')
const timeOffTypes = await TimeOffType.insertMany([
  {
    name: 'Annual Leave',
    code: 'ANNUAL',
    unit: 'days',
    active: true,
  },
  {
    name: 'Sick Leave',
    code: 'SICK',
    unit: 'days',
    active: true,
  },
  {
    name: 'Personal Time Off',
    code: 'PTO',
    unit: 'hours',
    active: true,
  },
])
// Default amounts per type (used when creating allocations)
const allocationAmounts = { ANNUAL: 21, SICK: 10, PTO: 40 }
console.log('✅ Time-off types created\n')

// 4. Create Employees with realistic data
console.log('👥 Creating employees...')

const employeeData = [
  { number: 'EMP001', first: 'John', last: 'Smith', dept: 'Engineering', position: 'Software Engineer', type: 'full_time', wage: 5500, email: 'john.smith@company.com' },
  { number: 'EMP002', first: 'Sarah', last: 'Johnson', dept: 'Engineering', position: 'Senior Developer', type: 'full_time', wage: 7000, email: 'sarah.johnson@company.com' },
  { number: 'EMP003', first: 'Michael', last: 'Brown', dept: 'Engineering', position: 'DevOps Engineer', type: 'full_time', wage: 6200, email: 'michael.brown@company.com' },
  { number: 'EMP004', first: 'Emily', last: 'Davis', dept: 'Engineering', position: 'QA Engineer', type: 'full_time', wage: 4800, email: 'emily.davis@company.com' },
  { number: 'EMP005', first: 'David', last: 'Wilson', dept: 'Sales', position: 'Sales Manager', type: 'full_time', wage: 6500, email: 'david.wilson@company.com' },
  { number: 'EMP006', first: 'Jessica', last: 'Martinez', dept: 'Sales', position: 'Sales Representative', type: 'full_time', wage: 4500, email: 'jessica.martinez@company.com' },
  { number: 'EMP007', first: 'James', last: 'Anderson', dept: 'Sales', position: 'Account Executive', type: 'full_time', wage: 5200, email: 'james.anderson@company.com' },
  { number: 'EMP008', first: 'Lisa', last: 'Taylor', dept: 'HR', position: 'HR Manager', type: 'full_time', wage: 5800, email: 'lisa.taylor@company.com' },
  { number: 'EMP009', first: 'Robert', last: 'Thomas', dept: 'HR', position: 'HR Coordinator', type: 'full_time', wage: 4200, email: 'robert.thomas@company.com' },
  { number: 'EMP010', first: 'Maria', last: 'Garcia', dept: 'Finance', position: 'Financial Controller', type: 'full_time', wage: 7500, email: 'maria.garcia@company.com' },
  { number: 'EMP011', first: 'William', last: 'Rodriguez', dept: 'Finance', position: 'Accountant', type: 'full_time', wage: 5000, email: 'william.rodriguez@company.com' },
  { number: 'EMP012', first: 'Jennifer', last: 'Lee', dept: 'Finance', position: 'Financial Analyst', type: 'full_time', wage: 5500, email: 'jennifer.lee@company.com' },
  { number: 'EMP013', first: 'Daniel', last: 'White', dept: 'Operations', position: 'Operations Manager', type: 'full_time', wage: 6200, email: 'daniel.white@company.com' },
  { number: 'EMP014', first: 'Amanda', last: 'Harris', dept: 'Operations', position: 'Project Coordinator', type: 'full_time', wage: 4700, email: 'amanda.harris@company.com' },
  { number: 'EMP015', first: 'Christopher', last: 'Clark', dept: 'Operations', position: 'Logistics Specialist', type: 'full_time', wage: 4400, email: 'christopher.clark@company.com' },
  { number: 'EMP016', first: 'Michelle', last: 'Lewis', dept: 'Marketing', position: 'Marketing Manager', type: 'full_time', wage: 6000, email: 'michelle.lewis@company.com' },
  { number: 'EMP017', first: 'Kevin', last: 'Walker', dept: 'Marketing', position: 'Content Specialist', type: 'part_time', wage: 3000, email: 'kevin.walker@company.com' },
  { number: 'EMP018', first: 'Ashley', last: 'Hall', dept: 'Engineering', position: 'Junior Developer', type: 'full_time', wage: 4000, email: 'ashley.hall@company.com' },
  { number: 'EMP019', first: 'Brian', last: 'Young', dept: 'Sales', position: 'Business Development', type: 'full_time', wage: 5500, email: 'brian.young@company.com' },
  { number: 'EMP020', first: 'Samantha', last: 'King', dept: 'HR', position: 'Payroll Specialist', type: 'full_time', wage: 4600, email: 'samantha.king@company.com' },
]

const employees = []
for (const data of employeeData) {
  const employee = await Employee.create({
    employeeNumber: data.number,
    firstName: data.first,
    lastName: data.last,
    workEmail: data.email,
    department: data.dept,
    jobPosition: data.position,
    employeeType: data.type,
    dateOfBirth: new Date(1985 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    hireDate: monthsAgo(Math.floor(Math.random() * 24) + 12),
    bankName: 'Global Bank',
    bankAccountNumber: `ACC${Math.random().toString().slice(2, 12)}`,
    status: 'active',
  })
  employees.push({ ...employee.toObject(), wage: data.wage })
}
console.log(`✅ Created ${employees.length} employees\n`)

// 5. Create User accounts for some employees
console.log('🔐 Creating user accounts...')
const passwordHash = await bcrypt.hash('password123', 12)

// Admin user (linked to Lisa Taylor, EMP008 - HR Manager employee)
const adminEmployee = employees.find(e => e.employeeNumber === 'EMP008')
await User.create({
  email: 'admin@example.com',
  passwordHash,
  role: 'admin',
  employeeId: adminEmployee._id,
})

// HR Manager (use EMP009 - Robert Thomas, HR Coordinator, so each employee has its own user)
const hrManagerEmployee = employees.find(e => e.employeeNumber === 'EMP009')
await User.create({
  email: hrManagerEmployee.workEmail,
  passwordHash,
  role: 'hr_manager',
  employeeId: hrManagerEmployee._id,
})

// Payroll user
const payrollEmployee = employees.find(e => e.employeeNumber === 'EMP020')
await User.create({
  email: payrollEmployee.workEmail,
  passwordHash,
  role: 'hr_payroll_user',
  employeeId: payrollEmployee._id,
})

// Regular employee
const regularEmployee = employees.find(e => e.employeeNumber === 'EMP001')
await User.create({
  email: regularEmployee.workEmail,
  passwordHash,
  role: 'employee',
  employeeId: regularEmployee._id,
})

console.log('✅ User accounts created\n')
console.log('📝 Login credentials:')
console.log('   Admin: admin@example.com / password123')
console.log('   HR Manager: robert.thomas@company.com / password123')
console.log('   Payroll: samantha.king@company.com / password123')
console.log('   Employee: john.smith@company.com / password123\n')

// 6. Create Contracts
console.log('📄 Creating contracts...')
for (const emp of employees) {
  await Contract.create({
    employeeId: emp._id,
    title: `${emp.jobPosition} Contract`,
    contractType: emp.employeeType === 'part_time' ? 'part_time' : 'permanent',
    startDate: emp.hireDate,
    wage: emp.wage,
    currency: 'USD',
    workingScheduleId: emp.employeeType === 'part_time' ? schedulePartTime._id : scheduleFullTime._id,
    salaryStructureId: salaryStructure._id,
    status: 'active',
  })
}
console.log('✅ Contracts created\n')

// 7. Create Attendance Records (last 90 days)
console.log('📊 Creating attendance records...')
let attendanceCount = 0
for (let i = 90; i > 0; i--) {
  const workDate = daysAgo(i)
  const dayOfWeek = workDate.getDay()
  
  // Skip weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) continue
  
  for (const emp of employees) {
    // 95% attendance rate
    if (Math.random() < 0.95) {
      const statusOptions = ['present', 'present', 'present', 'present', 'late', 'overtime']
      await Attendance.create({
        employeeId: emp._id,
        workDate,
        checkIn: new Date(workDate.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))),
        checkOut: new Date(workDate.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60))),
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      })
      attendanceCount++
    }
  }
}
console.log(`✅ Created ${attendanceCount} attendance records\n`)

// 8. Create Time-Off Allocations
console.log('🎫 Creating time-off allocations...')
for (const emp of employees) {
  for (const timeOffType of timeOffTypes) {
    const amount = allocationAmounts[timeOffType.code]
    await TimeOffAllocation.create({
      employeeId: emp._id,
      timeOffTypeId: timeOffType._id,
      allocatedAmount: amount,
      usedAmount: 0,
      validFrom: monthsAgo(12),
      validTo: daysFromNow(365),
      status: 'approved',
    })
  }
}
console.log('✅ Time-off allocations created\n')

// 9. Create Time-Off Requests
console.log('📝 Creating time-off requests...')
const sampleEmployees = employees.slice(0, 10)
for (const emp of sampleEmployees) {
  const annualLeave = timeOffTypes.find(t => t.code === 'ANNUAL')
  await TimeOffRequest.create({
    employeeId: emp._id,
    timeOffTypeId: annualLeave._id,
    startDate: daysFromNow(14),
    endDate: daysFromNow(18),
    requestedAmount: 5,
    reason: 'Family vacation',
    status: 'approved',
    approvedAt: daysAgo(2),
  })
}
console.log('✅ Time-off requests created\n')

// 10. Create Payruns with Payslips (last 3 months)
console.log('💸 Creating payruns and payslips...')

for (let monthOffset = 3; monthOffset > 0; monthOffset--) {
  const periodStart = new Date()
  periodStart.setMonth(periodStart.getMonth() - monthOffset, 1)
  periodStart.setHours(0, 0, 0, 0)
  
  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1, 0)
  periodEnd.setHours(23, 59, 59, 999)
  
  const monthName = periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  const payrun = await Payrun.create({
    code: `PAY-${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
    name: `${monthName} Payroll`,
    salaryStructureId: salaryStructure._id,
    periodStart,
    periodEnd,
    employeeIds: employees.map(e => e._id),
    employeeCount: employees.length,
    status: 'paid',
    validatedAt: new Date(periodEnd.getTime() + 86400000),
    paidAt: new Date(periodEnd.getTime() + 172800000),
    warnings: [],
  })
  
  let totalGross = 0
  let totalNet = 0
  
  for (const emp of employees) {
    const workedDays = Math.floor(Math.random() * 3) + 20 // 20-22 days
    const basic = emp.wage
    const housing = basic * 0.15
    const transport = 300
    const gross = basic + housing + transport
    const tax = gross * 0.20
    const social = gross * 0.07
    const net = gross - tax - social
    
    totalGross += gross
    totalNet += net
    
    const payslip = await Payslip.create({
      payrunId: payrun._id,
      employeeId: emp._id,
      contractId: (await Contract.findOne({ employeeId: emp._id }))._id,
      salaryStructureId: salaryStructure._id,
      periodStart,
      periodEnd,
      status: 'paid',
      workedDays,
      grossAmount: Math.round(gross * 100) / 100,
      deductionAmount: Math.round((tax + social) * 100) / 100,
      netAmount: Math.round(net * 100) / 100,
      employeeSnapshot: {
        employeeNumber: emp.employeeNumber,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
      },
      contractSnapshot: {
        title: `${emp.jobPosition} Contract`,
        wage: emp.wage,
        currency: 'USD',
      },
      sentAt: new Date(periodEnd.getTime() + 259200000),
    })
    
    // Create payslip lines
    await PayslipLine.insertMany([
      { payslipId: payslip._id, salaryRuleId: salaryRules[0]._id, sequence: 1, name: 'Basic Salary',       code: 'BASIC',     category: 'basic',        amount: basic    },
      { payslipId: payslip._id, salaryRuleId: salaryRules[1]._id, sequence: 2, name: 'Housing Allowance',  code: 'HOUSING',   category: 'allowance',    amount: housing  },
      { payslipId: payslip._id, salaryRuleId: salaryRules[2]._id, sequence: 3, name: 'Transport Allowance',code: 'TRANSPORT', category: 'allowance',    amount: transport},
      { payslipId: payslip._id, salaryRuleId: salaryRules[3]._id, sequence: 4, name: 'Gross Salary',       code: 'GROSS',     category: 'gross',        amount: gross    },
      { payslipId: payslip._id, salaryRuleId: salaryRules[4]._id, sequence: 5, name: 'Tax Deduction',      code: 'TAX',       category: 'deduction',    amount: -tax     },
      { payslipId: payslip._id, salaryRuleId: salaryRules[5]._id, sequence: 6, name: 'Social Security',    code: 'SOCIAL',    category: 'contribution', amount: -social  },
      { payslipId: payslip._id, salaryRuleId: salaryRules[6]._id, sequence: 7, name: 'Net Salary',         code: 'NET',       category: 'net',          amount: net      },
    ])
  }
  
  payrun.totalGross = Math.round(totalGross * 100) / 100
  payrun.totalNet = Math.round(totalNet * 100) / 100
  await payrun.save()
  
  console.log(`   ✅ Payrun for ${monthName} created with ${employees.length} payslips`)
}
console.log('✅ All payruns and payslips created\n')

console.log('🎉 Database seeding completed successfully!\n')
console.log('📊 Summary:')
console.log(`   - ${employees.length} employees`)
console.log(`   - ${employees.length} contracts`)
console.log(`   - ${attendanceCount} attendance records`)
console.log(`   - ${employees.length * timeOffTypes.length} time-off allocations`)
console.log(`   - 3 completed payruns with ${employees.length * 3} payslips`)
console.log('\n✨ Ready for demo!\n')

await mongoose.disconnect()
