# Final ERP Acceptance Checklist – V113

### People & data
- [x] Student full form matches approved reference fields
- [x] Teacher full form matches approved reference fields
- [x] Staff full form matches approved reference fields
- [x] CSV import/update works for all three categories
- [x] Pilot records can be edited or removed before production

### Dynamic public website
- [x] Contact cards source active profiles only
- [x] Four contact roles map automatically
- [x] Phone/email changes propagate automatically
- [x] Transfer/retirement/inactive removes public display
- [x] Clubs and emergency service interface visible
- [x] Demographic cards use live data when public statistics endpoint is connected

### Academic ERP
- [ ] Admission
- [ ] Attendance
- [ ] Examination/result/marksheet
- [ ] Routine
- [ ] Fees/accounts
- [ ] Library
- [ ] Learning/assignment/online exam
- [ ] Documents and certificates
- [ ] Reports/analytics

### Security & operations
- [ ] RBAC verified
- [ ] Session invalidation verified
- [ ] Audit log verified
- [ ] Rate limiting verified
- [ ] Backup/restore procedure tested
- [ ] Production environment variables set

### Scale
- [ ] 600+ student import tested
- [ ] Pagination/search tested
- [ ] Attendance workload tested
- [ ] Result/marks workload tested
- [ ] Production PostgreSQL performance observed before go-live
