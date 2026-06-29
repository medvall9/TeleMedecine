"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Bell, ChevronDown, LogOut, User, Settings, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchBar } from "@/components/shared/search-bar"
import { useAuthContext } from "@/queries/useAuth"
import { useNotifications } from "@/queries/useNotifications"
import { getInitials } from "@/utils/formatDate"
import { formatDateTime } from "@/utils/formatDate"
import { cn } from "@/lib/utils"

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuthContext()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [search, setSearch] = useState("")
  const [notifOpen, setNotifOpen] = useState(false)

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : "Utilisateur"

  const roleLabel =
    user?.role === "admin"
      ? "Administrateur"
      : user?.role === "medecin"
        ? "Médecin"
        : "Patient"

  const recent = notifications.slice(0, 6)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <button
        onClick={onMenu}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher un patient, un rendez-vous..."
        className="hidden max-w-md flex-1 sm:block"
      />

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} non lue(s)</p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => markAllAsRead()}
                >
                  <CheckCheck className="size-3.5" /> Tout lu
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
              {recent.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Aucune notification
                </p>
              ) : (
                recent.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      !n.est_lu && "bg-primary/5",
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <span className="text-sm font-medium">{n.titre}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(n.created_at)}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-border p-2">
              <Link href="/notifications" onClick={() => setNotifOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-secondary">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-foreground">{displayName}</p>
              <p className="text-xs leading-tight text-muted-foreground">{roleLabel}</p>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">Mon compte</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>
              <User className="size-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="size-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/notifications" />}>
              <Bell className="size-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
