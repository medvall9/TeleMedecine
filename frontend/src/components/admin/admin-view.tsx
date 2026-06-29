"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LabeledSelect } from "@/components/shared/labeled-select"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { StatCard } from "@/components/shared/stat-card"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { useDashboard } from "@/queries/useDashboard"
import { userService } from "@/services/userService"
import { medecinService } from "@/services/medecinService"
import { patientService } from "@/services/patientService"
import { rapportService } from "@/services/rapportService"
import { getErrorMessage } from "@/services/apiClient"
import { Users, ShieldCheck, BarChart3, FileText, Trash2 } from "lucide-react"
import type { User, UserRole } from "@/types/user.types"
import { formatDateTime } from "@/utils/formatDate"

export function AdminView() {
  const { stats, isLoading: statsLoading } = useDashboard()
  const queryClient = useQueryClient()

  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => userService.getAll() })
  const medecinsQuery = useQuery({ queryKey: ["medecins"], queryFn: () => medecinService.getAll() })
  const specialitesQuery = useQuery({ queryKey: ["specialites"], queryFn: () => medecinService.getSpecialites() })
  const rapportsQuery = useQuery({ queryKey: ["rapports"], queryFn: () => rapportService.getAll() })

  const specialiteOptions = useMemo(
    () => (specialitesQuery.data ?? []).map((s) => ({ value: String(s.id), label: s.nom })),
    [specialitesQuery.data],
  )

  const linkedMedecinUserIds = useMemo(
    () => new Set((medecinsQuery.data ?? []).map((m) => m.user)),
    [medecinsQuery.data],
  )

  const unlinkedMedecinUsers = useMemo(
    () =>
      (usersQuery.data ?? []).filter(
        (u) => u.role === "medecin" && !linkedMedecinUserIds.has(u.id),
      ),
    [usersQuery.data, linkedMedecinUserIds],
  )

  const unlinkedMedecinUserOptions = useMemo(
    () =>
      unlinkedMedecinUsers.map((u) => ({
        value: String(u.id),
        label: `${u.first_name} ${u.last_name} (${u.username})`.trim(),
      })),
    [unlinkedMedecinUsers],
  )

  async function linkMedecinProfile() {
    const userId = Number(linkUserId)
    const specId = Number(linkSpecialite) || specialitesQuery.data?.[0]?.id
    if (!userId) {
      toast.error("Sélectionnez un compte médecin")
      return
    }
    if (!specId) {
      toast.error("Créez d'abord une spécialité")
      return
    }
    setLinkingProfile(true)
    try {
      await medecinService.create({
        user: userId,
        specialite: specId,
        numero_ordre: linkNumeroOrdre || `ORD-${userId}`,
        experience: Number(linkExperience) || 0,
        consultation_fee: Number(linkFee) || 0,
        disponible: true,
      })
      toast.success("Profil médecin lié")
      setLinkUserId("")
      setLinkNumeroOrdre("")
      queryClient.invalidateQueries({ queryKey: ["medecins"] })
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLinkingProfile(false)
    }
  }

  useEffect(() => {
    if (medecinsQuery.isError) toast.error(getErrorMessage(medecinsQuery.error))
  }, [medecinsQuery.isError, medecinsQuery.error])

  useEffect(() => {
    if (specialitesQuery.isError) toast.error(getErrorMessage(specialitesQuery.error))
  }, [specialitesQuery.isError, specialitesQuery.error])

  const [newRapportComment, setNewRapportComment] = useState("")
  const [linkUserId, setLinkUserId] = useState("")
  const [linkSpecialite, setLinkSpecialite] = useState("")
  const [linkNumeroOrdre, setLinkNumeroOrdre] = useState("")
  const [linkExperience, setLinkExperience] = useState("0")
  const [linkFee, setLinkFee] = useState("0")
  const [linkingProfile, setLinkingProfile] = useState(false)

  const [newSpec, setNewSpec] = useState("")
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "patient" as UserRole,
    date_naissance: "1990-01-01",
    sexe: "M" as "M" | "F",
    specialite: "",
    numero_ordre: "",
    experience: "0",
    consultation_fee: "0",
  })

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["users"] })

  const createSpecMutation = useMutation({
    mutationFn: (nom: string) => medecinService.createSpecialite({ nom }),
    onSuccess: () => {
      toast.success("Spécialité créée")
      queryClient.invalidateQueries({ queryKey: ["specialites"] })
      setNewSpec("")
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const created = await userService.create({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        is_active: true,
      })
      if (newUser.role === "patient") {
        await patientService.create({
          user: created.id,
          date_naissance: newUser.date_naissance,
          sexe: newUser.sexe,
        })
      } else if (newUser.role === "medecin") {
        const specialites = specialitesQuery.data ?? []
        const specId = Number(newUser.specialite) || specialites[0]?.id
        if (!specId) throw new Error("Créez d'abord une spécialité médicale")
        await medecinService.create({
          user: created.id,
          specialite: specId,
          numero_ordre: newUser.numero_ordre || `ORD-${created.id}`,
          experience: Number(newUser.experience) || 0,
          consultation_fee: Number(newUser.consultation_fee) || 0,
          disponible: true,
        })
      }
      return created
    },
    onSuccess: () => {
      toast.success("Utilisateur créé avec profil associé")
      invalidateUsers()
      queryClient.invalidateQueries({ queryKey: ["patients"] })
      queryClient.invalidateQueries({ queryKey: ["medecins"] })
      setNewUser({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "patient",
        date_naissance: "1990-01-01",
        sexe: "M",
        specialite: "",
        numero_ordre: "",
        experience: "0",
        consultation_fee: "0",
      })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<User> }) =>
      userService.update(id, payload),
    onSuccess: () => {
      toast.success("Utilisateur mis à jour")
      invalidateUsers()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      toast.success("Utilisateur supprimé")
      invalidateUsers()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <>
      <PageHeader title="Administration" description="Gestion des utilisateurs, spécialités et rapports système." />

      <Tabs defaultValue="users" className="mt-6">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="medecins">Médecins</TabsTrigger>
          <TabsTrigger value="specialties">Spécialités</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 space-y-4">
          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Inviter un utilisateur</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div><Label>Prénom</Label><Input value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} /></div>
              <div><Label>Nom</Label><Input value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} /></div>
              <div><Label>Username</Label><Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
              <div><Label>Mot de passe</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div>
              <div>
                <Label>Rôle</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: (v ?? "patient") as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="medecin">Médecin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newUser.role === "patient" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>Date de naissance</Label>
                  <Input type="date" value={newUser.date_naissance} onChange={(e) => setNewUser({ ...newUser, date_naissance: e.target.value })} />
                </div>
                <div>
                  <Label>Sexe</Label>
                  <Select value={newUser.sexe} onValueChange={(v) => setNewUser({ ...newUser, sexe: (v ?? "M") as "M" | "F" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {newUser.role === "medecin" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>Spécialité</Label>
                  <LabeledSelect
                    value={newUser.specialite}
                    onValueChange={(v) => setNewUser({ ...newUser, specialite: v })}
                    options={specialiteOptions}
                    placeholder={specialiteOptions.length ? "Choisir..." : "Créez d'abord une spécialité"}
                  />
                </div>
                <div><Label>N° ordre</Label><Input value={newUser.numero_ordre} onChange={(e) => setNewUser({ ...newUser, numero_ordre: e.target.value })} placeholder="Auto si vide" /></div>
                <div><Label>Expérience (ans)</Label><Input type="number" value={newUser.experience} onChange={(e) => setNewUser({ ...newUser, experience: e.target.value })} /></div>
                <div><Label>Honoraires</Label><Input type="number" value={newUser.consultation_fee} onChange={(e) => setNewUser({ ...newUser, consultation_fee: e.target.value })} /></div>
              </div>
            )}
            <Button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending}>
              Créer l&apos;utilisateur
            </Button>
          </Card>

          {usersQuery.isLoading ? (
            <TableSkeleton rows={5} />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(usersQuery.data ?? []).map((u: User) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">
                        {u.first_name} {u.last_name}
                        {u.role === "medecin" && !linkedMedecinUserIds.has(u.id) && (
                          <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700">
                            Profil non lié
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.role}
                          onValueChange={(v) =>
                            updateUserMutation.mutate({ id: u.id, payload: { role: (v ?? u.role) as UserRole } })
                          }
                        >
                          <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="medecin">Médecin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateUserMutation.mutate({ id: u.id, payload: { is_active: !u.is_active } })
                          }
                        >
                          {u.is_active ? "Actif" : "Suspendu"}
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="destructive" size="icon-sm" onClick={() => setDeleteUser(u)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="medecins" className="mt-4 space-y-4">
          {unlinkedMedecinUsers.length > 0 && (
            <Card className="space-y-3 border-amber-500/30 bg-amber-500/5 p-4">
              <div>
                <h3 className="text-sm font-semibold">Lier un compte médecin existant</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Un compte avec rôle « médecin » n&apos;apparaît ici que s&apos;il a un profil dans{" "}
                  <code className="text-xs">/api/medecins/</code>. Comptes sans profil :{" "}
                  {unlinkedMedecinUsers.map((u) => u.username).join(", ")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>Compte utilisateur</Label>
                  <LabeledSelect
                    value={linkUserId}
                    onValueChange={setLinkUserId}
                    options={unlinkedMedecinUserOptions}
                    placeholder="Choisir le médecin"
                  />
                </div>
                <div>
                  <Label>Spécialité</Label>
                  <LabeledSelect
                    value={linkSpecialite}
                    onValueChange={setLinkSpecialite}
                    options={specialiteOptions}
                    placeholder="Choisir une spécialité"
                  />
                </div>
                <div>
                  <Label>N° ordre</Label>
                  <Input
                    value={linkNumeroOrdre}
                    onChange={(e) => setLinkNumeroOrdre(e.target.value)}
                    placeholder="Auto si vide"
                  />
                </div>
                <div>
                  <Label>Expérience (ans)</Label>
                  <Input type="number" value={linkExperience} onChange={(e) => setLinkExperience(e.target.value)} />
                </div>
                <div>
                  <Label>Honoraires</Label>
                  <Input type="number" value={linkFee} onChange={(e) => setLinkFee(e.target.value)} />
                </div>
              </div>
              <Button onClick={linkMedecinProfile} disabled={linkingProfile}>
                {linkingProfile ? "Liaison..." : "Lier le profil médecin"}
              </Button>
            </Card>
          )}

          {medecinsQuery.isLoading ? (
            <TableSkeleton rows={4} />
          ) : medecinsQuery.isError ? (
            <EmptyState title="Erreur de chargement" description={getErrorMessage(medecinsQuery.error)} />
          ) : (medecinsQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="Aucun profil médecin"
              description={
                unlinkedMedecinUsers.length > 0
                  ? "Utilisez le formulaire ci-dessus pour lier un compte existant, ou créez un nouveau médecin dans Utilisateurs."
                  : "Créez un utilisateur avec le rôle Médecin dans l'onglet Utilisateurs (avec spécialité)."
              }
            />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3">Médecin</th>
                    <th className="px-4 py-3">Spécialité</th>
                    <th className="px-4 py-3">N° ordre</th>
                    <th className="px-4 py-3">Honoraires</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(medecinsQuery.data ?? []).map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3">{m.specialtyName}</td>
                      <td className="px-4 py-3">{m.numero_ordre}</td>
                      <td className="px-4 py-3">{m.consultation_fee} MAD</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={() =>
                            medecinService.remove(m.id).then(() => {
                              toast.success("Profil médecin supprimé")
                              queryClient.invalidateQueries({ queryKey: ["medecins"] })
                            }).catch((e) => toast.error(getErrorMessage(e)))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="specialties" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input value={newSpec} onChange={(e) => setNewSpec(e.target.value)} placeholder="Nouvelle spécialité" />
            <Button onClick={() => createSpecMutation.mutate(newSpec)} disabled={!newSpec.trim()}>
              Ajouter
            </Button>
          </div>
          {specialitesQuery.isError ? (
            <EmptyState title="Erreur de chargement" description={getErrorMessage(specialitesQuery.error)} />
          ) : (
          <Card className="divide-y p-0">
            {(specialitesQuery.data ?? []).length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Aucune spécialité — ajoutez-en une ci-dessus.</p>
            ) : (
            (specialitesQuery.data ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium">{s.nom}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    medecinService.removeSpecialite(s.id).then(() => {
                      toast.success("Spécialité supprimée")
                      queryClient.invalidateQueries({ queryKey: ["specialites"] })
                    }).catch((e) => toast.error(getErrorMessage(e)))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
            )}
          </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableSkeleton key={i} rows={1} />)
            ) : (
              <>
                <StatCard title="Utilisateurs" value={String(stats.users ?? 0)} icon={Users} accent="var(--chart-1)" />
                <StatCard title="Patients" value={String(stats.patients ?? 0)} icon={ShieldCheck} accent="var(--chart-2)" />
                <StatCard title="Médecins" value={String(stats.medecins ?? 0)} icon={BarChart3} accent="var(--chart-3)" />
                <StatCard title="Rendez-vous" value={String(stats.rendezvous ?? 0)} icon={FileText} accent="var(--chart-4)" />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rapports" className="mt-4 space-y-4">
          <Card className="space-y-3 p-4">
            <h3 className="text-sm font-semibold">Nouveau rapport</h3>
            <Input
              value={newRapportComment}
              onChange={(e) => setNewRapportComment(e.target.value)}
              placeholder="Commentaire du rapport"
            />
            <Button
              onClick={() =>
                rapportService
                  .create({
                    type: "journalier",
                    date_generation: new Date().toISOString(),
                    nombre_patients: stats.patients ?? 0,
                    nombre_medecins: stats.medecins ?? 0,
                    nombre_rendezvous: stats.rendezvous ?? 0,
                    nombre_consultations: stats.consultations ?? 0,
                    nombre_ordonnances: stats.ordonnances ?? 0,
                    revenu_total: 0,
                    commentaire: newRapportComment,
                  })
                  .then(() => {
                    toast.success("Rapport créé")
                    setNewRapportComment("")
                    queryClient.invalidateQueries({ queryKey: ["rapports"] })
                  })
                  .catch((e) => toast.error(getErrorMessage(e)))
              }
            >
              Générer un rapport
            </Button>
          </Card>
          <Card className="divide-y p-0">
            {(rapportsQuery.data ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{r.type} — {formatDateTime(r.date_generation)}</p>
                  <p className="text-muted-foreground">
                    {r.commentaire || `${r.nombre_consultations} consultations · ${r.nombre_rendezvous} RDV`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    rapportService.remove(r.id).then(() => {
                      toast.success("Rapport supprimé")
                      queryClient.invalidateQueries({ queryKey: ["rapports"] })
                    }).catch((e) => toast.error(getErrorMessage(e)))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(o) => !o && setDeleteUser(null)}
        title="Supprimer l'utilisateur"
        description={`Supprimer ${deleteUser?.first_name} ${deleteUser?.last_name} ?`}
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteUser) await deleteUserMutation.mutateAsync(deleteUser.id)
        }}
      />
    </>
  )
}
