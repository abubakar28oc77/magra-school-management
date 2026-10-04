# V30 Release Notes

V30 is a stabilization milestone. The V29 frontend had repeated concatenated source blocks that would create duplicate declarations and malformed imports. V30 removes the duplicated blocks and restores a single coherent React entry point while preserving the existing functional panels and public content CMS.

The application now has one App router entry and one BrowserRouter root render. Backend readiness identifies the build as V30.
