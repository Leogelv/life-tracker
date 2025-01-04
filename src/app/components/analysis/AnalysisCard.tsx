'use client'

interface Context {
  type?: string
  mainGoal?: string
  technologies?: string[]
}

interface BusinessAnalysis {
  risks?: string[]
  strengths?: string[]
  recommendations?: string[]
}

interface PsychologicalAspects {
  mood?: string
  values?: string[]
  motivations?: string[]
}

interface Conclusions {
  pending?: string[]
  achieved?: string[]
  nextSteps?: string[]
}

interface Analysis {
  topics: string[]
  context?: Context
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  actionItems: string[]
  conclusions?: Conclusions
  businessAnalysis?: BusinessAnalysis
  psychologicalAspects?: PsychologicalAspects
}

interface Props {
  analysis: Analysis
}

export function AnalysisCard({ analysis }: Props) {
  // Проверки для психологических аспектов
  const hasValues = analysis.psychologicalAspects?.values && analysis.psychologicalAspects.values.length > 0
  const hasMotivations = analysis.psychologicalAspects?.motivations && analysis.psychologicalAspects.motivations.length > 0
  
  // Проверки для бизнес-анализа
  const hasStrengths = analysis.businessAnalysis?.strengths && analysis.businessAnalysis.strengths.length > 0
  const hasRisks = analysis.businessAnalysis?.risks && analysis.businessAnalysis.risks.length > 0
  const hasRecommendations = analysis.businessAnalysis?.recommendations && analysis.businessAnalysis.recommendations.length > 0
  
  // Проверки для выводов
  const hasNextSteps = analysis.conclusions?.nextSteps && analysis.conclusions.nextSteps.length > 0
  const hasAchievements = analysis.conclusions?.achieved && analysis.conclusions.achieved.length > 0
  const hasPending = analysis.conclusions?.pending && analysis.conclusions.pending.length > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Основная информация */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
          hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-4">Краткое содержание</h3>
          <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
          
          {/* Контекст */}
          {(analysis.context?.type || analysis.context?.mainGoal) && (
            <div className="mt-6 space-y-4">
              {analysis.context.type && (
                <div>
                  <h4 className="text-gray-400 mb-2">Тип общения</h4>
                  <div className="px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600/30">
                    <span className="text-gray-200">{analysis.context.type}</span>
                  </div>
                </div>
              )}
              {analysis.context.mainGoal && (
                <div>
                  <h4 className="text-gray-400 mb-2">Основная цель</h4>
                  <div className="px-4 py-2 rounded-lg bg-gray-700/30 border border-gray-600/30">
                    <span className="text-gray-200">{analysis.context.mainGoal}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {analysis.topics?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-gray-400 mb-3">Обсуждаемые темы:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-full text-sm font-medium
                    bg-gradient-to-r from-indigo-500/10 to-purple-500/10 
                    border border-indigo-500/20 text-indigo-300
                    hover:border-indigo-500/30 hover:from-indigo-500/20 hover:to-purple-500/20
                    transition-all duration-300">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.context?.technologies && (
            <div className="mt-6">
              <h4 className="text-gray-400 mb-3">Используемые технологии:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.context.technologies.map((tech, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-medium
                    bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                    border border-blue-500/20 text-blue-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Тональность и задачи */}
      <div className="space-y-6">
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
          hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
          <h4 className="text-xl font-semibold text-white mb-4">Тональность диалога</h4>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
              ${analysis.sentiment === 'positive' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : analysis.sentiment === 'negative'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {analysis.sentiment === 'positive' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                ) : analysis.sentiment === 'negative' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 9h.01M16 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 13h.01"/>
                )}
              </svg>
              {analysis.sentiment === 'positive' ? 'Позитивная' :
               analysis.sentiment === 'negative' ? 'Негативная' : 
               'Нейтральная'}
            </span>
          </div>
        </div>

        {analysis.actionItems?.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
            hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
            <h4 className="text-xl font-semibold text-white mb-4">Задачи</h4>
            <div className="space-y-3">
              {analysis.actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg
                  bg-gradient-to-r from-pink-500/10 to-rose-500/10
                  border border-pink-500/20">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full 
                    bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs">
                    {i + 1}
                  </span>
                  <span className="text-gray-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Психологические аспекты */}
      {analysis.psychologicalAspects && (
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
          hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-4">Психологический профиль</h3>
          <div className="space-y-4">
            {analysis.psychologicalAspects.mood && (
              <div>
                <h4 className="text-gray-400 mb-2">Настроение</h4>
                <div className="px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <span className="text-violet-200">{analysis.psychologicalAspects.mood}</span>
                </div>
              </div>
            )}
            
            {hasValues && (
              <div>
                <h4 className="text-gray-400 mb-2">Ценности</h4>
                <div className="space-y-2">
                  {analysis.psychologicalAspects.values!.map((value, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                      <span className="text-gray-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasMotivations && (
              <div>
                <h4 className="text-gray-400 mb-2">Мотивация</h4>
                <div className="space-y-2">
                  {analysis.psychologicalAspects.motivations!.map((motivation, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                      <span className="text-gray-200">{motivation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Бизнес-анализ */}
      {analysis.businessAnalysis && (
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
          hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-4">Бизнес-анализ</h3>
          <div className="space-y-4">
            {hasStrengths && (
              <div>
                <h4 className="text-gray-400 mb-2">Сильные стороны</h4>
                <div className="space-y-2">
                  {analysis.businessAnalysis.strengths!.map((strength, i) => (
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

            {hasRisks && (
              <div>
                <h4 className="text-gray-400 mb-2">Риски</h4>
                <div className="space-y-2">
                  {analysis.businessAnalysis.risks!.map((risk, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg
                      bg-gradient-to-r from-rose-500/10 to-red-500/10 
                      border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span className="text-rose-200">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasRecommendations && (
              <div>
                <h4 className="text-gray-400 mb-2">Рекомендации</h4>
                <div className="space-y-2">
                  {analysis.businessAnalysis.recommendations!.map((rec, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg
                      bg-gradient-to-r from-amber-500/10 to-orange-500/10 
                      border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span className="text-amber-200">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Выводы */}
      {analysis.conclusions && (
        <div className="bg-gray-800/40 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50
          hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-4">План действий</h3>
          <div className="space-y-4">
            {hasNextSteps && (
              <div>
                <h4 className="text-gray-400 mb-2">Следующие шаги</h4>
                <div className="space-y-3">
                  {analysis.conclusions.nextSteps!.map((step, i) => (
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

            {hasAchievements && (
              <div>
                <h4 className="text-gray-400 mb-2">Достигнуто</h4>
                <div className="space-y-2">
                  {analysis.conclusions.achieved!.map((achievement, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg
                      bg-gradient-to-r from-green-500/10 to-emerald-500/10 
                      border border-green-500/20">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-200">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasPending && (
              <div>
                <h4 className="text-gray-400 mb-2">В процессе</h4>
                <div className="space-y-2">
                  {analysis.conclusions.pending!.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg
                      bg-gradient-to-r from-yellow-500/10 to-amber-500/10 
                      border border-yellow-500/20">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-yellow-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 