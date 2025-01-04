import { ContactList } from '@/app/components/ContactList'

export default function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Контакты</h1>
      <ContactList />
    </div>
  )
} 