"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/queries/useAuth"
import { authService } from "@/services/authService"
import { getErrorMessage } from "@/services/apiClient"

export function SettingsView() {
  const { user, refreshProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setLoading(true)
    try {
      await authService.changePassword({
        old_password: String(form.get("old_password")),
        new_password: String(form.get("new_password")),
      })
      toast.success("Mot de passe modifié")
      e.currentTarget.reset()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader title="Paramètres" description="Profil et sécurité du compte." />

      <Tabs defaultValue="profile" className="mt-6 max-w-2xl">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="space-y-4 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              <div><Label>Prénom</Label><Input value={user?.first_name ?? ""} readOnly /></div>
              <div><Label>Nom</Label><Input value={user?.last_name ?? ""} readOnly /></div>
            </div>
            <div><Label>Email</Label><Input value={user?.email ?? ""} readOnly /></div>
            <div><Label>Téléphone</Label><Input value={user?.phone ?? ""} readOnly /></div>
            <div><Label>Rôle</Label><Input value={user?.role ?? ""} readOnly className="capitalize" /></div>
            <Button variant="outline" onClick={() => refreshProfile()}>Actualiser le profil</Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="p-5">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div><Label htmlFor="old_password">Ancien mot de passe</Label><Input id="old_password" name="old_password" type="password" required /></div>
              <div><Label htmlFor="new_password">Nouveau mot de passe</Label><Input id="new_password" name="new_password" type="password" required /></div>
              <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Modifier le mot de passe"}</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
