import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from '../database/connectiondb.js/';

dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
    await testConnection();
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
})