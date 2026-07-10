import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(451).json({ error: 'Método no permitido' });
  }

  try {
    const { name, email, password } = req.body;
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'mundial-stats');

    const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const role = email.toLowerCase() === 'joserty83@gmail.com' ? 'administrador' : 'usuario';

    const newUser = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      emailVerified: true,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'secret_fallback',
      { expiresIn: '24h' }
    );

    const mailOptions = {
      from: `"Mundial Stats 🏆" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: 'Confirmación de Cuenta - Token de Autenticación',
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #0b6e4f; margin-top: 0;">¡Hola, ${name}!</h2>
          <p>Tu cuenta ha sido creada con éxito en la plataforma del Mundial.</p>
          <p>Tu perfil se ha asignado con el rol de: <strong style="text-transform: uppercase; color: #0b6e4f;">${role}</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Este es tu <strong>Token de Autenticación JWT</strong> seguro para iniciar tus sesiones:</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; word-break: break-all; font-family: monospace; border-radius: 6px; font-size: 11px; color: #334155;">
            ${token}
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ success: true, token, user: { name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar el usuario en MongoDB' });
  } finally {
    await client.close();
  }
}