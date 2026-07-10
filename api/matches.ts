import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "./_utils/mongodb.js"
import { requireAdmin } from "./_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const matches = await getCollection("matches")
  const idParam = req.query.id
  const id = typeof idParam === "string" ? Number(idParam) : Array.isArray(idParam) ? Number(idParam[0]) : undefined

  if (req.method === "GET") {
    const items = await matches.find().sort({ date: 1 }).toArray()
    res.status(200).json(items)
    return
  }

  if (req.method === "POST") {
    const user = requireAdmin(req, res)
    if (!user) return

    const payload = req.body || {}
    const newMatch = {
      id: Date.now(),
      home: String(payload.home || "").trim(),
      away: String(payload.away || "").trim(),
      homeScore: payload.homeScore != null ? Number(payload.homeScore) : null,
      awayScore: payload.awayScore != null ? Number(payload.awayScore) : null,
      date: String(payload.date || new Date().toISOString().slice(0, 10)),
      stage: String(payload.stage || "Fase de grupos").trim(),
      status: payload.homeScore != null && payload.awayScore != null ? "Finalizado" : "Programado",
    }

    if (!newMatch.home || !newMatch.away) {
      res.status(400).json({ error: "Los equipos local y visitante son obligatorios." })
      return
    }

    await matches.insertOne(newMatch)
    res.status(201).json(newMatch)
    return
  }

  if (req.method === "PUT") {
    const user = requireAdmin(req, res)
    if (!user) return
    if (!id || Number.isNaN(id)) {
      res.status(400).json({ error: "El id del partido es obligatorio." })
      return
    }

    const payload = req.body || {}
    const updated = {
      home: String(payload.home || "").trim(),
      away: String(payload.away || "").trim(),
      homeScore: payload.homeScore != null ? Number(payload.homeScore) : null,
      awayScore: payload.awayScore != null ? Number(payload.awayScore) : null,
      date: String(payload.date || new Date().toISOString().slice(0, 10)),
      stage: String(payload.stage || "Fase de grupos").trim(),
      status: payload.homeScore != null && payload.awayScore != null ? "Finalizado" : "Programado",
    }

    await matches.updateOne({ id }, { $set: updated })
    res.status(200).json({ id, ...updated })
    return
  }

  if (req.method === "DELETE") {
    const user = requireAdmin(req, res)
    if (!user) return
    if (!id || Number.isNaN(id)) {
      res.status(400).json({ error: "El id del partido es obligatorio." })
      return
    }

    await matches.deleteOne({ id })
    res.status(200).json({ success: true })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
