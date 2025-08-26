import db from "../../database/connectiondb.js";

class Specialty {
    
    // Crear especialidad
    static async create(especialidadData) {
        try {
            const query = `
                INSERT INTO especialidades (especialidad_nombre) 
                VALUES (?)
            `;
            const [result] = await db.executeQuery(query, [
                especialidadData.especialidad_nombre
            ]);
            return { success: true, insertId: result.insertId };
        } catch (error) {
            throw new Error(`Error al crear especialidad: ${error.message}`);
        }
    }

    // Obtener todas las especialidades
    static async getAll() {
        try {
            const query = `
                SELECT 
                    e.especialidad_id, e.especialidad_nombre,
                    COUNT(m.medico_id) as total_medicos
                FROM especialidades e
                LEFT JOIN medicos m ON e.especialidad_id = m.especialidad_id AND m.medico_estado = 1
                GROUP BY e.especialidad_id, e.especialidad_nombre
                ORDER BY e.especialidad_nombre
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener especialidades: ${error.message}`);
        }
    }

    // Obtener especialidad por ID
    static async getById(especialidad_id) {
        try {
            const query = `
                SELECT 
                    e.especialidad_id, e.especialidad_nombre,
                    COUNT(m.medico_id) as total_medicos
                FROM especialidades e
                LEFT JOIN medicos m ON e.especialidad_id = m.especialidad_id AND m.medico_estado = 1
                WHERE e.especialidad_id = ?
                GROUP BY e.especialidad_id, e.especialidad_nombre
            `;
            const [result] = await db.executeQuery(query, [especialidad_id]);
            return result[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener especialidad: ${error.message}`);
        }
    }

    // Actualizar especialidad
    static async update(especialidad_id, especialidadData) {
        try {
            const query = `
                UPDATE especialidades SET 
                    especialidad_nombre = ?
                WHERE especialidad_id = ?
            `;
            const [result] = await db.executeQuery(query, [
                especialidadData.especialidad_nombre,
                especialidad_id
            ]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al actualizar especialidad: ${error.message}`);
        }
    }

    // Eliminar especialidad
    static async delete(especialidad_id) {
        try {
            // Verificar si hay médicos asociados
            const checkQuery = `SELECT COUNT(*) as count FROM medicos WHERE especialidad_id = ? AND medico_estado = 1`;
            const [checkResult] = await db.executeQuery(checkQuery, [especialidad_id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('No se puede eliminar la especialidad porque tiene médicos asociados');
            }

            const query = `DELETE FROM especialidades WHERE especialidad_id = ?`;
            const [result] = await db.executeQuery(query, [especialidad_id]);
            return { success: result.affectedRows > 0 };
        } catch (error) {
            throw new Error(`Error al eliminar especialidad: ${error.message}`);
        }
    }

    // Obtener médicos por especialidad
    static async getMedicosByEspecialidad(especialidad_id) {
        try {
            const query = `
                SELECT 
                    m.medico_id, m.medico_estado,
                    u.usuario_nombre, u.usuario_apellido, u.usuario_correo, 
                    u.usuario_telefono, u.usuario_identificacion
                FROM medicos m
                INNER JOIN usuarios u ON m.usuario_id = u.usuario_id
                WHERE m.especialidad_id = ? AND m.medico_estado = 1 AND u.usuario_estado = 1
                ORDER BY u.usuario_apellido, u.usuario_nombre
            `;
            const [result] = await db.executeQuery(query, [especialidad_id]);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener médicos por especialidad: ${error.message}`);
        }
    }

    // Buscar especialidades por nombre
    static async search(searchTerm) {
        try {
            const query = `
                SELECT 
                    e.especialidad_id, e.especialidad_nombre,
                    COUNT(m.medico_id) as total_medicos
                FROM especialidades e
                LEFT JOIN medicos m ON e.especialidad_id = m.especialidad_id AND m.medico_estado = 1
                WHERE e.especialidad_nombre LIKE ?
                GROUP BY e.especialidad_id, e.especialidad_nombre
                ORDER BY e.especialidad_nombre
            `;
            const searchPattern = `%${searchTerm}%`;
            const [result] = await db.executeQuery(query, [searchPattern]);
            return result;
        } catch (error) {
            throw new Error(`Error al buscar especialidades: ${error.message}`);
        }
    }

    // Obtener especialidades con disponibilidad
    static async getWithAvailability() {
        try {
            const query = `
                SELECT DISTINCT
                    e.especialidad_id, e.especialidad_nombre,
                    COUNT(DISTINCT m.medico_id) as medicos_disponibles
                FROM especialidades e
                INNER JOIN medicos m ON e.especialidad_id = m.especialidad_id
                INNER JOIN disponibilidad d ON m.medico_id = d.medico_id
                WHERE m.medico_estado = 1 AND d.disponibilidad_estado = 1
                AND d.disponibilidad_fecha >= CURDATE()
                GROUP BY e.especialidad_id, e.especialidad_nombre
                ORDER BY e.especialidad_nombre
            `;
            const [result] = await db.executeQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener especialidades con disponibilidad: ${error.message}`);
        }
    }

    // Obtener estadísticas por especialidad
    static async getStats(especialidad_id = null) {
        try {
            let whereClause = '';
            let params = [];
            
            if (especialidad_id) {
                whereClause = 'WHERE m.especialidad_id = ?';
                params.push(especialidad_id);
            }

            const queries = [
                `SELECT COUNT(*) as total_medicos FROM medicos m ${whereClause} ${especialidad_id ? 'AND' : 'WHERE'} m.medico_estado = 1`,
                `SELECT COUNT(*) as total_citas FROM citas c INNER JOIN medicos m ON c.medico_id = m.medico_id ${whereClause} ${especialidad_id ? 'AND' : 'WHERE'} c.cita_estado = 1`,
                `SELECT COUNT(*) as total_historiales FROM historiales h INNER JOIN medicos m ON h.medico_id = m.medico_id ${whereClause} ${especialidad_id ? 'AND' : 'WHERE'} h.historial_estado = 1`,
                `SELECT COUNT(*) as disponibilidad_activa FROM disponibilidad d INNER JOIN medicos m ON d.medico_id = m.medico_id ${whereClause} ${especialidad_id ? 'AND' : 'WHERE'} d.disponibilidad_estado = 1 AND d.disponibilidad_fecha >= CURDATE()`
            ];

            const results = await Promise.all(
                queries.map(query => db.executeQuery(query, params))
            );

            return {
                total_medicos: results[0][0][0].total_medicos,
                total_citas: results[1][0][0].total_citas,
                total_historiales: results[2][0][0].total_historiales,
                disponibilidad_activa: results[3][0][0].disponibilidad_activa
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de especialidad: ${error.message}`);
        }
    }

    // Verificar si una especialidad existe por nombre
    static async existsByName(especialidad_nombre, especialidad_id = null) {
        try {
            let query = `SELECT especialidad_id FROM especialidades WHERE especialidad_nombre = ?`;
            let params = [especialidad_nombre];

            if (especialidad_id) {
                query += ` AND especialidad_id != ?`;
                params.push(especialidad_id);
            }

            const [result] = await db.executeQuery(query, params);
            return result.length > 0;
        } catch (error) {
            throw new Error(`Error al verificar especialidad: ${error.message}`);
        }
    }
}

export default Specialty;