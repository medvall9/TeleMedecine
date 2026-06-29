"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { useQuestionnaires } from "@/queries/useQuestionnaires"
import { useActorIds } from "@/hooks/useActorIds"
import { questionnaireService } from "@/services/questionnaireService"
import { getErrorMessage } from "@/services/apiClient"
import { ClipboardList } from "lucide-react"

const defaultForm = {
  allergies: false,
  allergies_details: "",
  maladies_chroniques: false,
  maladies_details: "",
  prend_medicaments: false,
  medicaments_details: "",
  operations: false,
  operations_details: "",
  fumeur: false,
  alcool: false,
  observations: "",
}

export function QuestionnairesView() {
  const { questionnaires, isLoading, refetch } = useQuestionnaires()
  const { patientId, hasPatientProfile } = useActorIds()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const latest = questionnaires[0]

  useEffect(() => {
    if (latest && !editingId) {
      setForm({
        allergies: latest.allergies,
        allergies_details: latest.allergies_details ?? "",
        maladies_chroniques: latest.maladies_chroniques,
        maladies_details: latest.maladies_details ?? "",
        prend_medicaments: latest.prend_medicaments,
        medicaments_details: latest.medicaments_details ?? "",
        operations: latest.operations,
        operations_details: latest.operations_details ?? "",
        fumeur: latest.fumeur,
        alcool: latest.alcool,
        observations: latest.observations ?? "",
      })
      setEditingId(latest.id)
    }
  }, [latest, editingId])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!patientId) throw new Error("Dossier patient introuvable. Contactez l'administration.")
      const payload = { ...form, patient: patientId }
      if (editingId) {
        return questionnaireService.update(editingId, payload)
      }
      return questionnaireService.create(payload)
    },
    onSuccess: (data) => {
      toast.success("Questionnaire enregistré")
      setEditingId(data.id)
      queryClient.invalidateQueries({ queryKey: ["questionnaires"] })
      refetch()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (!hasPatientProfile) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Dossier patient requis"
        description="Votre profil patient doit être créé par l'administration avant de remplir le questionnaire."
      />
    )
  }

  return (
    <>
      <PageHeader title="Questionnaire médical" description="Antécédents et informations de santé (API questionnaires)." />

      {isLoading ? (
        <div className="mt-6"><TableSkeleton rows={6} /></div>
      ) : (
        <Card className="mt-6 space-y-5 p-5">
          {[
            { key: "allergies", label: "Allergies", detail: "allergies_details" },
            { key: "maladies_chroniques", label: "Maladies chroniques", detail: "maladies_details" },
            { key: "prend_medicaments", label: "Médicaments en cours", detail: "medicaments_details" },
            { key: "operations", label: "Opérations passées", detail: "operations_details" },
          ].map(({ key, label, detail }) => (
            <div key={key} className="space-y-2 rounded-lg border border-border p-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={form[key as keyof typeof form] as boolean}
                  onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                />
              </label>
              {(form[key as keyof typeof form] as boolean) && (
                <Input
                  placeholder="Précisions..."
                  value={form[detail as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [detail]: e.target.value })}
                />
              )}
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-lg border border-border p-4">
              <span className="text-sm font-medium">Fumeur</span>
              <Switch checked={form.fumeur} onCheckedChange={(v) => setForm({ ...form, fumeur: v })} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border p-4">
              <span className="text-sm font-medium">Consommation d&apos;alcool</span>
              <Switch checked={form.alcool} onCheckedChange={(v) => setForm({ ...form, alcool: v })} />
            </label>
          </div>

          <div className="space-y-2">
            <Label>Observations</Label>
            <Input
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              placeholder="Informations complémentaires"
            />
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Enregistrement..." : editingId ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </Card>
      )}
    </>
  )
}
