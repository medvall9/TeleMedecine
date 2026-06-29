import { apiClient, unwrap } from "./apiClient"
import type { Constante, Consultation, Ordonnance } from "@/types/patient.types"
import { consultationService } from "./consultationService"
import { constanteService } from "./constanteService"
import { prescriptionService } from "./prescriptionService"

export interface MedicalRecordBundle {
  consultations: Consultation[]
  ordonnances: Ordonnance[]
  constantes: Constante[]
}

export const medicalRecordService = {
  async getAll(): Promise<MedicalRecordBundle> {
    const [consultations, ordonnances, constantes] = await Promise.all([
      consultationService.getAll(),
      prescriptionService.getAll(),
      constanteService.getAll(),
    ])
    return { consultations, ordonnances, constantes }
  },

  async getByPatientId(patientId: number, rendezvousIds: number[]): Promise<MedicalRecordBundle> {
    const bundle = await medicalRecordService.getAll()
    const rdvSet = new Set(rendezvousIds)
    return {
      consultations: bundle.consultations.filter((c) => rdvSet.has(c.rendezvous)),
      ordonnances: bundle.ordonnances.filter((o) =>
        bundle.consultations.some(
          (c) => c.id === o.consultation && rdvSet.has(c.rendezvous),
        ),
      ),
      constantes: bundle.constantes.filter((c) =>
        bundle.consultations.some(
          (consult) => consult.id === c.consultation && rdvSet.has(consult.rendezvous),
        ),
      ),
    }
  },
}
