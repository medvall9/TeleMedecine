"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  FolderHeart,
  Stethoscope,
  Pill,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Activity,
  ClipboardList,
  Bell,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/usePermissions"

export const navItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/appointments", label: "Rendez-vous", icon: CalendarDays },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/consultations", label: "Consultations", icon: Stethoscope },
  { href: "/records", label: "Dossiers médicaux", icon: FolderHeart },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/questionnaires", label: "Questionnaire", icon: ClipboardList },
  { href: "/statistics", label: "Statistiques", icon: BarChart3 },
  { href: "/admin", label: "Administration", icon: ShieldCheck },
  { href: "/settings", label: "Paramètres", icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { canAccessNav } = usePermissions()
  const visibleItems = navItems.filter((item) => canAccessNav(item.href))

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Activity className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-sidebar-accent-foreground">
              MediConnect
            </span>
          </Link>
          <button
            onClick={onClose}
            className="text-sidebar-foreground/70 hover:text-sidebar-accent-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
