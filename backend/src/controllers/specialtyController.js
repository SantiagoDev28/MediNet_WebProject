import Specialty from "../models/specialtyModel.js";

const specialtyController = {
    // Crear especialidad
    async create(req, res) {
        try {
            const especialidadData = req.body;
            const result = await Specialty.create(especialidadData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener todas las especialidades
    async getAll(req, res) {
        try {
            const result = await Specialty.getAll();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener especialidad por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const result = await Specialty.getById(id);
            if (!result) {
                return res.status(404).json({ error: "Especialidad no encontrada" });
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar especialidad
    async update(req, res) {
        try {
            const { id } = req.params;
            const especialidadData = req.body;
            const result = await Specialty.update(id, especialidadData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar especialidad
    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Specialty.delete(id);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Obtener médicos por especialidad
    async getMedicosByEspecialidad(req, res) {
        try {
            const { id } = req.params;
            const result = await Specialty.getMedicosByEspecialidad(id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Buscar especialidades por nombre
    async search(req, res) {
        try {
            const { term } = req.query;
            const result = await Specialty.search(term);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener especialidades con disponibilidad
    async getWithAvailability(req, res) {
        try {
            const result = await Specialty.getWithAvailability();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener estadísticas por especialidad
    async getStats(req, res) {
        try {
            const { id } = req.query;
            const result = await Specialty.getStats(id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Verificar si una especialidad existe por nombre
    async existsByName(req, res) {
        try {
            const { nombre, id } = req.query;
            const exists = await Specialty.existsByName(nombre, id);
            res.json({ exists });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default specialtyController;