"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/usePermissions"
import { EmptyState } from "@/components/shared/empty-state"
import { ShieldAlert } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowed: boolean
  redirectTo?: string
}

export function RoleGuard({ children, allowed, redirectTo = "/" }: RoleGuardProps) {
  const router = useRouter()

  useEffect(() => {
    if (!allowed) {
      router.replace(redirectTo)
    }
  }, [allowed, redirectTo, router])

  if (!allowed) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Accès refusé"
        description="Vous n'avez pas les permissions nécessaires pour accéder à cette page."
      />
    )
  }

  return <>{children}</>
}
