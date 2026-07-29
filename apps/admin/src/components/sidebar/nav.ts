import type { LucideIcon } from "lucide-react";
import {
  Building2,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  Mail,
  ScrollText,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

export type AdminTab =
  | "panel"
  | "faqs"
  | "articles"
  | "gallery"
  | "team"
  | "contact"
  | "intake"
  | "clinics"
  | "adminUsers"
  | "settings"
  | "audit"
  | "account";

export type NavGroupId = "clinic" | "contact" | "system";

export type NavItem = {
  id: Exclude<AdminTab, "account">;
  icon: LucideIcon;
  superadminOnly?: boolean;
};

export type NavGroup = {
  // null = ungrouped top-level items (no label, always visible)
  id: NavGroupId | null;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: null,
    items: [{ id: "panel", icon: LayoutDashboard }],
  },
  {
    id: "clinic",
    items: [
      { id: "faqs", icon: HelpCircle },
      { id: "articles", icon: FileText },
      { id: "gallery", icon: Image },
      { id: "team", icon: Users },
    ],
  },
  {
    id: "contact",
    items: [
      { id: "contact", icon: Mail },
      { id: "intake", icon: UserPlus },
    ],
  },
  {
    id: "system",
    items: [
      { id: "clinics", icon: Building2, superadminOnly: true },
      { id: "adminUsers", icon: ShieldCheck, superadminOnly: true },
      { id: "settings", icon: Settings, superadminOnly: true },
      { id: "audit", icon: ScrollText, superadminOnly: true },
    ],
  },
];

export const ADMIN_TABS: AdminTab[] = [
  ...NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
  "account",
];
