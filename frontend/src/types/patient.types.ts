export type PatientTag = "chronic" | "urgent" | "follow-up" | "stable"

export interface PatientRecord {
  id: number
  user: number
  date_naissance: string
  sexe: "M" | "F"
  groupe_sanguin?: string
  taille?: number | null
  poids?: number | null
  allergies?: string
  antecedents?: string
  created_at: string
  updated_at: string
}

export interface EnrichedPatient extends PatientRecord {
  name?: string
  email?: string
  phone?: string
  age?: number
  tags?: PatientTag[]
  avatarColor?: string
  lastVisit?: string
}

export interface CreatePatientPayload {
  user: number
  date_naissance: string
  sexe: "M" | "F"
  groupe_sanguin?: string
  taille?: number
  poids?: number
  allergies?: string
  antecedents?: string
}

export interface Consultation {
  id: number
  rendezvous: number
  diagnostic: string
  traitement: string
  observations: string
  date_consultation: string
  prochaine_visite?: string | null
}

export interface Medicament {
  id: number
  ordonnance: number
  nom: string
  dosage: string
  frequence: string
  duree: string
  instructions: string
}

export interface Ordonnance {
  id: number
  consultation: number
  date: string
  remarque: string
  medicaments?: Medicament[]
}

export interface Constante {
  id: number
  consultation: number
  temperature?: number | null
  tension_arterielle?: string
  rythme_cardiaque?: number | null
  frequence_respiratoire?: number | null
  saturation_oxygene?: number | null
  poids?: number | null
  taille?: number | null
  commentaire?: string
  created_at: string
}

export interface Questionnaire {
  id: number
  patient: number
  allergies: boolean
  allergies_details?: string
  maladies_chroniques: boolean
  maladies_details?: string
  prend_medicaments: boolean
  medicaments_details?: string
  operations: boolean
  operations_details?: string
  fumeur: boolean
  alcool: boolean
  observations?: string
  created_at: string
  updated_at: string
}

export interface Medecin {
  id: number
  user: number
  specialite: number
  numero_ordre: string
  experience: number
  biographie?: string
  consultation_fee: number
  disponible: boolean
  created_at: string
  updated_at: string
}

export interface Specialite {
  id: number
  nom: string
  description?: string
}

export interface EnrichedMedecin extends Medecin {
  name?: string
  specialtyName?: string
}

export interface Notification {
  id: number
  utilisateur: number
  titre: string
  message: string
  type: "rendezvous" | "consultation" | "ordonnance" | "system"
  est_lu: boolean
  created_at: string
}

export interface Rapport {
  id: number
  type: "journalier" | "hebdomadaire" | "mensuel" | "annuel"
  date_generation: string
  nombre_patients: number
  nombre_medecins: number
  nombre_rendezvous: number
  nombre_consultations: number
  nombre_ordonnances: number
  revenu_total: number
  commentaire?: string
}

export interface DashboardStats {
  [key: string]: number
}
