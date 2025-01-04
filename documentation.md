# Документация по проекту

## Структура проекта

```
src/
  ├── app/                    # Next.js app директория
  │   ├── api/               # API роуты
  │   │   ├── analyze/      # Анализ истории сообщений через DeepSeek
  │   │   └── contacts/     # Получение истории контактов
  │   ├── components/       # React компоненты
  │   │   └── ContactList/  # Компонент списка контактов
  │   ├── contacts/         # Страница контактов
  │   │   └── [id]/        # Динамическая страница карточки контакта
  │   └── page.tsx         # Главная страница
  ├── types/                # TypeScript типы
  │   └── contacts.ts      # Типы для контактов
  └── utils/                # Утилиты
      └── supabase/        # Конфигурация Supabase
          └── client.ts    # Клиент Supabase для браузера
```

## Настройка проекта

1. Установите зависимости:
```bash
npm install @supabase/ssr openai next react react-dom
```

2. Создайте файл `.env.local` и добавьте следующие переменные:
```env
NEXT_PUBLIC_SUPABASE_URL=ваш_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_ключ
NEXT_PUBLIC_DEEPSEEK_API_KEY=ваш_ключ_deepseek
```

3. Создайте таблицу контактов в Supabase:
```sql
create table contacts_userbot_leo (
  id bigint primary key generated always as identity,
  user_id bigint not null,
  first_name text not null,
  last_name text not null,
  username text not null,
  last_message text,
  is_pinned boolean default false,
  history jsonb,
  summary jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index contacts_userbot_leo_user_id_idx on contacts_userbot_leo(user_id);
```

## Основные компоненты

### ContactList
Компонент для отображения списка контактов с возможностью фильтрации и перехода к карточке контакта.

### Карточка контакта
Отдельная страница для просмотра информации о контакте, включая:
- Анализ диалога через DeepSeek API
- История сообщений
- Краткое содержание
- Основные темы
- Задачи

## Real-time обновления

Проект использует Supabase Realtime для мгновенного обновления данных:

```typescript
const channel = supabase
  .channel('contacts-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'contacts_userbot_leo'
    },
    (payload) => {
      // Обработка изменений
    }
  )
  .subscribe()
```

## Типы данных

### Contact
```typescript
interface Contact {
  id: number
  user_id: number
  first_name: string
  last_name: string
  username: string
  last_message?: string
  is_pinned?: boolean
  history?: {
    raw: Array<{
      text: string
      date: string
      from_user: boolean
    }>
    analysis?: any
  }
  summary?: {
    summary: string
    topics: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    actionItems?: string[]
  }
}
```

## API Endpoints

### POST /api/analyze
Анализирует историю сообщений через DeepSeek API.

### GET /api/contacts
Получает историю сообщений для конкретного контакта.

## Стилизация

Проект использует:
- Tailwind CSS для стилей
- Неоморфный дизайн с эффектом стекла
- Градиенты для аватаров
- Адаптивную верстку

## Решение проблем

### Module not found: Can't resolve '@/utils/supabase/client'
1. Убедитесь что структура папок соответствует документации
2. Проверьте что путь импорта начинается с '@/'
3. В tsconfig.json должны быть настроены пути:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### CORS ошибки при запросах к API
1. Используйте Next.js API роуты вместо прямых запросов
2. Все внешние API вызовы делайте через /api/*
3. В API роутах используйте серверные ключи

### Проблемы с real-time обновлениями
1. Проверьте что канал подписки активен
2. Убедитесь что таблица в Supabase имеет включенный Realtime
3. Проверьте что payload содержит ожидаемые данные через console.log 