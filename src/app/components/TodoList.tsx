'use client'

import { createClient } from '@utils/supabase/client'
import { useEffect, useState } from 'react'

type Todo = {
  id: string
  name: string
  done: boolean
  date: string
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const supabase = createClient()

  useEffect(() => {
    const channels = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          console.log('Change received!', payload)
          if (payload.eventType === 'INSERT') {
            setTodos(current => [...current, payload.new as Todo])
          } else if (payload.eventType === 'DELETE') {
            setTodos(current => current.filter(todo => todo.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setTodos(current => 
              current.map(todo => 
                todo.id === payload.new.id ? payload.new as Todo : todo
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [supabase])

  return (
    <ul className="space-y-2">
      {todos?.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-lg hover:from-gray-800/50 hover:to-gray-900/50 transition-all duration-300 shadow-lg backdrop-blur-sm">
          <input 
            type="checkbox" 
            checked={todo.done}
            onChange={async () => {
              const { error } = await supabase
                .from('todos')
                .update({ done: !todo.done })
                .eq('id', todo.id)
              
              if (error) console.error('Error updating todo:', error)
            }}
            className="w-5 h-5 rounded-md border-gray-600 focus:ring-purple-500 text-purple-500 transition-all duration-200"
          />
          <span className={`flex-1 ${todo.done ? 'line-through text-gray-500' : 'text-gray-200'} transition-all duration-200`}>
            {todo.name}
          </span>
          <div className="flex flex-col items-end text-xs">
            <span className="text-purple-400">{new Date(todo.date).toLocaleDateString('ru-RU', { 
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}</span>
            <span className="text-gray-500">{new Date(todo.date).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </li>
      ))}
    </ul>
  )
} 