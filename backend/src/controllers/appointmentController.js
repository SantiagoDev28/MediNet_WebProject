import Appointment from "../models/appointmentModel.js";

const appointmentController = {
    // Crear cita
    async create(req, res) {
        try {
            const citaData = req.body;
            const result = await Appointment.create(citaData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todas las citas
    async getAll(req, res) {
        try {
            const result = await Appointment.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener cita por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Appointment.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Cita no encontrada" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar cita
    async update(req, res) {
        try {
            const { id } = req.params;
            const citaData = req.body;
            const result = await Appointment.update(id, citaData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar cita (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Appointment.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener citas por fecha
    async getByDate(req, res) {
        try {
            const { fecha } = req.params;
            const result = await Appointment.getByDate(fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener citas de hoy
    async getToday(req, res) {
        try {
            const result = await Appointment.getToday();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener próximas citas
    async getUpcoming(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const result = await Appointment.getUpcoming(limit);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener estadísticas de citas
    async getStats(req, res) {
        try {
            const result = await Appointment.getStats();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default appointmentController;