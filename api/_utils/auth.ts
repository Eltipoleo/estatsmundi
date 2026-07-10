import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET || "development-secret"
const expiresIn = "30d"

type TokenPayload = {
  uid: string
  email: string
  name: string
  role: string
}

export function createToken(payload: TokenPayload) {
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as TokenPayload
}
