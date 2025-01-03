'use client'

import { createClient } from '@utils/supabase/client'
import { useEffect } from 'react'

type User = {
  id: string
  username: string
}

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const supabase = createClient()

  useEffect(() => {
    const channels = supabase.channel('users-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'uzerz' },
        (payload) => {
          console.log('User change received!', payload)
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [])

  return (
    <ul>
      {initialUsers?.map((user) => (
        <li key={user.id}>{user.username}</li>
      ))}
    </ul>
  )
} 