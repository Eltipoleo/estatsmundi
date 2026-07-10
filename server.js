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

// 🔒 CONFIGURACIÓN CORREGIDA SIN PARÁMETROS DUPLICADOS PARA GMAIL NATIVO
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // joserty83@gmail.com
    pass: process.env.EMAIL_PASS  // Las 16 letras consecutivas sin espacios
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

    const isAdmin = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Falta token' });
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        if (decoded.role === 'administrador' || decoded.role === 'admin') {
          req.user = decoded;
          next();
        } else { return res.status(403).json({ error: 'Denegado' }); }
      } catch (err) { return res.status(401).json({ error: 'Token inválido' }); }
    };

    // 🔑 REGISTRO EMPAREJADO CON EL FRONTEND
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
        // FRENO DE SEGURIDAD: Si el frontend manda los campos vacíos o mal mapeados
        if (!name || !email || !password) {
          return res.status(400).json({ error: 'Faltan campos obligatorios en la petición (name, email o password)' });
        }

        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const adminEmailSetting = process.env.ADMIN_EMAILS || 'joserty83@gmail.com';
        const role = email.toLowerCase() === adminEmailSetting.toLowerCase() ? 'administrador' : 'usuario';

        const newUser = { 
          name, 
          email: email.toLowerCase(), 
          password, 
          role, 
          emailVerified: false, 
          createdAt: new Date() 
        };
        
        await db.collection('users').insertOne(newUser);

        const activationToken = jwt.sign(
          { email: newUser.email },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '1h' }
        );

        const activationUrl = `https://estatsmundi.onrender.com/api/auth/verify?token=${activationToken}`;

        const mailOptions = {
          from: `"Mundial Stats 🏆" <${process.env.EMAIL_USER}>`,
          to: newUser.email, 
          subject: 'Activa tu cuenta - Mundial Stats',
          html: `
            <div style="font-family: sans-serif; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 480px; margin: 0 auto; background-color: #ffffff; text-align: center;">
              <h2>¡Hola, ${name}!</h2>
              <p>Confirma tu identidad para activar tu cuenta en la plataforma.</p>
              <div style="margin: 25px 0;">
                <a href="${activationUrl}" target="_blank" style="background-color: #0b6e4f; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Activar Mi Cuenta Aquí
                </a>
              </div>
            </div>
          `
        };

        transporter.sendMail(mailOptions)
          .then(() => console.log("📧 ENLACE ENVIADO A:", newUser.email))
          .catch(err => console.error("❌ ERROR EN GMAIL:", err.message));

        return res.status(201).json({ success: true, message: 'Revisa tu correo electrónico para activar la cuenta.' });

      } catch (err) {
        return res.status(500).json({ error: 'Error interno' });
      }
    });

    // 🔗 VERIFICACIÓN DEL LINK
    app.get('/api/auth/verify', async (req, res) => {
      const { token } = req.query;
      if (!token) return res.status(400).send('<h1>Falta el token</h1>');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        await db.collection('users').updateOne({ email: decoded.email.toLowerCase() }, { $set: { emailVerified: true } });
        return res.redirect('https://estatsmundi.vercel.app/login?activated=true');
      } catch (err) {
        return res.status(400).send('<h1>Enlace vencido o inválido</h1>');
      }
    });

    // 🔑 LOGIN CORREGIDO
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        
        if (!user || user.password !== password) {
          return res.status(400).json({ error: 'Credenciales incorrectas' });
        }

        if (user.emailVerified === false) {
          return res.status(401).json({ error: 'Tu cuenta no ha sido activada.', emailVerified: false });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
      } catch (err) { return res.status(500).json({ error: 'Error interno' }); }
    });

    app.get('/api/teams', async (req, res) => {
      try { const data = await db.collection('teams').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/players', async (req, res) => {
      try { const data = await db.collection('players').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });
    app.post('/api/admin/teams', isAdmin, async (req, res) => {
      try { const { name, points } = req.body; await db.collection('teams').insertOne({ name, points: Number(points) || 0, createdAt: new Date() }); return res.status(201).json({ success: true }); } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });
    app.post('/api/admin/players', isAdmin, async (req, res) => {
      try { const { name, team, goals } = req.body; await db.collection('players').insertOne({ name, team, goals: Number(goals) || 0, createdAt: new Date() }); return res.status(201).json({ success: true }); } catch (err) { return res.status(500).json({ error: 'Error' }); }
    });

    app.listen(PORT, () => console.log(`🚀 Backend en puerto ${PORT}`));
  } catch (error) { process.exit(1); }
}
startServer();