import bcrypt from "bcryptjs"
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCollection } from "../_utils/mongodb.js"
import { createToken } from "../_utils/auth.js"

function resolveRole(email: string) {
  const normalized = email.toLowerCase()
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)
  return adminEmails.includes(normalized) || normalized.startsWith("admin") ? "administrador" : "usuario"
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { name, email, password } = req.body || {}

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email and password are required." })
    return
  }

  const users = await getCollection("users")
  const existing = await users.findOne({ email: String(email).toLowerCase() })
  if (existing) {
    res.status(409).json({ error: "This email is already registered." })
    return
  }

  const passwordHash = await bcrypt.hash(String(password), 10)
  const role = resolveRole(String(email))

  const result = await users.insertOne({
    name: String(name).trim(),
    email: String(email).toLowerCase(),
    passwordHash,
    role,
    emailVerified: true,
    createdAt: new Date(),
  })

  const token = createToken({ uid: String(result.insertedId), email: String(email).toLowerCase(), name: String(name).trim(), role })

  res.status(201).json({
    token,
    user: {
      uid: String(result.insertedId),
      name: String(name).trim(),
      email: String(email).toLowerCase(),
      role,
      emailVerified: true,
    },
  })
}
