import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { groceryLists: true, recipes: true, prefs: true },
    })

    if (!user) return NextResponse.json({ lists: [], recipes: [], prefs: null })

    return NextResponse.json({
      lists: user.groceryLists,
      recipes: user.recipes,
      prefs: user.prefs,
    })
  } catch (error) {
    console.error('[api/sync GET]', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { lists, recipes, prefs } = await req.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toAny = (v: unknown) => v as any

    await prisma.$transaction([
      ...lists.map((list: { id: string }) =>
        prisma.groceryList.upsert({
          where: { id: list.id },
          update: toAny({ ...list, userId: user.id }),
          create: toAny({ ...list, userId: user.id }),
        })
      ),
      ...recipes.map((recipe: { id: string }) =>
        prisma.recipe.upsert({
          where: { id: recipe.id },
          update: toAny({ ...recipe, userId: user.id }),
          create: toAny({ ...recipe, userId: user.id }),
        })
      ),
      ...(prefs
        ? [prisma.userPrefs.upsert({
            where: { userId: user.id },
            update: toAny({ ...prefs, userId: user.id }),
            create: toAny({ ...prefs, userId: user.id }),
          })]
        : []),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/sync POST]', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
