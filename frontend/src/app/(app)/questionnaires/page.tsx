"use client"

import { QuestionnairesView } from "@/components/questionnaires/questionnaires-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function QuestionnairesPage() {
  const { canViewQuestionnaires } = usePermissions()

  return (
    <RoleGuard allowed={canViewQuestionnaires}>
      <QuestionnairesView />
    </RoleGuard>
  )
}
