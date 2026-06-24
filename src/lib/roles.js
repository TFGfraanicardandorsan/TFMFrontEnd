export const ADMIN_ROLE = "administrador";
export const STUDENT_ROLE = "estudiante";
export const DELEGATION_ROLE = "delegacion";
export const DELEGATION_ROLE_LEGACY = "delgacion";

export const DELEGATION_ROLES = [DELEGATION_ROLE, DELEGATION_ROLE_LEGACY];
export const APP_ROLES = [ADMIN_ROLE, STUDENT_ROLE, ...DELEGATION_ROLES];

export const normalizeRole = (role) =>
  String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const isAllowedRole = (role, allowedRoles) => {
  const normalizedRole = normalizeRole(role);
  return allowedRoles.map(normalizeRole).includes(normalizedRole);
};

export const isDelegationRole = (role) =>
  DELEGATION_ROLES.map(normalizeRole).includes(normalizeRole(role));

export const toCanonicalRole = (role) => {
  const normalizedRole = normalizeRole(role);
  return isDelegationRole(normalizedRole) ? DELEGATION_ROLE : normalizedRole;
};

export const toApiRole = (role) => {
  const canonicalRole = toCanonicalRole(role);
  return canonicalRole === DELEGATION_ROLE ? DELEGATION_ROLE_LEGACY : canonicalRole;
};
