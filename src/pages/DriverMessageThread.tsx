import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getMessagesBetween,
  saveMessage,
  getRecruiterProfileByUserId,
  uuid,
} from '../lib/storage'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function DriverMessageThread() {
  const { recruiterId } = useParams<{ recruiterId: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<{ id: string; sender_id: string; recipient_id: string; content: string; created_at: string }[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (!user || !recruiterId) return
    setMessages(getMessagesBetween(user.id, recruiterId))
  }, [user, recruiterId])

  // Announce newly received (incoming) messages to screen readers.
  useEffect(() => {
    if (!user || messages.length <= prevCountRef.current) {
      prevCountRef.current = messages.length
      return
    }
    const newest = messages[messages.length - 1]
    if (newest && newest.sender_id !== user.id) {
      setAnnouncement(newest.content)
    }
    prevCountRef.current = messages.length
  }, [messages, user])

  const handleSend = () => {
    if (!user || !recruiterId || !newMessage.trim()) return
    const msg = {
      id: uuid(),
      sender_id: user.id,
      recipient_id: recruiterId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
      thread_id: [user.id, recruiterId].sort().join('_'),
    }
    saveMessage(msg)
    setMessages((prev) => [...prev, msg])
    setNewMessage('')
  }

  if (!user || !recruiterId) return null

  const recruiter = getRecruiterProfileByUserId(recruiterId)
  const recruiterName = recruiter
    ? `${recruiter.name} - ${recruiter.company_name}`
    : 'Recruiter'

  return (
    <main
      className="relative flex min-h-screen flex-col px-6 py-xl bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/messages-bg.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-3xl px-4">
        <Link to="/driver/messages" className="mb-6 inline-block text-xl text-white underline">
          &larr; Back to Messages
        </Link>

        <h2 className="text-6xl font-bold text-white">{recruiterName}</h2>

      {/* Visually-hidden live region announces incoming messages to screen readers */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </p>

      <Card className="mt-lg flex flex-1 flex-col gap-4">
        <div
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          className="flex max-h-[300px] flex-col gap-2 overflow-y-auto"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 ${
                m.sender_id === user.id
                  ? 'ml-auto max-w-[80%] bg-primary text-white'
                  : 'mr-auto max-w-[80%] bg-slate-100'
              }`}
            >
              <p className="text-small">{m.content}</p>
              <p className="mt-1 text-caption opacity-75">
                {new Date(m.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            label=""
            aria-label="New message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </Card>
      </div>
      </div>
    </main>
  )
}
