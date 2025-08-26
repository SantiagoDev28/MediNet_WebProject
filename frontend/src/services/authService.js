import api from '../api/api';

const authService = {
    // Login de usuario
    login: async (usuario_correo, usuario_contrasena) => {
        try {
            const response = await api.post(`/auth/login`, {
                usuario_correo,
                usuario_contrasena
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: "Error de conexión" };
        }
    },

    // Registro de usuario
    register: async (userData) => {
        try {
            const response = await api.post(`/auth/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: "Error de conexión" };
        }
    }
};

export default authService;