# Phase 10: Payslip PDF and Email Delivery

## Individual payslip output

- `GET /api/payslips/:payslipId/pdf` returns an `application/pdf` payslip with employee, period, rule lines, gross, deductions, and net salary.
- `GET /api/payslips/:payslipId/print` returns a browser-printable HTML payslip.

Payroll roles can access any payslip. Employees can access only their own payslip.

## Bulk Payrun delivery

- `POST /api/payruns/:payrunId/send-payslips` is available after a Payrun is marked paid.
- Each paid payslip is rendered as a PDF and sent to the employee's `workEmail` as an attachment.
- `sentAt` is recorded only after that employee's email succeeds.
- The response reports `sentCount`, `failedCount`, and per-employee failure reasons.
- If every delivery fails, the endpoint returns `503` so SMTP or recipient problems are visible.

## SMTP configuration

Set these values in `backend/.env`:

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=PeoplePay360 Payroll <payroll@example.com>
```

Credentials remain environment-only and are excluded by `.gitignore`. Configure SMTP before using bulk delivery; PDF generation itself does not require SMTP.
