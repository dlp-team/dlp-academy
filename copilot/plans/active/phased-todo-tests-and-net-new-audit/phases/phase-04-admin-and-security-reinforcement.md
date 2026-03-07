<!-- tests/phases/phase-04-admin-and-security-reinforcement.md -->
# Phase 04 - Admin and Security Reinforcement

- [ ] `src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx` - `Guardar Políticas` requires sudo confirmation before success message (`e2e`)
- [ ] `src/components/modals/SudoModal.jsx` - wrong password shows validation error and blocks `onConfirm` (`unit`)
- [ ] `src/components/modals/SudoModal.jsx` - successful reauth calls `onConfirm` and closes modal (`unit`)
