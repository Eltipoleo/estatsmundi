import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb'; // Importamos ObjectId para poder buscar/eliminar por ID
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configuración de Nodemailer (Mantenida intacta en puerto 587 por si la reactivas después)
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

    // ==========================================
    // MIDDLEWARE DE PROTECCIÓN (Solo para Admin)
    // ==========================================
    const isAdmin = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No autorizado, falta token' });

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
        if (decoded.role === 'administrador' || decoded.role === 'admin') {
          req.user = decoded;
          next();
        } else {
          return res.status(403).json({ error: 'Acceso denegado, no eres administrador' });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }
    };

    // ==========================================
    // ENDPOINTS DE AUTENTICACIÓN
    // ==========================================

    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) return res.status(400).json({ error: 'El correo ya está registrado' });

        const role = email.toLowerCase() === 'joserty83@gmail.com' ? 'administrador' : 'usuario';
        const newUser = { name, email: email.toLowerCase(), password, role, emailVerified: true, createdAt: new Date() };
        const result = await db.collection('users').insertOne(newUser);

        const token = jwt.sign(
          { id: result.insertedId, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '24h' }
        );

        // Envío de correo asíncrono
        const mailOptions = {
          from: `"Mundial Stats 🏆" <${process.env.EMAIL_USER}>`,
          to: newUser.email,
          subject: 'Confirmación de Cuenta',
          html: `<p>¡Hola ${name}! Tu cuenta se creó con el rol de ${role}.</p>`
        };
        transporter.sendMail(mailOptions).catch(() => {});

        return res.status(201).json({ success: true, token, user: { name, email: newUser.email, role: newUser.role } });
      } catch (err) {
        return res.status(500).json({ error: 'Error al registrar' });
      }
    });

    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (!user || user.password !== password) return res.status(400).json({ error: 'Credenciales incorrectas' });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '24h' });
        return res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
      } catch (err) {
        return res.status(500).json({ error: 'Error al loguear' });
      }
    });

    // ==========================================
    // 📊 RUTAS PÚBLICAS (Visibles para cualquier usuario)
    // ==========================================
    app.get('/api/teams', async (req, res) => {
      try { const data = await db.collection('teams').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/players', async (req, res) => {
      try { const data = await db.collection('players').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });
    app.get('/api/matches', async (req, res) => {
      try { const data = await db.collection('matches').find({}).toArray(); return res.json(data); } catch (e) { return res.status(500).json({ error: 'Error' }); }
    });

    // ==========================================
    // 🛠️ RUTAS DE ADMINISTRACIÓN (Protegidas con isAdmin)
    // ==========================================

    // --- CRUD EQUIPOS ---
    app.post('/api/admin/teams', isAdmin, async (req, res) => {
      try {
        const { name, points, logo } = req.body;
        const newTeam = { name, points: Number(points) || 0, logo: logo || '', createdAt: new Date() };
        await db.collection('teams').insertOne(newTeam);
        return res.status(201).json({ success: true, message: 'Equipo agregado con éxito' });
      } catch (err) { return res.status(500).json({ error: 'Error al agregar equipo' }); }
    });

    app.delete('/api/admin/teams/:id', isAdmin, async (req, res) => {
      try {
        await db.collection('teams').deleteOne({ _id: new ObjectId(req.params.id) });
        return res.json({ success: true, message: 'Equipo eliminado' });
      } catch (err) { return res.status(500).json({ error: 'Error al eliminar equipo' }); }
    });

    // --- CRUD JUGADORES (Goleadores) ---
    app.post('/api/admin/players', isAdmin, async (req, res) => {
      try {
        const { name, team, goals, photo } = req.body;
        const newPlayer = { name, team, goals: Number(goals) || 0, photo: photo || '', createdAt: new Date() };
        await db.collection('players').insertOne(newPlayer);
        return res.status(201).json({ success: true, message: 'Jugador agregado con éxito' });
      } catch (err) { return res.status(500).json({ error: 'Error al agregar jugador' }); }
    });

    app.delete('/api/admin/players/:id', isAdmin, async (req, res) => {
      try {
        await db.collection('players').deleteOne({ _id: new ObjectId(req.params.id) });
        return res.json({ success: true, message: 'Jugador eliminado' });
      } catch (err) { return res.status(500).json({ error: 'Error al eliminar jugador' }); }
    });

    // --- CRUD PARTIDOS ---
    app.post('/api/admin/matches', isAdmin, async (req, res) => {
      try {
        const { homeTeam, awayTeam, homeScore, awayScore, status } = req.body;
        const newMatch = { 
          homeTeam, awayTeam, 
          homeScore: Number(homeScore) || 0, 
          awayScore: Number(awayScore) || 0, 
          status: status || 'scheduled',
          createdAt: new Date() 
        };
        await db.collection('matches').insertOne(newMatch);
        return res.status(201).json({ success: true, message: 'Partido guardado con éxito' });
      } catch (err) { return res.status(500).json({ error: 'Error al agregar partido' }); }
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