import { describe, it, expect } from 'vitest'
import { buildProduceUserPrompt, PRODUCE_SYSTEM_PROMPT } from '@/lib/produce-prompt'

describe('buildProduceUserPrompt', () => {
  it('includes location and month', () => {
    const prompt = buildProduceUserPrompt(
      { city: 'Portland', region: 'Oregon', country: 'USA' },
      4,
      { vegan: true, glutenFree: false, allergies: [] }
    )
    expect(prompt).toContain('Portland')
    expect(prompt).toContain('Oregon')
    expect(prompt).toContain('April')
    expect(prompt).toContain('vegan: true')
  })

  it('includes allergies when present', () => {
    const prompt = buildProduceUserPrompt(
      { city: 'Austin', region: 'Texas', country: 'USA' },
      7,
      { vegan: false, glutenFree: true, allergies: ['nuts', 'soy'] }
    )
    expect(prompt).toContain('nuts, soy')
  })
})

describe('PRODUCE_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof PRODUCE_SYSTEM_PROMPT).toBe('string')
    expect(PRODUCE_SYSTEM_PROMPT.length).toBeGreaterThan(100)
  })
})
