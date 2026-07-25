"use client";

import { HubBrandMark } from "@hubnegocios/ui";
import { ChevronRight, LogOut, Menu, PanelLeft, X } from "lucide-react";
import { useEffect, useState, type FocusEvent, type MouseEvent, type ReactNode } from "react";
import type { AdminPageCopy } from "@/lib/copy";
import { NAV_GROUPS, type AdminTab, type NavGroupId } from "./nav";
import { SidebarPreferences } from "./sidebar-preferences";

const COLLAPSE_KEY = "hub-admin:sidebar-collapsed";

type Operator = { name: string; role: string; email: string; initials: string; isSuperadmin: boolean };

// Jetti-style sidebar (icon-collapsible "sidebar-07" pattern) rebuilt on
// hub-* tokens without Radix: 16rem expanded / 3rem icon rail on desktop,
// off-canvas drawer on mobile, Cmd/Ctrl+B toggle, localStorage persistence.
export function AdminSidebar({
  tab,
  onSelect,
  copy,
  operator,
  onSignOut,
}: {
  tab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  copy: AdminPageCopy;
  operator: Operator;
  onSignOut: () => void;
}) {
  // The console tree only mounts client-side (behind the token check), so the
  // lazy localStorage read never runs during SSR markup generation.
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(COLLAPSE_KEY) === "1",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [closedGroups, setClosedGroups] = useState<Partial<Record<NavGroupId, boolean>>>({});
  // Single fixed-position tooltip for the icon rail; an absolutely positioned
  // one would be clipped by the aside's overflow-y-auto.
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.superadminOnly || operator.isSuperadmin),
  })).filter((group) => group.items.length > 0);

  const activeGroup = visibleGroups.find((group) => group.items.some((item) => item.id === tab))?.id ?? null;

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      if (next) setTooltip(null);
      return next;
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleCollapsed();
      }
      if (event.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function select(next: AdminTab) {
    setTooltip(null);
    setDrawerOpen(false);
    onSelect(next);
  }

  function showTooltip(label: string) {
    return (event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({ label, top: rect.top + rect.height / 2 });
    };
  }

  function navButton({
    key,
    label,
    active,
    onClick,
    rail,
    children,
  }: {
    key: string;
    label: string;
    active: boolean;
    onClick: () => void;
    rail: boolean;
    children: ReactNode;
  }) {
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        onMouseEnter={rail ? showTooltip(label) : undefined}
        onMouseLeave={rail ? () => setTooltip(null) : undefined}
        onFocus={rail ? showTooltip(label) : undefined}
        onBlur={rail ? () => setTooltip(null) : undefined}
        className={`relative flex h-8 w-full items-center gap-2 rounded-md text-left text-sm transition-colors ${
          rail ? "justify-center px-0" : "px-2"
        } ${
          active
            ? "bg-hub-honey-soft font-semibold text-hub-gold-deep"
            : "font-medium text-hub-ink hover:bg-hub-honey-soft hover:text-hub-gold-deep"
        }`}
      >
        {children}
        {!rail && <span className="min-w-0 flex-1 truncate">{label}</span>}
      </button>
    );
  }

  function navList(rail: boolean) {
    return (
      <nav className={`flex flex-1 flex-col gap-0.5 ${rail ? "items-stretch" : ""}`} aria-label={copy.title}>
        {visibleGroups.map((group, index) => {
          const open = group.id === null || !closedGroups[group.id] || activeGroup === group.id;
          return (
            <div key={group.id ?? "top"} className="flex flex-col gap-0.5">
              {index > 0 && rail && <div className="mx-1 my-1 h-px bg-hub-border" aria-hidden />}
              {group.id && !rail && (
                <button
                  type="button"
                  onClick={() => setClosedGroups((current) => ({ ...current, [group.id!]: open }))}
                  aria-expanded={open}
                  className="mt-2 flex h-8 w-full items-center gap-1 rounded-md px-2 text-xs font-semibold text-hub-muted transition-colors hover:text-hub-ink"
                >
                  <span className="flex-1 text-left">{copy.navGroups[group.id]}</span>
                  <ChevronRight
                    className={`size-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                    aria-hidden
                  />
                </button>
              )}
              {(rail || open) &&
                group.items.map((item) =>
                  navButton({
                    key: item.id,
                    label: copy.tabs[item.id],
                    active: tab === item.id,
                    onClick: () => select(item.id),
                    rail,
                    children: <item.icon className="size-4 shrink-0" aria-hidden />,
                  }),
                )}
            </div>
          );
        })}
      </nav>
    );
  }

  function footer(rail: boolean) {
    return (
      <div className="mt-auto flex flex-col gap-0.5 border-t border-hub-border pt-2">
        <SidebarPreferences rail={rail} />
        <div className="my-1 h-px bg-hub-border" aria-hidden />
        <button
          type="button"
          onClick={() => select("account")}
          aria-current={tab === "account" ? "page" : undefined}
          onMouseEnter={rail ? showTooltip(copy.tabs.account) : undefined}
          onMouseLeave={rail ? () => setTooltip(null) : undefined}
          onFocus={rail ? showTooltip(copy.tabs.account) : undefined}
          onBlur={rail ? () => setTooltip(null) : undefined}
          title={rail ? undefined : operator.email}
          className={`flex w-full items-center gap-2.5 rounded-md text-left transition-colors ${
            rail ? "justify-center p-1" : "px-2 py-1.5"
          } ${tab === "account" ? "bg-hub-honey-soft" : "hover:bg-hub-honey-soft"}`}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-hub-honey/50 text-[11px] font-extrabold text-hub-gold-deep">
            {operator.initials}
          </span>
          {!rail && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold capitalize text-hub-ink">{operator.name}</span>
              <span className="block truncate text-xs capitalize text-hub-muted">{operator.role}</span>
            </span>
          )}
        </button>
        {navButton({
          key: "sign-out",
          label: copy.signOut,
          active: false,
          onClick: onSignOut,
          rail,
          children: <LogOut className="size-4 shrink-0" aria-hidden />,
        })}
      </div>
    );
  }

  const brand = (
    <span className="flex min-w-0 items-center gap-2">
      <HubBrandMark className="size-7 shrink-0" />
      <span className="truncate text-[15px] font-black text-hub-ink">
        Hub <span className="text-hub-deep-blue">Negocios</span>{" "}
        <span className="text-[10px] font-bold text-hub-muted">ADMIN</span>
      </span>
    </span>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-hub-border bg-hub-surface px-3 py-2 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={copy.sidebar.openMenu}
          className="grid size-8 place-items-center rounded-md text-hub-ink hover:bg-hub-honey-soft"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
            className="absolute inset-y-0 left-0 flex w-72 flex-col gap-0.5 overflow-y-auto bg-hub-surface px-3 py-3 shadow-xl"
          >
            <div className="flex items-center justify-between pb-2">
              {brand}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label={copy.sidebar.closeMenu}
                className="grid size-8 place-items-center rounded-md text-hub-ink hover:bg-hub-honey-soft"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {navList(false)}
            {footer(false)}
          </div>
        </div>
      )}

      {/* desktop sidebar */}
      <aside
        data-collapsed={collapsed || undefined}
        className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-0.5 self-start overflow-y-auto border-r border-hub-border bg-hub-surface py-3 transition-[width] duration-200 ease-linear lg:flex ${
          collapsed ? "w-12 px-2" : "w-64 px-3"
        }`}
      >
        <div className={`flex items-center pb-3 ${collapsed ? "justify-center" : "gap-2 px-2"}`}>
          {!collapsed && brand}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? copy.sidebar.expand : copy.sidebar.collapse}
            onMouseEnter={collapsed ? showTooltip(copy.sidebar.expand) : undefined}
            onMouseLeave={collapsed ? () => setTooltip(null) : undefined}
            className={`grid size-8 shrink-0 place-items-center rounded-md text-hub-muted transition-colors hover:bg-hub-honey-soft hover:text-hub-ink ${
              collapsed ? "" : "ml-auto"
            }`}
          >
            <PanelLeft className="size-4" aria-hidden />
          </button>
        </div>
        {navList(collapsed)}
        {footer(collapsed)}
      </aside>

      {/* icon-rail tooltip (fixed so the aside's overflow doesn't clip it) */}
      {collapsed && tooltip && (
        <div
          role="tooltip"
          style={{ top: tooltip.top }}
          className="pointer-events-none fixed left-14 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-hub-ink px-2 py-1 text-xs font-semibold text-hub-surface shadow-md"
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}
