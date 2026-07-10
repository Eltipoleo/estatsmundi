import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "./_utils/mongodb.js"
import { requireAdmin } from "./_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const players = await getCollection("players")
  const idParam = req.query.id
  const id = typeof idParam === "string" ? Number(idParam) : Array.isArray(idParam) ? Number(idParam[0]) : undefined

  if (req.method === "GET") {
    const items = await players.find().sort({ name: 1 }).toArray()
    res.status(200).json(items)
    return
  }

  if (req.method === "POST") {
    const user = requireAdmin(req, res)
    if (!user) return

    const payload = req.body || {}
    const newPlayer = {
      id: Date.now(),
      name: String(payload.name || "").trim(),
      team: String(payload.team || "").trim(),
      position: String(payload.position || "").trim(),
      goals: Number(payload.goals || 0),
      assists: Number(payload.assists || 0),
      matches: Number(payload.matches || 0),
    }

    if (!newPlayer.name || !newPlayer.team) {
      res.status(400).json({ error: "El nombre y el equipo son obligatorios." })
      return
    }

    await players.insertOne(newPlayer)
    res.status(201).json(newPlayer)
    return
  }

  if (req.method === "PUT") {
    const user = requireAdmin(req, res)
    if (!user) return
    if (!id || Number.isNaN(id)) {
      res.status(400).json({ error: "El id del jugador es obligatorio." })
      return
    }

    const payload = req.body || {}
    const updated = {
      name: String(payload.name || "").trim(),
      team: String(payload.team || "").trim(),
      position: String(payload.position || "").trim(),
      goals: Number(payload.goals || 0),
      assists: Number(payload.assists || 0),
      matches: Number(payload.matches || 0),
    }

    await players.updateOne({ id }, { $set: updated })
    res.status(200).json({ id, ...updated })
    return
  }

  if (req.method === "DELETE") {
    const user = requireAdmin(req, res)
    if (!user) return
    if (!id || Number.isNaN(id)) {
      res.status(400).json({ error: "El id del jugador es obligatorio." })
      return
    }

    await players.deleteOne({ id })
    res.status(200).json({ success: true })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
