import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { GET } from '@/app/api/markets/route'

const USDA_BASE = 'https://www.usda.gov/sites/default/files/documents'

const server = setupServer(
  http.get(`${USDA_BASE}/locSearch`, () => {
    return HttpResponse.json({
      results: [
        { id: '1', marketname: 'Portland Farmers Market', city: 'Portland', state: 'OR', x: '-122.676', y: '45.523' },
        { id: '2', marketname: 'PSU Farmers Market', city: 'Portland', state: 'OR', x: '-122.682', y: '45.512' },
      ],
    })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GET /api/markets', () => {
  it('returns markets from USDA', async () => {
    const req = new Request('http://localhost/api/markets?lat=45.523&lng=-122.676')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveProperty('markets')
  })

  it('returns 400 when lat/lng are non-numeric', async () => {
    const req = new Request('http://localhost/api/markets?lat=abc&lng=xyz')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns empty markets array when USDA fails', async () => {
    server.use(
      http.get(`${USDA_BASE}/locSearch`, () => HttpResponse.error())
    )

    const req = new Request('http://localhost/api/markets?lat=45.523&lng=-122.676')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.markets).toEqual([])
  })
})
