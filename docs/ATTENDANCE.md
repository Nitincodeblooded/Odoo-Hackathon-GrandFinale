# Phase 5: Attendance

Attendance follows a traceable lifecycle:

```text
Check In -> Check Out -> Worked Hours -> Attendance Status
```

## Endpoints

- `GET /api/attendance`: HR roles see the directory; Employees see their own records.
- `GET /api/attendance/:attendanceId`: view one record with ownership enforcement.
- `POST /api/attendance/check-in`: create the current employee's open attendance record.
- `POST /api/attendance/check-out`: close the current employee's record for a work date.
- `POST /api/attendance/corrections`: HR Manager, HR Payroll User, HR Payroll Manager, and Admin only.

`workDate` is normalized to a UTC calendar day, and the employee/date unique index prevents duplicate attendance records.

## Business rules

- Check-out cannot precede check-in.
- Completed records derive `workedHours` from the timestamp difference; the value is rounded to two decimals.
- A record with check-in but no check-out is automatically marked `missing_checkout` with zero worked hours.
- A second check-in for the same employee and day is rejected by the unique index.
- Manual corrections require a note, preserve the original record, set `manuallyCorrected=true`, and use `corrected` status when timestamps are complete.
- Employees can check in and out for themselves, while authorized HR roles can correct records and review the attendance directory.
