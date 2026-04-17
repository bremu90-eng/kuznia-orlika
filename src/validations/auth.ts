import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').max(50),
  lastName: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki').max(50),
  email: z.string().email('Nieprawidłowy adres e-mail'),
  phone: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional(),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków').max(128),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
