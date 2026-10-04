# Magra School ERP V112 – Finalization Pass

## লক্ষ্য
মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয়ের জন্য ব্যবহারযোগ্য, আধুনিক, স্মার্ট এবং দীর্ঘমেয়াদে পরিচালনাযোগ্য School ERP।

## V112 finalization
- Public Contact directory remains dynamically sourced from active Teacher/Staff profiles.
- Public contact roles: Head Teacher, Assistant Head Teacher, ICT Teacher, Office Assistant.
- Teacher/Staff status changes (transfer/retirement/inactive) remove the profile from public contact without deleting historical records.
- Student management remains pagination/search ready for 600+ students and future growth.
- Attendance, marks, fees, library, notifications, guardian links and audit logs retain scale indexes.
- Public page includes demographic/statistical cards, science/ICT/language-literature/debate clubs, and emergency service shortcuts.
- Pilot synthetic data is not production data; pilot cleanup is guarded separately.

## Database migrations
The current migration chain is 006 through 035. Apply all migrations in numeric order after the base schema.

## Important deployment status
This is a finalization/pilot-candidate build. A live Supabase/PostgreSQL connection and production hosting have not been claimed as completed until credentials and deployment are actually performed.
