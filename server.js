import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

    // 🔑 REGISTRO AUTOMÁTICO CON TOKEN EN PANTALLA
    app.post('/api/auth/register', async (req, res) => {
      try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
          return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const userExists = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (userExists) {
          return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const adminEmailSetting = process.env.ADMIN_EMAILS || 'joserty83@gmail.com';
        const role = email.toLowerCase() === adminEmailSetting.toLowerCase() ? 'administrador' : 'usuario';

        // 🛡️ Guardamos la cuenta activa directamente para que no se bloquee el Login
        const newUser = { 
          name, 
          email: email.toLowerCase(), 
          password, 
          role, 
          emailVerified: true, 
          createdAt: new Date() 
        };
        
        await db.collection('users').insertOne(newUser);

        const token = jwt.sign(
          { email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET || 'secret_fallback',
          { expiresIn: '24h' }
        );

        // Devolvemos el éxito inmediato con el token para la interfaz
        return res.status(201).json({ 
          success: true, 
          message: '🏆 ¡Cuenta creada y activada con éxito!',
          token: token
        });

      } catch (err) {
        return res.status(500).json({ error: 'Error interno' });
      }
    });

    // 🔑 LOGIN
    app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email: email.toLowerCase() });
        
        if (!user || user.password !== password) {
          return res.status(400).json({ error: 'Credenciales incorrectas' });
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