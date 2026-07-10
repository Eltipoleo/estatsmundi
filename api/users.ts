import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "./_utils/mongodb.js"
import { requireAdmin } from "./_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req, res)
  if (!user) return

  const users = await getCollection("users")
  const idParam = req.query.id
  const uid = typeof idParam === "string" ? idParam : Array.isArray(idParam) ? idParam[0] : undefined

  if (req.method === "GET") {
    const items = await users.find().sort({ email: 1 }).toArray()
    res.status(200).json(items.map((item) => ({
      uid: String(item.uid || item._id),
      name: item.name,
      email: item.email,
      role: item.role,
      emailVerified: Boolean(item.emailVerified),
    })))
    return
  }

  if (req.method === "PUT") {
    if (!uid) {
      res.status(400).json({ error: "User id is required." })
      return
    }

    const payload = req.body || {}
    const nextRole = payload.role === "administrador" ? "administrador" : "usuario"
    await users.updateOne({ uid }, { $set: { role: nextRole } })
    res.status(200).json({ uid, role: nextRole })
    return
  }

  res.status(405).json({ error: "Method not allowed" })
}
