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

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'mundial-stats');
    console.log('✅ Conectado a MongoDB Atlas con éxito');

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
          return res.status(403).json({ error: 'Acceso denegado' });
        }
      } catch (err) { return res.status(401).json({ error: 'Token inválido' }); }
    };

    // =================================================
    // 🔑 ENDPOINT DE REGISTRO (MANDA LINK DE ACTIVACIÓN)
    // =================================================
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const adminEmailSetting = process.env.ADMIN_EMAILS || 'joserty83@gmail.com';
        const role = email.toLowerCase() === adminEmailSetting.toLowerCase() ? 'administrador' : 'usuario';

        // 🛡️ IMPORTANTE: Se guarda inicialmente desactivado (false)
        const newUser = { 
          name, 
          email: email.toLowerCase(), 
          password, 
          role, 
          emailVerified: false, 
          createdAt: new Date() 
        };
        
        await db.collection('users').insertOne(newUser);

        // Generamos un token específico para la activación (expira en 1 hora)
        const activationToken = jwt.sign(
          { email: newUser.email },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '1h' }
        );

        // URL que apuntará al backend para procesar la verificación
        const activationUrl = `https://estatsmundi.onrender.com/api/auth/verify?token=${activationToken}`;

        const mailOptions = {
          from: `"Mundial Stats 🏆" <${process.env.EMAIL_USER}>`,
          to: newUser.email, 
          subject: 'Activa tu cuenta - Mundial Stats',
          html: `
            <div style="font-family: sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 480px; margin: 0 auto; background-color: #ffffff; text-align: center;">
              <h2 style="color: #0b6e4f; margin-top: 0;">¡Hola, ${name}!</h2>
              <p style="color: #475569; font-size: 15px;">Gracias por registrarte. Para poder iniciar sesión en la plataforma de estadísticas, es necesario que confirmes tu identidad.</p>
              <div style="margin: 25px 0;">
                <a href="${activationUrl}" target="_blank" style="background-color: #0b6e4f; color: #ffffff; padding: 12px 24px; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Activar Mi Cuenta Aquí
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 11px;">Este enlace de seguridad expirará en 1 hora.</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions)
          .then(() => console.log("📧 ENLACE DE ACTIVACIÓN ENVIADO A:", newUser.email))
          .catch(err => console.error("❌ Error de envío:", err.message));

        // Le avisamos al frontend que revise su buzón de entrada
        return res.status(201).json({ success: true, message: 'Registro previo completado. Por favor, revisa tu correo electrónico para activar la cuenta.' });

      } catch (err) {
        return res.status(500).json({ error: 'Error interno en el servidor' });
      }
    });

    // ==========================================
    // 🔗 ENDPOINT DE PROCESAMIENTO DEL CLIC (GET)
    // ==========================================
    app.get('/api/auth/verify', async (req, res) => {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).send('<h1>Error: Falta el token de activación</h1>');
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        
        // Buscamos al usuario y cambiamos su estado a true
        const result = await db.collection('users').updateOne(
          { email: decoded.email.toLowerCase() },
          { $set: { emailVerified: true } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send('<h1>Error: El usuario no existe</h1>');
        }

        // Redirección directa al login del frontend informando el éxito
        return res.redirect('https://estatsmundi.vercel.app/login?activated=true');

      } catch (err) {
        return res.status(400).send('<h1>El enlace de activación es inválido o ha expirado. Por favor regístrate de nuevo.</h1>');
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

        // 🛡️ Bloqueo preventivo en login si no se ha verificado el correo
        if (user.emailVerified === false) {
          return res.status(401).json({ error: 'Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.', emailVerified: false });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified } });
      } catch (err) { return res.status(500).json({ error: 'Error interno' }); }
    });

    // --- MANTENIMIENTO DE RUTAS PÚBLICAS Y DE ADMIN ---
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

    app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`));
  } catch (error) { process.exit(1); }
}

startServer();