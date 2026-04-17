'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const birthDate = formData.get('birthDate') as string
  const password = formData.get('password') as string

  if (!firstName || !lastName || !email || !password) {
    return { error: 'Uzupełnij wszystkie wymagane pola.' }
  }
  if (password.length < 8) {
    return { error: 'Hasło musi mieć co najmniej 8 znaków.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      data: { first_name: firstName, last_name: lastName, role: 'client' },
    },
  })

  if (error) {
    if (error.code === 'user_already_exists') return { error: 'Konto z tym adresem e-mail już istnieje.' }
    return { error: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.' }
  }

  return { success: true, email }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Podaj e-mail i hasło.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'invalid_credentials') return { error: 'Nieprawidłowy e-mail lub hasło.' }
    if (error.code === 'email_not_confirmed') return { error: 'Potwierdź swój adres e-mail przed zalogowaniem.' }
    return { error: 'Błąd logowania. Spróbuj ponownie.' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
const role = (profile as { role: string } | null)?.role ?? 'client'
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
  if (error) return { error: 'Nie udało się zmienić hasła.' }
  redirect('/konto')
}
