import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  minTier?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  divisionColor?: string;
}

export type PortalId = "cockpit" | "creator" | "console" | "agency";

export interface PortalConfig {
  id: PortalId;
  label: string;
  sublabel: string;
  basePath: string;
  accentClass: string;
  navGroups: NavGroup[];
  headerContent?: React.ReactNode;
}
