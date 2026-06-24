import { normalizeRole } from "./roles";

const normalizeKey = (value) => String(value || "").trim().toLowerCase();

export const translateRole = (t, role) => {
  const normalized = normalizeRole(role) || normalizeKey(role);
  return t(`common.roles.${normalized}`, role || t("common.roles.user"));
};

export const translateCourse = (t, course) => {
  const normalized = normalizeKey(course);
  return t(`common.courses.${normalized}`, course || t("common.courses.other"));
};

export const translateSwapStatus = (t, status) => {
  const normalized = normalizeKey(status);
  return t(`common.swap_status.${normalized}`, status || t("common.status"));
};

export const translateRequestStatus = (t, status) => {
  const normalized = normalizeKey(status);
  return t(`common.request_status.${normalized}`, status || t("common.status"));
};

export const translateIncidentStatus = (t, status) => {
  const normalized = normalizeKey(status);
  return t(`common.incident_status.${normalized}`, status || t("common.status"));
};

export const translateIncidentType = (t, type) => {
  const normalized = normalizeKey(type);
  return t(`common.incident_types.${normalized}`, type || t("common.incident_types.incidencia"));
};
