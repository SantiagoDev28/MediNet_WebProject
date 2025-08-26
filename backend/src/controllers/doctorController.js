import Doctor from "../models/doctorModel.js";

const doctorController = {
    // Crear médico
    async create(req, res) {
        try {
            const medicoData = req.body;
            const result = await Doctor.create(medicoData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todos los médicos
    async getAll(req, res) {
        try {
            const result = await Doctor.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener médico por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Doctor.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Médico no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener médico por usuario ID
    async getByUserId(req, res) {
        try {
            const { usuario_id } = req.params;
            const result = await Doctor.getByUserId(usuario_id);
            if (!result) {
                return res.status(404).json({ error: "Médico no encontrado" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar médico
    async update(req, res) {
        try {
            const { id } = req.params;
            const medicoData = req.body;
            const result = await Doctor.update(id, medicoData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar médico (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Doctor.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener médicos por especialidad
    async getBySpecialty(req, res) {
        try {
            const { especialidad_id } = req.params;
            const result = await Doctor.getBySpecialty(especialidad_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener disponibilidad del médico
    async getAvailability(req, res) {
        try {
            const { medico_id } = req.params;
            const { fecha } = req.query;
            const result = await Doctor.getAvailability(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener citas del médico
    async getAppointments(req, res) {
        try {
            const { medico_id } = req.params;
            const { fecha } = req.query;
            const result = await Doctor.getAppointments(medico_id, fecha);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener estadísticas del médico
    async getStats(req, res) {
        try {
            const { medico_id } = req.params;
            const result = await Doctor.getStats(medico_id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

export default doctorController;