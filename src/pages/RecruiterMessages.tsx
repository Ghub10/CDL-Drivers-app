import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getMessageThreadsForUser,
  getMessagesBetween,
  getDriverProfiles,
  saveMessage,
  uuid,
} from '../lib/storage'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function RecruiterMessages() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const driverIdParam = params.get('driverId')
  const [threads, setThreads] = useState<string[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(driverIdParam || null)
  const [messages, setMessages] = useState<{ id: string; sender_id: string; recipient_id: string; content: string; created_at: string }[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const prevCountRef = useRef(0)

  useEffect(() => {
    if (!user) return
    setThreads(getMessageThreadsForUser(user.id))
    if (driverIdParam) setSelectedDriverId(driverIdParam)
  }, [user, driverIdParam])

  useEffect(() => {
    if (!user || !selectedDriverId) {
      setMessages([])
      prevCountRef.current = 0
      return
    }
    setMessages(getMessagesBetween(user.id, selectedDriverId))
  }, [user, selectedDriverId])

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
    if (!user || !selectedDriverId || !newMessage.trim()) return
    const msg = {
      id: uuid(),
      sender_id: user.id,
      recipient_id: selectedDriverId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
      thread_id: [user.id, selectedDriverId].sort().join('_'),
    }
    saveMessage(msg)
    setMessages((prev) => [...prev, msg])
    setNewMessage('')
  }

  if (!user) return null

  const driverName = (userId: string) => {
    const profile = getDriverProfiles().find((p) => p.user_id === userId)
    return profile?.name ?? 'Driver'
  }

  return (
    <main
      className="relative flex min-h-screen flex-col px-6 py-xl bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/messages-bg.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <h2 className="text-6xl font-bold text-white">Messages</h2>

      {/* Visually-hidden live region announces incoming messages to screen readers */}
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </p>

      <div className="mt-lg flex flex-col gap-4">
        {threads.length === 0 ? (
          <p className="text-2xl text-white text-center">No messages yet. Search for drivers and send them a message.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {threads.map((driverUserId) => (
                <button
                  key={driverUserId}
                  type="button"
                  className={`flex items-center gap-3 rounded-card border p-4 text-left ${
                    selectedDriverId === driverUserId
                      ? 'border-primary bg-primary-muted'
                      : 'border-slate-200 bg-white'
                  }`}
                  onClick={() => setSelectedDriverId(driverUserId)}
                >
                  <p className="font-medium">{driverName(driverUserId)}</p>
                </button>
              ))}
            </div>

            {selectedDriverId && (
              <Card className="mt-4">
                <div
                  role="log"
                  aria-label="Conversation"
                  aria-live="polite"
                  className="flex flex-col gap-2 max-h-[300px] overflow-y-auto"
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
                <div className="mt-4 flex gap-2">
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
            )}
          </>
        )}
      </div>
      </div>
    </main>
  )
}
