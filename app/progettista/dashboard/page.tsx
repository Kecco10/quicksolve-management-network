import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProgettistaDashboardClient from './progettista-dashboard-client'

export default async function ProgettistaDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/progettista/login')
  }

  const { data } = await supabase
    .from('progettista_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return <ProgettistaDashboardClient userId={user.id} userEmail={user.email ?? ''} initialData={data} />
}
