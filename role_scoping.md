Got it. I did all three parts:

  1. Company user form now uses backend roles only
     The hardcoded systemRole dropdown is removed. Role selection is now strictly from /roles and we map the selected role to systemRoles only when the role’s
     systemRoleType is company_super_admin (so guards still work).
     File updated: frontend/src/app/company/users/page.tsx
  2. Action buttons to generate default roles

  - Kaeyros admin: added “Generate Roles” button in the companies list (calls POST /api/kaeyros/companies/:id/seed-roles).
    File: frontend/src/app/admin/companies/page.tsx
    New API route: frontend/src/app/api/kaeyros/companies/[id]/seed-roles/route.ts
  - Company admin: added “Generate Default Roles” button in /company/roles (calls POST /api/roles/seed-default).
    File: frontend/src/app/company/roles/page.tsx
    New API route: frontend/src/app/api/roles/seed-default/route.ts

  3. Backend scoping enforced

  - /roles now requires a company context for non‑Kaeyros users; otherwise returns Company context is required.
    This prevents a company user from seeing another company’s roles even if their token/company data is inconsistent.
    File: backend/src/modules/roles/roles.controller.ts

  Extra: fix existing users with wrong roles
  I added a cleanup script to remove cross‑company roles and remap to the matching system role if needed:

  - Script: backend/src/scripts/fix-user-role-scope.ts
  - Command: npm run fix:user-roles -- --dryRun
  - Apply: npm run fix:user-roles

  Notes on the “roles leaking” issue

  - If a company user sees other companies’ roles, it’s not frontend anymore. It means either:
      - isKaeyrosUser is true in their JWT, or
      - they have no company in their JWT/user record.
  - The backend now rejects that for /roles.



  • We do not have “seed roles for all companies” yet.
  What you have now are per‑company endpoints:

  - POST /api/v1/kaeyros/companies/:id/seed-roles (Kaeyros admin)
  - POST /api/v1/roles/seed-default (company admin, current company only)

  So “seed all companies” would be a new endpoint that loops through every company and creates the default 5 roles where missing.