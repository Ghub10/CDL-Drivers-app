import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import {
  getMessageThreadsForUser,
  getMessagesBetween,
  getRecruiterProfileByUserId,
  getUserById,
} from '../lib/storage'
import type { Message } from '../types'

export function DriverMessages() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [threads, setThreads] = useState<{ userId: string; name: string; lastMessage: Message }[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'driver') {
      navigate('/')
      return
    }
    const threadIds = getMessageThreadsForUser(user.id)
    const list = threadIds.map((recipientId) => {
      const recruiter = getRecruiterProfileByUserId(recipientId)
      const fallbackUser = getUserById(recipientId)
      const name = recruiter
        ? `${recruiter.name} - ${recruiter.company_name}`
        : fallbackUser?.email ?? 'Recruiter'
      const messages = getMessagesBetween(user.id, recipientId)
      const lastMessage = messages[messages.length - 1]
      return { userId: recipientId, name, lastMessage }
    })
    list.sort((a, b) =>
      !a.lastMessage ? 1 : !b.lastMessage ? -1 : new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    )
    setThreads(list)
  }, [user, navigate])

  if (!user) return null

  return (
    <main
      className="relative flex min-h-screen flex-col px-6 py-xl bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/messages-bg.png')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full justify-center max-w-2xl">
        <h2 className="text-6xl font-bold text-white">Messages</h2>
      </div>
      <div className="mt-lg flex flex-col gap-4 max-w-2xl">
        {threads.length === 0 ? (
          <p className="py-2xl px-xl text-center text-white text-2xl">
            No messages yet. Recruiters will message you when they find your profile.
          </p>
        ) : (
          threads.map((t) => (
            <Link key={t.userId} to={`/driver/messages/${t.userId}`}>
              <Card className="flex flex-col gap-1">
                <p className="font-medium">{t.name}</p>
                {t.lastMessage && (
                  <p className="text-small text-text-secondary line-clamp-2">
                    {t.lastMessage.sender_id === user.id ? 'You: ' : ''}
                    {t.lastMessage.content}
                  </p>
                )}
                {t.lastMessage && (
                  <p className="text-caption text-text-secondary">
                    {formatTime(t.lastMessage.created_at)}
                  </p>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
      </div>
    </main>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString()
}
