This folder contains maintenance scripts that used to live at the repo root.

Suggested moves (verify before deleting originals):
- fix-admin-role.ts -> scripts/maintenance/
- fix-admin-complete.ts -> scripts/maintenance/
- check-users.ts -> scripts/maintenance/

After moving, update any docs or npm scripts that reference them.
