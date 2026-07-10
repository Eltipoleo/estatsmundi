import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017');
let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB || 'mundial-stats');
    console.log('✅ Conectado a MongoDB local con éxito');

    // Rutas adaptadas a MongoDB
    app.get('/api/teams', async (req, res) => {
      try {
        const teams = await db.collection('teams').find({}).toArray();
        res.json(teams);
      } catch (err) {
        res.status(500).json({ error: 'Error al obtener equipos de Mongo' });
      }
    });

    app.get('/api/matches', async (req, res) => {
      try {
        const matches = await db.collection('matches').find({}).toArray();
        res.json(matches);
      } catch (err) {
        res.status(500).json({ error: 'Error al obtener partidos de Mongo' });
      }
    });

    app.get('/api/players', async (req, res) => {
      try {
        const players = await db.collection('players').find({}).toArray();
        res.json(players);
      } catch (err) {
        res.status(500).json({ error: 'Error al obtener jugadores de Mongo' });
      }
    });

    app.post('/api/predictions', async (req, res) => {
      try {
        const prediction = req.body;
        await db.collection('predictions').updateOne(
          { userId: prediction.userId, matchId: prediction.matchId },
          { $set: prediction },
          { upsert: true }
        );
        res.json({ success: true, message: 'Predicción guardada en MongoDB' });
      } catch (err) {
        res.status(500).json({ error: 'Error al guardar predicción' });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error crítico al conectar a MongoDB:', error);
    process.exit(1);
  }
}

startServer();