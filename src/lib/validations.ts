import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().trim().email('Email invalide').max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  phone: z.string().trim().min(1, 'Le téléphone est requis').max(20, 'Le téléphone ne peut pas dépasser 20 caractères'),
  status: z.enum(['Actif', 'Suspendu'], { errorMap: () => ({ message: 'Statut invalide' }) }),
});

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Client invalide'),
  invoice_number: z.string().trim().min(1, 'Le numéro de facture est requis').max(50, 'Le numéro ne peut pas dépasser 50 caractères'),
  amount: z.number().positive('Le montant doit être positif').max(999999999, 'Le montant est trop élevé'),
  status: z.enum(['Payée', 'En Attente', 'En retard', 'Brouillon'], { errorMap: () => ({ message: 'Statut invalide' }) }),
  issue_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date d\'émission invalide'),
  due_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date d\'échéance invalide'),
}).refine((data) => new Date(data.due_date) >= new Date(data.issue_date), {
  message: 'La date d\'échéance doit être après la date d\'émission',
  path: ['due_date'],
});

export const subscriptionSchema = z.object({
  client_id: z.string().uuid('Client invalide'),
  type: z.enum(['Fibre Optique', '4G/5G', 'ADSL'], { errorMap: () => ({ message: 'Type invalide' }) }),
  plan: z.string().trim().min(1, 'Le plan est requis').max(100, 'Le plan ne peut pas dépasser 100 caractères'),
  price: z.number().positive('Le prix doit être positif').max(999999, 'Le prix est trop élevé'),
  status: z.enum(['Actif', 'En attente', 'Suspendu'], { errorMap: () => ({ message: 'Statut invalide' }) }),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date de début invalide'),
  next_billing: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date de paiement invalide'),
}).refine((data) => new Date(data.next_billing) >= new Date(data.start_date), {
  message: 'La date de paiement doit être après la date de début',
  path: ['next_billing'],
});

export const ticketSchema = z.object({
  client_id: z.string().uuid('Client invalide'),
  ticket_number: z.string().trim().min(1, 'Le numéro de ticket est requis').max(50, 'Le numéro ne peut pas dépasser 50 caractères'),
  subject: z.string().trim().min(1, 'Le sujet est requis').max(200, 'Le sujet ne peut pas dépasser 200 caractères'),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional(),
  priority: z.enum(['Basse', 'Moyenne', 'Haute', 'Urgente'], { errorMap: () => ({ message: 'Priorité invalide' }) }),
  status: z.enum(['Nouveau', 'En cours', 'Résolu'], { errorMap: () => ({ message: 'Statut invalide' }) }),
});

export const inventorySchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  quantity: z.number().int('La quantité doit être un nombre entier').min(0, 'La quantité ne peut pas être négative'),
  min_quantity: z.number().int('La quantité minimale doit être un nombre entier').min(0, 'La quantité minimale ne peut pas être négative'),
  unit: z.string().trim().min(1, 'L\'unité est requise').max(20, 'L\'unité ne peut pas dépasser 20 caractères'),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
export type InventoryFormData = z.infer<typeof inventorySchema>;
