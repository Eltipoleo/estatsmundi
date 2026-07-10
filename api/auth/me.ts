import type { VercelRequest, VercelResponse } from "@vercel/node"
import { requireAuth } from "../_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const user = requireAuth(req, res)
  if (!user) return

  res.status(200).json({ user })
}
