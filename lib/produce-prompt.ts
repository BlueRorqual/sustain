import type { UserLocation, DietaryPrefs } from '@/types'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const PRODUCE_SYSTEM_PROMPT = `You are a seasonal food expert who knows which fruits, vegetables, and staple crops are locally grown in different regions around the world at different times of year. You consider climate, growing seasons, and regional agricultural practices.

When asked for locally sourced produce recommendations, you return a JSON object with an "items" array. Each item has:
- name: common name of the produce
- category: one of "vegetable", "fruit", or "staple" (staple = grains, legumes, nuts)
- whyLocal: one sentence explaining why this is locally grown in the region during this period
- sustainabilityTip: one sentence of practical advice to reduce waste or environmental impact
- typicalAvailability: the months this produce is typically available (e.g. "April–July")

Return 12–16 items. Prioritize variety across categories. Account for dietary restrictions.`

export function buildProduceUserPrompt(
  location: UserLocation,
  month: number,
  dietary: DietaryPrefs
): string {
  const monthName = MONTH_NAMES[month - 1]
  const allergyText = dietary.allergies.length > 0
    ? dietary.allergies.join(', ')
    : 'none'

  return `Location: ${location.city}, ${location.region}, ${location.country}
Month: ${monthName}
Dietary restrictions: vegan: ${dietary.vegan}, gluten_free: ${dietary.glutenFree}, allergies: ${allergyText}

Please return locally sourced seasonal produce for this location and time of year, respecting the dietary restrictions.`
}
