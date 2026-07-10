import type { VercelRequest, VercelResponse } from "@vercel/node"
import { connectToDatabase } from "./_utils/mongodb"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método no permitido" })

  try {
    const db = await connectToDatabase()
    const data = await db.collection("teams").find({}).toArray() // Cambia "teams" según corresponda
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}