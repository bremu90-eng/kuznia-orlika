import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelSidebar } from '@/components/layout/panel-sidebar'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: profile } = await supabase.from('profiles').select('role,first_name,last_name').eq('id', user.id).single()
  if (!profile || (profile.role !== 'trainer' && profile.role !== 'admin')) redirect('/konto')

  return (
    <div className="flex min-h-screen bg-brand-black">
      <PanelSidebar role={profile.role} name={`${profile.first_name} ${profile.last_name}`} />
      <main className="flex-1 md:ml-64 p-6 md:p-8">{children}</main>
    </div>
  )
}
