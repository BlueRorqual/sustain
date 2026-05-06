import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/sync/route'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock auth options (avoid importing prisma during tests)
vi.mock('@/lib/auth', () => ({ authOptions: {} }))

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    groceryList: {
      upsert: vi.fn(),
    },
    recipe: {
      upsert: vi.fn(),
    },
    userPrefs: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

const mockUser = { id: 'user-1', email: 'test@example.com' }

describe('GET /api/sync', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns empty data when user not found', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any)

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toEqual({ lists: [], recipes: [], prefs: null })
  })

  it('returns user data when found', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any)

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      ...mockUser,
      groceryLists: [{ id: 'list-1' }],
      recipes: [],
      prefs: null,
    } as any)

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.lists).toHaveLength(1)
  })
})

describe('POST /api/sync', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce(null)

    const req = new Request('http://localhost/api/sync', {
      method: 'POST',
      body: JSON.stringify({ lists: [], recipes: [], prefs: null }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not found', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any)

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null)

    const req = new Request('http://localhost/api/sync', {
      method: 'POST',
      body: JSON.stringify({ lists: [], recipes: [], prefs: null }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('upserts data and returns ok', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any)

    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any)
    vi.mocked(prisma.$transaction).mockResolvedValueOnce([])

    const req = new Request('http://localhost/api/sync', {
      method: 'POST',
      body: JSON.stringify({ lists: [{ id: 'list-1' }], recipes: [], prefs: null }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })
})
