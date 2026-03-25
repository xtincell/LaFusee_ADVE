import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LEGACY_REDIRECTS: Record<string, string> = {
  "/os": "/cockpit",
  "/os/dashboard": "/cockpit",
  "/os/missions": "/cockpit/operate/missions",
  "/os/campaigns": "/cockpit/operate/campaigns",
  "/os/brand": "/cockpit/brand/identity",
  "/impulsion": "/console/oracle/clients",
  "/impulsion/clients": "/console/oracle/clients",
  "/impulsion/diagnostics": "/console/oracle/diagnostics",
  "/impulsion/missions": "/console/fusee/missions",
  "/pilotis": "/creator",
  "/pilotis/missions": "/creator/missions/available",
  "/pilotis/profile": "/creator/profile/skills",
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check exact match
  if (LEGACY_REDIRECTS[path]) {
    return NextResponse.redirect(new URL(LEGACY_REDIRECTS[path]!, request.url));
  }

  // Check prefix match for /os/*, /impulsion/*, /pilotis/*
  for (const [prefix, target] of Object.entries(LEGACY_REDIRECTS)) {
    if (path.startsWith(prefix + "/")) {
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/os/:path*", "/impulsion/:path*", "/pilotis/:path*"],
};
