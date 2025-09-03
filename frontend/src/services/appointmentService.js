import api from "../api/api";

const appointmentService = {
  // Obtener todas las citas del doctor
  getAppointments: async () => {
    try {
      const response = await api.get("/citas");
      return response.data;
    } catch (error) {
      // Si hay error, devolver datos de ejemplo para desarrollo
      console.warn("Error obteniendo citas, usando datos de ejemplo:", error);
      return [
        {
          cita_id: 1,
          cita_fecha: "2024-01-15",
          cita_hora: "08:00:00",
          cita_estado: 1,
          paciente: {
            usuario: {
              usuario_nombre: "Juan",
              usuario_apellido: "Pérez",
            },
          },
        },
        {
          cita_id: 2,
          cita_fecha: "2024-01-15",
          cita_hora: "09:00:00",
          cita_estado: 0,
          paciente: {
            usuario: {
              usuario_nombre: "María",
              usuario_apellido: "García",
            },
          },
        },
      ];
    }
  },

  // Crear una nueva cita
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post("/citas", appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al crear la cita" };
    }
  },

  // Actualizar una cita existente
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await api.put(
        `/citas/${appointmentId}`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al actualizar la cita" };
    }
  },

  // Eliminar una cita
  deleteAppointment: async (appointmentId) => {
    try {
      const response = await api.delete(`/citas/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error al eliminar la cita" };
    }
  },

  // Obtener citas por fecha
  getAppointmentsByDate: async (date) => {
    try {
      const response = await api.get(`/citas/fecha/${date}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          error: "Error al obtener las citas por fecha",
        }
      );
    }
  },

  // Obtener citas por estado
  getAppointmentsByStatus: async (status) => {
    try {
      const response = await api.get(`/citas/estado/${status}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          error: "Error al obtener las citas por estado",
        }
      );
    }
  },

  // Cambiar estado de una cita
  changeAppointmentStatus: async (appointmentId, newStatus) => {
    try {
      const response = await api.patch(`/citas/${appointmentId}/estado`, {
        estado: newStatus,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          error: "Error al cambiar el estado de la cita",
        }
      );
    }
  },

  // Obtener estadísticas de citas
  getAppointmentStats: async (period = "week") => {
    try {
      const response = await api.get(`/citas/estadisticas?periodo=${period}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { error: "Error al obtener las estadísticas" }
      );
    }
  },
};

export default appointmentService;
