import { describe, it, expect } from "vitest";
import { canAccessPortal, getAvailablePortals } from "@/lib/utils/permissions";

describe("Portal Permissions", () => {
  it("ADMIN can access all portals", () => {
    const portals = getAvailablePortals("ADMIN");
    expect(portals).toContain("cockpit");
    expect(portals).toContain("creator");
    expect(portals).toContain("console");
    expect(portals).toContain("intake");
  });

  it("CLIENT_RETAINER can access cockpit and intake", () => {
    expect(canAccessPortal("CLIENT_RETAINER", "cockpit")).toBe(true);
    expect(canAccessPortal("CLIENT_RETAINER", "intake")).toBe(true);
    expect(canAccessPortal("CLIENT_RETAINER", "creator")).toBe(false);
    expect(canAccessPortal("CLIENT_RETAINER", "console")).toBe(false);
  });

  it("FREELANCE can access creator and intake", () => {
    expect(canAccessPortal("FREELANCE", "creator")).toBe(true);
    expect(canAccessPortal("FREELANCE", "intake")).toBe(true);
    expect(canAccessPortal("FREELANCE", "cockpit")).toBe(false);
  });

  it("USER can only access intake", () => {
    const portals = getAvailablePortals("USER");
    expect(portals).toEqual(["intake"]);
  });
});
