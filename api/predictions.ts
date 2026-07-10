import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "./_utils/mongodb.js"
import { requireAuth } from "./_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res)
  if (!user) return

  const predictions = await getCollection("predictions")

  if (req.method === "GET") {
    const items = await predictions.find({ userId: user.uid }).toArray()
    res.status(200).json(items.map((item) => ({
      matchId: item.matchId,
      homeScore: item.homeScore,
      awayScore: item.awayScore,
      updatedAt: item.updatedAt,
    })))
    return
  }

  if (req.method === "POST") {
    const payload = req.body || {}
    const matchId = Number(payload.matchId)
    const homeScore = Number(payload.homeScore)
    const awayScore = Number(payload.awayScore)

    if (!matchId || Number.isNaN(matchId)) {
      res.status(400).json({ error: "El id del partido es obligatorio." })
      return
    }

    await predictions.updateOne(
      { userId: user.uid, matchId },
      {
        $set: {
          userId: user.uid,
          matchId,
          homeScore,
          awayScore,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    )

    const saved = await predictions.findOne({ userId: user.uid, matchId })
    res.status(200).json({
      matchId: saved?.matchId,
      homeScore: saved?.homeScore,
      awayScore: saved?.awayScore,
      updatedAt: saved?.updatedAt,
    })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
