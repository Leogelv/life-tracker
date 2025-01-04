'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contact } from '@/types/contacts'
import { useRouter } from 'next/navigation'

export default function ContactPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContact()
    
    // Подписываемся на обновления
    const channel = supabase
      .channel('contact-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts_userbot_leo',
          filter: `user_id=eq.${params.id}`
        },
        (payload) => {
          console.log('🔄 Contact updated:', payload)
          setContact(current => current ? { ...current, ...payload.new } : null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  async function fetchContact() {
    const { data, error } = await supabase
      .from('contacts_userbot_leo')
      .select('*')
      .eq('user_id', params.id)
      .single()

    if (error) {
      console.error('Error fetching contact:', error)
      return
    }

    setContact(data)
  }

  async function analyzeHistory() {
    try {
      setAnalyzing(true)
      
      // Fetch chat history
      const response = await fetch(`/api/contacts?chat_id=${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch history')
      const history = await response.json()

      // Send to DeepSeek
      const deepseekResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history })
      })

      if (!deepseekResponse.ok) throw new Error('Failed to analyze')
      const analysis = await deepseekResponse.json()

      // Update contact in Supabase
      const { error } = await supabase
        .from('contacts_userbot_leo')
        .update({ 
          history: {
            raw: history,
            analysis: analysis
          },
          summary: analysis
        })
        .eq('user_id', params.id)

      if (error) throw error

      // Update local state
      setContact(current => current ? {
        ...current,
        history: {
          raw: history,
          analysis: analysis
        },
        summary: analysis
      } : null)

    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze history')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!contact) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Header с крутым градиентным бордером */}
      <div className="relative mb-8 p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-2xl">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 
              text-gray-300 hover:text-white transition-all duration-200"
          >
            <span>←</span>
            <span>Назад</span>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
            text-transparent bg-clip-text">
            {contact.first_name} {contact.last_name}
          </h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Анализ диалога */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Анализ диалога</h2>
            <button
              onClick={analyzeHistory}
              disabled={analyzing}
              className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                text-white font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Анализируем...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                    <span>Анализировать диалог</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {contact.summary ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
                  hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-4">Краткое содержание</h3>
                  <p className="text-gray-300 leading-relaxed">{contact.summary.summary}</p>
                  
                  {contact.summary.topics?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-gray-400 mb-3">Обсуждаемые темы:</h4>
                      <div className="flex flex-wrap gap-2">
                        {contact.summary.topics.map((topic, i) => (
                          <span 
                            key={i}
                            className="px-4 py-1.5 rounded-full text-sm font-medium
                              bg-gradient-to-r from-indigo-500/10 to-purple-500/10 
                              border border-indigo-500/20 text-indigo-300
                              hover:border-indigo-500/30 hover:from-indigo-500/20 hover:to-purple-500/20
                              transition-all duration-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Участники */}
              <div>
                <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
                  hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
                  <h3 className="text-xl font-semibold text-white mb-4">Участники</h3>
                  {contact.summary.participants && (
                    <div className="space-y-4">
                      {contact.summary.participants.roles?.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 mb-2">Роли</h4>
                          <div className="space-y-2">
                            {contact.summary.participants.roles.map((role, i) => (
                              <div key={i} 
                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30
                                  border border-gray-600/30">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                <span className="text-gray-200">{role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {contact.summary.participants.interests?.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 mb-2">Интересы</h4>
                          <div className="flex flex-wrap gap-2">
                            {contact.summary.participants.interests.map((interest, i) => (
                              <span key={i}
                                className="px-3 py-1 rounded-lg text-sm
                                  bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Психологические аспекты */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
                hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Психологический профиль</h3>
                {contact.summary.psychologicalAspects && (
                  <div className="space-y-4">
                    {contact.summary.psychologicalAspects.values?.length > 0 && (
                      <div>
                        <h4 className="text-gray-400 mb-2">Ценности</h4>
                        <div className="space-y-2">
                          {contact.summary.psychologicalAspects.values.map((value, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                              <span className="text-gray-200">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Бизнес-анализ */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
                hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">Бизнес-анализ</h3>
                {contact.summary.businessAnalysis && (
                  <div className="space-y-4">
                    {contact.summary.businessAnalysis.strengths?.length > 0 && (
                      <div>
                        <h4 className="text-gray-400 mb-2">Сильные стороны</h4>
                        <div className="space-y-2">
                          {contact.summary.businessAnalysis.strengths.map((strength, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg
                              bg-gradient-to-r from-emerald-500/10 to-teal-500/10 
                              border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span className="text-emerald-200">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Выводы */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
                hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-4">План действий</h3>
                {contact.summary.conclusions && (
                  <div className="space-y-4">
                    {contact.summary.conclusions.nextSteps?.length > 0 && (
                      <div>
                        <h4 className="text-gray-400 mb-2">Следующие шаги</h4>
                        <div className="space-y-3">
                          {contact.summary.conclusions.nextSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg
                              bg-gradient-to-r from-pink-500/10 to-rose-500/10
                              border border-pink-500/20">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full 
                                bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs">
                                {i + 1}
                              </span>
                              <span className="text-gray-200">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-8 border border-gray-700/50 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-lg">
                Нажмите кнопку "Анализировать диалог" чтобы получить анализ переписки
              </p>
            </div>
          )}
        </div>

        {/* История сообщений */}
        <div className="relative">
          <h2 className="text-2xl font-bold text-white mb-6">История сообщений</h2>
          
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            {contact.history?.raw?.messages ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 
                scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-gray-800/30">
                {contact.history.raw.messages.map((msg, i) => (
                  <div 
                    key={i}
                    className={`flex ${msg.from_user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`relative group max-w-[60%] ${msg.from_user ? 'ml-12' : 'mr-12'}`}>
                      {/* Время сообщения (появляется при наведении) */}
                      <div className={`absolute top-0 ${msg.from_user ? 'right-full mr-2' : 'left-full ml-2'}
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        text-xs text-gray-500 whitespace-nowrap pt-2`}>
                        {new Date(msg.date).toLocaleString()}
                      </div>
                      
                      <div className={`p-4 rounded-2xl backdrop-blur-sm
                        ${msg.from_user 
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-tr-sm' 
                          : 'bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 rounded-tl-sm'
                        }`}>
                        <p className="text-gray-200 break-words">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
                  bg-gradient-to-r from-gray-700/30 to-gray-600/30 border border-gray-600/30 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">
                  История сообщений появится после анализа диалога
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 