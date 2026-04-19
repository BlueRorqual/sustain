export type DietaryPrefs = {
  vegan: boolean
  glutenFree: boolean
  allergies: string[]
}

export type UserLocation = {
  city: string
  region: string
  country: string
  coords?: { lat: number; lng: number }
}

export type UserPrefs = {
  id: 'singleton'
  location: UserLocation
  dietary: DietaryPrefs
  updatedAt: number
}

export type GroceryItem = {
  id: string
  name: string
  category: 'vegetable' | 'fruit' | 'staple'
  localSource: string
  checked: boolean
  quantity: number
  unit: string
}

export type GroceryList = {
  id: string
  name: string
  items: GroceryItem[]
  status: 'draft' | 'shopping' | 'done'
  createdAt: number
  updatedAt: number
}

export type NutritionData = {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  vitamins: { name: string; amount: number; unit: string }[]
}

export type RecipeIngredient = {
  name: string
  quantity: number
  unit: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  groceryListId: string
  ingredients: RecipeIngredient[]
  instructions: string
  nutrition?: NutritionData
  servings: number
  prepTime: number
  cookTime: number
  dietaryTags: string[]
  createdAt: number
}

export type ProduceItem = {
  name: string
  category: 'vegetable' | 'fruit' | 'staple'
  whyLocal: string
  sustainabilityTip: string
  typicalAvailability: string
  localSource?: string
}

export type SeasonalProduceCache = {
  id: string
  region: string
  month: number
  items: ProduceItem[]
  fetchedAt: number
}

export type FarmersMarket = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  schedule?: string
}
