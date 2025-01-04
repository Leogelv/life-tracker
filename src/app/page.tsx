import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import TodoList from './components/TodoList'
import DatabaseInfo from './components/DatabaseInfo'

// Компоненты секций
const DashboardSection = ({ 
  title, 
  icon, 
  children, 
  className = '' 
}: { 
  title: string
  icon: string
  children: React.ReactNode
  className?: string 
}) => (
  <div className={`p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl backdrop-blur-sm ${className}`}>
    <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
      <span>{icon}</span>
      {title}
    </h2>
    {children}
  </div>
)

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Life Tracker Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Привычки */}
        <DashboardSection title="Привычки" icon="💪" className="lg:col-span-2">
          <TodoList initialTodos={todos || []} />
        </DashboardSection>

        {/* Быстрые действия */}
        <DashboardSection title="Быстрые действия" icon="⚡️">
          <div className="space-y-2">
            <Link 
              href="/contacts" 
              className="block p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
            >
              👥 Просмотр контактов
            </Link>
            <Link href="/habits" className="block p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all">
              ➕ Новая привычка
            </Link>
            <Link href="/notes" className="block p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all">
              📝 Создать заметку
            </Link>
          </div>
        </DashboardSection>

        {/* Предстоящие события */}
        <DashboardSection title="Предстоящие события" icon="📅">
          <p className="text-gray-400">Скоро здесь появятся ваши события!</p>
        </DashboardSection>

        {/* Telegram интеграция */}
        <DashboardSection title="Telegram" icon="🤖">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-blue-500/20 rounded">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Bot активен
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-500/20 rounded">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Mini App в разработке
            </div>
          </div>
        </DashboardSection>
      </div>

      {/* База данных - на всю ширину внизу */}
      <DashboardSection title="База данных" icon="📊" className="col-span-full">
        <DatabaseInfo />
      </DashboardSection>
    </div>
  )
}
