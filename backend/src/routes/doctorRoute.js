import { Router } from "express";
import doctorController from "../controllers/doctorController.js";

const doctorRouter = Router();

// Crear médico
doctorRouter.post("/", doctorController.create);

// Obtener todos los médicos
doctorRouter.get("/", doctorController.getAll);

// Obtener médico por ID
doctorRouter.get("/:id", doctorController.getById);

// Obtener médico por usuario ID
doctorRouter.get("/usuario/:usuario_id", doctorController.getByUserId);

// Actualizar médico
doctorRouter.put("/:id", doctorController.update);

// Eliminar médico (soft delete)
doctorRouter.delete("/:id", doctorController.delete);

// Obtener médicos por especialidad
doctorRouter.get("/especialidad/:especialidad_id", doctorController.getBySpecialty);

// Obtener disponibilidad del médico
doctorRouter.get("/:medico_id/disponibilidad", doctorController.getAvailability);

// Obtener citas del médico
doctorRouter.get("/:medico_id/citas", doctorController.getAppointments);

// Obtener estadísticas del médico
doctorRouter.get("/:medico_id/stats", doctorController.getStats);

export default doctorRouter;