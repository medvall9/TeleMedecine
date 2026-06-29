import type { ReactNode } from "react"
import { Activity, ShieldCheck, Video, Stethoscope } from "lucide-react"

const highlights = [
  { icon: Video, title: "Téléconsultations sécurisées", desc: "Consultez vos patients en vidéo HD chiffrée." },
  { icon: ShieldCheck, title: "Conformité RGPD & HDS", desc: "Données de santé hébergées en toute sécurité." },
  { icon: Stethoscope, title: "Suivi médical complet", desc: "Dossiers, ordonnances et historique centralisés." },
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex lg:w-1/2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-sidebar-accent-foreground">MediConnect</span>
        </div>

        <div className="space-y-8">
          <h1 className="max-w-md text-balance text-3xl font-semibold leading-tight text-sidebar-accent-foreground">
            La plateforme de télémédecine qui rapproche soignants et patients.
          </h1>
          <div className="space-y-5">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-primary">
                  <h.icon className="size-5" />
                </span>
                <div>
                  <p className="font-medium text-sidebar-accent-foreground">{h.title}</p>
                  <p className="text-sm text-sidebar-foreground/70">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-sidebar-foreground/60">
          © 2026 MediConnect. Tous droits réservés.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  )
}
