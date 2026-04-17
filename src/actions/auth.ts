'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/validations/auth'

export async function register(formData: FormData) {
  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    birthDate: formData.get('birthDate') as string,
    password: formData.get('password') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName, role: 'client' },
    },
  })

  if (error) {
    if (error.code === 'user_already_exists') return { error: 'Konto z tym adresem e-mail już istnieje.' }
    return { error: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' }
  }

  if (data.user) {
    await supabase.from('profiles').update({
      phone: parsed.data.phone || null,
      birth_date: parsed.data.birthDate || null,
    } as { phone: string | null; birth_date: string | null }).eq('id', data.user.id)
  }

  return { success: true, email: parsed.data.email }
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'Nieprawidłowy e-mail lub hasło.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    if (error.code === 'invalid_credentials') return { error: 'Nieprawidłowy e-mail lub hasło.' }
    if (error.code === 'email_not_confirmed') return { error: 'Potwierdź swój adres e-mail przed zalogowaniem.' }
    return { error: 'Błąd logowania. Spróbuj ponownie.' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
  const role = profile?.role ?? 'client'
  redirect(role === 'admin' || role === 'trainer' ? '/panel' : '/konto')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/logowanie')
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  if (!email?.includes('@')) return { error: 'Podaj prawidłowy adres e-mail.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/ustaw-nowe-haslo`,
  })

  if (error) return { error: 'Nie udało się wysłać e-maila. Spróbuj ponownie.' }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) return { error: 'Hasło musi mieć co najmniej 8 znaków.' }
  if (password !== confirm) return { error: 'Hasła nie są identyczne.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Nie udało się zmienić hasła. Spróbuj ponownie.' }
  redirect('/konto')
}
