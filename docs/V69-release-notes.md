# V69 — Four-reference-image public View Page

## Public View Page composition
The public page is now organized top-to-bottom to follow the user's four supplied reference segments:

1. **Reference 1:** school header/navigation, hero/banner, latest ticker, and education/service cards.
2. **Reference 2:** notice board followed by important links, education boards, and related board links.
3. **Reference 3:** continuation of the service-oriented school information area plus right-side leadership/contact cards.
4. **Reference 4:** school information, teachers, distinguished students, photo/video gallery, and footer.

## School-specific replacements
- President: **নেয়ামুল হক খান**
- Head Teacher: **মুহাম্মদ শফিকুল ইসলাম**
- Assistant Head Teacher: **তাপসী সরকার**
- ICT Teacher remains available in the system data: **মুহাম্মদ আবুবকর সিদ্দিক**
- EIIN: **114290**
- School logo and school building assets are used in the public page.

## UX
- Desktop two-column layout with a right sidebar, matching the reference composition.
- Mobile layout collapses to one column and keeps service cards, notices, people cards, gallery and footer readable.
- Existing dropdown navigation, login, PWA and accessibility behavior remain intact.

## Verification
Run:

```bash
node scripts/qa_v69.mjs
```

Production database/hosting and final production deployment remain intentionally deferred until the full software and final UI review are complete.
