# V111 Release Notes — Dynamic Public Contact Directory

## Public Contact
- Home Page → Contact now reads the four requested roles from active Teacher/Staff profiles:
  - Head Teacher
  - Assistant Head Teacher
  - ICT Teacher
  - Office Assistant
- Name, designation, mobile and email come directly from the profile.
- `public_contact_role` allows an administrator to explicitly identify a profile for a public role; if left blank, designation/subject inference is used.
- `public_contact_enabled` allows a profile to be hidden from the public directory without deleting its history.
- Retired/inactive profiles are excluded automatically, so a replacement profile can appear after the old profile is marked inactive/retired.
- Added database indexes for contact lookup.

## Teacher/Staff forms and imports
- Added Public Contact Role and Public Contact Enabled fields to teacher/staff forms.
- Added both fields to teacher/staff CSV templates/import processing.
- Existing teacher/staff records remain compatible; blank role uses automatic inference.
