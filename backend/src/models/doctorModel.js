import db from "../database/connectiondb.js";

class Doctor {
    
    // Crear médico
    static async create(medicoData) {
        try {
            const query = `
                INSERT INTO medicos (usuario_id, especialidad_id, medico_estado) 
                VALUES (?, ?, ?)
            `;
            const [result] = await db.executeQuery(query, [
                medicoData.usuario_id,
                medicoData.especialidad_id,
                medicoData.medico_estado || 1
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear médico: ${error.message}`);
        }
    }

    // Obtener todos los médicos
    static async getAll() {
        try {
            const query = `
                SELECT 
                    m.medico_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.medico_estado = 1 AND u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener médicos: ${error.message}`);
        }
    }

    // Obtener médico por ID
    static async getById(medico_id) {
        try {
            const query = `
                SELECT 
                    m.medico_id, m.usuario_id, m.especialidad_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion, u.usuario_direccion,
                    u.usuario_ciudad, u.usuario_edad, u.usuario_genero,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.medico_id = ? AND m.medico_estado = 1
            `;
            const [result] = await db.executeQuery(query, [medico_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener médico: ${error.message}`);
        }
    }

    // Obtener médico por usuario ID
    static async getByUserId(usuario_id) {
        try {
            const query = `
                SELECT 
                    m.medico_id, m.usuario_id, m.especialidad_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.usuario_id = ? AND m.medico_estado = 1
            `;
            const [result] = await db.executeQuery(query, [usuario_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener médico por usuario: ${error.message}`);
        }
    }

    // Actualizar médico
    static async update(medico_id, medicoData) {
        try {
            const query = `
                UPDATE medicos SET 
                    especialidad_id = ?, medico_estado = ?
                WHERE medico_id = ?
            `;
            const [result] = await db.executeQuery(query, [
                medicoData.especialidad_id,
                medicoData.medico_estado,
                medico_id
            ]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar médico: ${error.message}`);
        }
    }

    // Eliminar médico (soft delete)
    static async delete(medico_id) {
        try {
            const query = `UPDATE medicos SET medico_estado = 0 WHERE medico_id = ?`;
            const [result] = await db.executeQuery(query, [medico_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar médico: ${error.message}`);
        }
    }

    // Obtener médicos por especialidad
    static async getBySpecialty(especialidad_id) {
        try {
            const query = `
                SELECT 
                    m.medico_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion,
                    e.especialidad_nombre
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                LEFT JOIN especialidades e ON m.especialidad_id = e.especialidad_id
                WHERE m.especialidad_id = ? AND m.medico_estado = 1 AND u.usuario_estado = 1
            `;
            const [result] = await db.executeQuery(query, [especialidad_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener médicos por especialidad: ${error.message}`);
        }
    }

    // Obtener disponibilidad del médico
    static async getAvailability(medico_id, fecha = null) {
        try {
            let query = `
                SELECT * FROM disponibilidad 
                WHERE medico_id = ? AND disponibilidad_estado = 1
            `;
            let params = [medico_id];

            if (fecha) {
                query += ` AND disponibilidad_fecha = ?`;
                params.push(fecha);
            }

            query += ` ORDER BY disponibilidad_fecha, disponibilidad_hora`;
            
            const [result] = await db.executeQuery(query, params);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener disponibilidad del médico: ${error.message}`);
        }
    }

    // Obtener citas del médico
    static async getAppointments(medico_id, fecha = null) {
        try {
            let query = `
                SELECT 
                    c.cita_id, c.cita_fecha, c.cita_hora, c.cita_estado,
                    p.paciente_id,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_telefono, u.usuario_correo
                FROM citas c
                INNER JOIN pacientes p ON c.paciente_id = p.paciente_id
                INNER JOIN usuarios u ON p.usuario_id = u.usuario_id
                WHERE c.medico_id = ? AND c.cita_estado = 1
            `;
            let params = [medico_id];

            if (fecha) {
                query += ` AND c.cita_fecha = ?`;
                params.push(fecha);
            }

            query += ` ORDER BY c.cita_fecha, c.cita_hora`;
            
            const [result] = await db.executeQuery(query, params);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener citas del médico: ${error.message}`);
        }
    }

    // Obtener estadísticas del médico
    static async getStats(medico_id) {
        try {
            const queries = [
                `SELECT COUNT(*) as total_citas FROM citas WHERE medico_id = ? AND cita_estado = 1`,
                `SELECT COUNT(*) as total_pacientes FROM (SELECT DISTINCT paciente_id FROM citas WHERE medico_id = ? AND cita_estado = 1) as unique_patients`,
                `SELECT COUNT(*) as citas_hoy FROM citas WHERE medico_id = ? AND cita_fecha = CURDATE() AND cita_estado = 1`,
                `SELECT COUNT(*) as disponibilidad_hoy FROM disponibilidad WHERE medico_id = ? AND disponibilidad_fecha = CURDATE() AND disponibilidad_estado = 1`
            ];

            const results = await Promise.all(
                queries.map(query => db.executeQuery(query, [medico_id]))
            );

            return {
                total_citas: results[0][0][0].total_citas,
                total_pacientes: results[1][0][0].total_pacientes,
                citas_hoy: results[2][0][0].citas_hoy,
                disponibilidad_hoy: results[3][0][0].disponibilidad_hoy
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas del médico: ${error.message}`);
        }
    }
}

export default Doctor;