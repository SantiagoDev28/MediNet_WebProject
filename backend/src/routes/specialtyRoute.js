import { Router } from "express";
import specialtyController from "../controllers/specialtyController.js";

const specialtyRouter = Router();

// Crear especialidad
specialtyRouter.post("/", specialtyController.create);

// Obtener todas las especialidades
specialtyRouter.get("/", specialtyController.getAll);

// Obtener especialidad por ID
specialtyRouter.get("/:id", specialtyController.getById);

// Actualizar especialidad
specialtyRouter.put("/:id", specialtyController.update);

// Eliminar especialidad
specialtyRouter.delete("/:id", specialtyController.delete);

// Obtener médicos por especialidad
specialtyRouter.get("/:id/medicos", specialtyController.getMedicosByEspecialidad);

// Buscar especialidades por nombre
specialtyRouter.get("/search", specialtyController.search);

// Obtener especialidades con disponibilidad
specialtyRouter.get("/with-availability", specialtyController.getWithAvailability);

// Obtener estadísticas por especialidad
specialtyRouter.get("/stats", specialtyController.getStats);

// Verificar si una especialidad existe por nombre
specialtyRouter.get("/exists", specialtyController.existsByName);

export default specialtyRouter;