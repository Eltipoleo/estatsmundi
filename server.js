import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ CONFIGURACIÓN PARA GMAIL CON PUERTO 587 (TLS EXPLÍCITO) PARA EVITAR TIMEOUTS EN RENDER
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false para puerto 587 (usa STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Evita bloqueos por certificados de red en la nube
    minVersion: 'TLSv1.2'
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: process.env.MONGODB_DB ? 'configured' : 'using default' });
});

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'mundial-stats');
    console.log('✅ Conectado a MongoDB Atlas con éxito');

    // 1. Endpoint de Registro Abierto a Cualquier Correo (Google)
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
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
          to: newUser.email, // Enviará a cualquier correo ingresado en el formulario
          subject: 'Confirmación de Cuenta - Token de Autenticación',
          html: `
            <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
              <h2 style="color: #0b6e4f; margin-top: 0;">¡Hola, ${name}!</h2>
              <p>Tu cuenta ha sido creada con éxito en la plataforma del Mundial.</p>
              <p>Tu perfil se ha asignado con el rol de: <strong style="text-transform: uppercase; color: #0b6e4f;">${role}</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p>Este es tu <strong>Token de Autenticación JWT</strong> seguro para iniciar sesión:</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; word-break: break-all; font-family: monospace; border-radius: 6px; font-size: 11px; color: #334155;">
                ${token}
              </div>
            </div>
          `
        };

        // Despacho asíncrono en segundo plano para que el frontend no se congele jamás
        transporter.sendMail(mailOptions)
          .then((info) => console.log("📧 CORREO DE GOOGLE ENVIADO CON ÉXITO A:", newUser.email, "ID:", info.messageId))
          .catch(emailError => {
            console.error("❌ ERROR EN EL ENVÍO DE NODEMAILER (GOOGLE):", emailError.message);
          });

        return res.status(201).json({ success: true, token, user: { name, email: newUser.email, role: newUser.role } });

      } catch (err) {
        console.error("❌ Error en el servidor al registrar:", err);
        return res.status(500).json({ error: 'Error interno al registrar el usuario en MongoDB' });
      }
    });

    // 2. Endpoint de Login
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) {
          return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '24h' }
        );

        return res.json({ 
          success: true, 
          token, 
          user: { name: user.name, email: user.email, role: user.role } 
        });
      } catch (err) {
        return res.status(500).json({ error: 'Error interno en el servidor de autenticación' });
      }
    });

    // Endpoints de datos comunes
    app.get('/api/teams', async (req, res) => {
      try { const teams = await db.collection('teams').find({}).toArray(); return res.json(teams); } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/matches', async (req, res) => {
      try { const matches = await db.collection('matches').find({}).toArray(); return res.json(matches); } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/players', async (req, res) => {
      try { const players = await db.collection('players').find({}).toArray(); return res.json(players); } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico de arranque:', error);
    process.exit(1);
  }
}

startServer();