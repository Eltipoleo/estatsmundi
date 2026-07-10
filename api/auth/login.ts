import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(451).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'mundial-stats');

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno en el servidor de autenticación' });
  } finally {
    await client.close();
  }
}