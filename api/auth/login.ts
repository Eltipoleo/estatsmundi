import bcrypt from "bcryptjs"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "../_utils/mongodb.js"
import { createToken } from "../_utils/auth.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." })
    return
  }

  const users = await getCollection("users")
  const user = await users.findOne({ email: String(email).toLowerCase() })

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Email or password incorrect." })
    return
  }

  const valid = await bcrypt.compare(String(password), user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Email or password incorrect." })
    return
  }

  const token = createToken({ uid: String(user._id), email: user.email, name: user.name, role: user.role })
  res.status(200).json({
    token,
    user: {
      uid: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: Boolean(user.emailVerified),
    },
  })
}
