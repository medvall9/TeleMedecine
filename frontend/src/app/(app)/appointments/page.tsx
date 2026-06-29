import { PageHeader } from "@/components/shared/page-header"
import { AppointmentsView } from "@/components/appointments/appointments-view"

export default function AppointmentsPage() {
  return (
    <>
      <PageHeader
        title="Rendez-vous"
        description="Gérez l'ensemble des consultations et téléconsultations planifiées."
      />
      <div className="mt-6">
        <AppointmentsView />
      </div>
    </>
  )
}
