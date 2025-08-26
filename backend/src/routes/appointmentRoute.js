import { Router } from "express";
import appointmentController from "../controllers/appointmentController.js";

const appointmentRouter = Router();

// Crear cita
appointmentRouter.post("/", appointmentController.create);

// Obtener todas las citas
appointmentRouter.get("/", appointmentController.getAll);

// Obtener cita por ID
appointmentRouter.get("/:id", appointmentController.getById);

// Actualizar cita
appointmentRouter.put("/:id", appointmentController.update);

// Eliminar cita (soft delete)
appointmentRouter.delete("/:id", appointmentController.delete);

// Obtener citas por fecha
appointmentRouter.get("/fecha/:fecha", appointmentController.getByDate);

// Obtener citas de hoy
appointmentRouter.get("/hoy", appointmentController.getToday);

// Obtener próximas citas
appointmentRouter.get("/upcoming", appointmentController.getUpcoming);

// Obtener estadísticas de citas
appointmentRouter.get("/stats", appointmentController.getStats);

export default appointmentRouter;