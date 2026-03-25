export type UserRole = "ADMIN" | "CLIENT_RETAINER" | "CLIENT_STATIC" | "FREELANCE" | "USER";

export type Portal = "cockpit" | "creator" | "console" | "intake";

const PORTAL_ACCESS: Record<Portal, UserRole[]> = {
  cockpit: ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  creator: ["ADMIN", "FREELANCE"],
  console: ["ADMIN"],
  intake: ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC", "FREELANCE", "USER"],
};

export function canAccessPortal(role: UserRole, portal: Portal): boolean {
  return PORTAL_ACCESS[portal].includes(role);
}

export function getAvailablePortals(role: UserRole): Portal[] {
  return (Object.keys(PORTAL_ACCESS) as Portal[]).filter((portal) => canAccessPortal(role, portal));
}
