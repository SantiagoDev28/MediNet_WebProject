import app from './app.js';
import { testConnection } from '../database/connectiondb.js ';

const PORT = process.env.PORT || 3000

app.listen(PORT, async () => {
    await testConnection();
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
})

import appointmentRouter from './routes/appointmentRoute.js';
import availabilityRouter from './routes/availabilityRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import patientRouter from './routes/patientRoute.js';
import recordRouter from './routes/recordRoute.js';
import reminderRouter from './routes/reminderRoute.js';
import roleRouter from './routes/roleRoute.js';
import specialtyRouter from './routes/specialtyRoute.js';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoutes.js';

app.use('/api/citas', appointmentRouter);
app.use('/api/disponibilidad', availabilityRouter);
app.use('/api/medicos', doctorRouter);
app.use('/api/pacientes', patientRouter);
app.use('/api/recordatorios', recordRouter);
app.use('/api/pendientes', reminderRouter);
app.use('/api/roles', roleRouter);
app.use('/api/especialidades', specialtyRouter);
app.use('/api/usuarios', userRouter);
app.use('/api/auth', authRouter);