import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/produce/route'

// Mock the ai package — generateText + Output
vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn(() => ({ type: 'object' })),
  },
}))

const mockItems = [
  { name: 'Asparagus', category: 'vegetable', inSeason: true, localSource: 'Green Farm', seasonalNote: 'Peak spring' },
  { name: 'Strawberries', category: 'fruit', inSeason: true, localSource: 'Berry Fields', seasonalNote: 'Just started' },
]

const validBody = {
  location: { city: 'Portland', region: 'Oregon', country: 'US' },
  month: 4,
  dietary: { vegan: false, glutenFree: false, allergies: [] },
}

describe('POST /api/produce', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns produce items on success', async () => {
    const { generateText } = await import('ai')
    vi.mocked(generateText).mockResolvedValueOnce({
      output: { items: mockItems },
    } as any)

    const req = new Request('http://localhost/api/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.items).toHaveLength(2)
    expect(data.items[0].name).toBe('Asparagus')
  })

  it('returns 400 for invalid request body', async () => {
    const req = new Request('http://localhost/api/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: {}, month: 99 }), // invalid month
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 500 when generateText throws', async () => {
    const { generateText } = await import('ai')
    vi.mocked(generateText).mockRejectedValueOnce(new Error('Gateway error'))

    const req = new Request('http://localhost/api/produce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
