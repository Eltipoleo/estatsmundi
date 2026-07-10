import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ CONFIGURACIÓN DE NODEMAILER (PUERTO 587 STARTTLS)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  },
  tls: {
    rejectUnauthorized: false, 
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

    // Middleman de seguridad para administradores
    const isAdmin = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Falta token de autenticación' });

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        if (decoded.role === 'administrador' || decoded.role === 'admin') {
          req.user = decoded;
          next();
        } else {
          return res.status(403).json({ error: 'Acceso denegado, requiere rol administrador' });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }
    };

    // ==========================================
    // 🔑 ENDPOINT DE REGISTRO CON ENVÍO DE TOKEN
    // ==========================================
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // 🛠️ CORRECCIÓN: Lee dinámicamente de tu variable ADMIN_EMAILS de Render
        const adminEmailSetting = process.env.ADMIN_EMAILS || 'joserty83@gmail.com';
        const role = email.toLowerCase() === adminEmailSetting.toLowerCase() ? 'administrador' : 'usuario';

        const newUser = { 
          name, 
          email: email.toLowerCase(), 
          password, 
          role, 
          emailVerified: true, 
          createdAt: new Date() 
        };
        
        const result = await db.collection('users').insertOne(newUser);

        // Generamos el Token JWT firmado para la sesión
        const token = jwt.sign(
          { id: result.insertedId, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '24h' }
        );

        // Armamos el cuerpo del correo de Google
        const mailOptions = {
          from: `"Mundial Stats 🏆" <${process.env.EMAIL_USER}>`,
          to: newUser.email, 
          subject: 'Confirmación de Cuenta - Token de Autenticación',
          html: `
            <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto; background-color: #ffffff;">
              <h2 style="color: #0b6e4f; margin-top: 0;">¡Hola, ${name}!</h2>
              <p style="color: #334155;">Tu cuenta ha sido creada con éxito en la plataforma del Mundial.</p>
              <p style="color: #334155;">Tu perfil se ha asignado con el rol de: <strong style="text-transform: uppercase; color: #0b6e4f;">${role}</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #334155;">Este es tu <strong>Token de Autenticación JWT</strong> seguro para iniciar sesión:</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; word-break: break-all; font-family: monospace; border-radius: 6px; font-size: 11px; color: #0f172a; font-weight: bold; line-height: 1.4;">
                ${token}
              </div>
            </div>
          `
        };

        // Despacho asíncrono en segundo plano
        transporter.sendMail(mailOptions)
          .then((info) => console.log("📧 CORREO DE GOOGLE ENVIADO CON ÉXITO A:", newUser.email, "ID:", info.messageId))
          .catch(emailError => {
            console.error("❌ ERROR EN EL ENVÍO DE NODEMAILER (GOOGLE):", emailError.message);
          });

        return res.status(201).json({ success: true, token, user: { name, email: newUser.email, role: newUser.role } });

      } catch (err) {
        console.error("❌ Error general en el servidor al registrar:", err);
        return res.status(500).json({ error: 'Error interno en el servidor de base de datos' });
      }
    });

    // Endpoint de Login
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) {
          return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
      } catch (err) {
        return res.status(500).json({ error: 'Error interno en la autenticación' });
      }
    });

    // ==========================================
    // 📊 RUTAS PÚBLICAS Y DE ADMINISTRACIÓN
    // ==========================================
    app.get('/api/teams', async (req, res) => {
      try { const data = await db.collection('teams').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/players', async (req, res) => {
      try { const data = await db.collection('players').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });

    app.post('/api/admin/teams', isAdmin, async (req, res) => {
      try {
        const { name, points } = req.body;
        await db.collection('teams').insertOne({ name, points: Number(points) || 0, createdAt: new Date() });
        return res.status(201).json({ success: true });
      } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });

    app.post('/api/admin/players', isAdmin, async (req, res) => {
      try {
        const { name, team, goals } = req.body;
        await db.collection('players').insertOne({ name, team, goals: Number(goals) || 0, createdAt: new Date() });
        return res.status(201).json({ success: true });
      } catch (err) { return res.status(500).json({ error: 'Error' }); }
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