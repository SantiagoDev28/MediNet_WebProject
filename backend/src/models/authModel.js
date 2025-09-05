import db from "../../database/connectiondb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medinet_secret_key";
const JWT_EXPIRES_IN = "8h";

class Auth {
  // Buscar usuario por correo electrónico
  static async findUserByEmail(usuario_correo) {
    const query = "SELECT * FROM usuarios WHERE usuario_correo = ?";
    const result = await db.executeQuery(query, [usuario_correo]);
    // Si tu executeQuery retorna { success, data }
    if (result.success) {
      return result.data[0] || null;
    } else {
      throw new Error(`Error al buscar usuario: ${result.error}`);
    }
  }

  // Verificar si el email ya existe
  static async emailExists(usuario_correo) {
    const user = await this.findUserByEmail(usuario_correo);
    return user !== null;
  }

  // Crear nuevo usuario
  static async createUser(userData) {
    const {
      usuario_nombre,
      usuario_apellido,
      usuario_edad,
      usuario_genero,
      usuario_identificacion,
      usuario_direccion,
      usuario_ciudad,
      usuario_correo,
      usuario_telefono,
      usuario_contrasena,
      rol_id,
      identificacion_id,
      medico_id: medico_id_from_data = null, // Opcional, solo para pacientes creados por médicos
    } = userData;

    if (await this.emailExists(usuario_correo)) {
      throw new Error("El correo electrónico ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(usuario_contrasena, 10);

    const query = `
            INSERT INTO usuarios (
                usuario_nombre, usuario_apellido, usuario_edad, usuario_genero,
                usuario_identificacion, usuario_direccion, usuario_ciudad,
                usuario_correo, usuario_telefono, usuario_contrasena,
                rol_id, medico_id, identificacion_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    try {
      const result = await db.executeQuery(query, [
        usuario_nombre,
        usuario_apellido,
        usuario_edad,
        usuario_genero,
        usuario_identificacion,
        usuario_direccion,
        usuario_ciudad,
        usuario_correo,
        usuario_telefono,
        hashedPassword,
        rol_id,
        medico_id_from_data,
        identificacion_id,
      ]);
      // Si tu executeQuery retorna { success, results }
      if (!result.success) {
        throw new Error(`Error al crear usuario: ${result.error}`);
      }
      const insertId = result.results?.insertId || result.data?.insertId;

      // Si es un médico, crear registro en la tabla medicos
      let medico_id = null;
      if (rol_id === 2) {
        const medicoQuery = `
          INSERT INTO medicos (usuario_id, medico_estado) 
          VALUES (?, 1)
        `;
        const medicoResult = await db.executeQuery(medicoQuery, [insertId]);
        if (medicoResult.success) {
          medico_id =
            medicoResult.results?.insertId || medicoResult.data?.insertId;
        }
      }

      const token = jwt.sign(
        { usuario_id: insertId, usuario_correo, rol_id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return {
        success: true,
        userId: insertId,
        medico_id,
        usuario_nombre,
        usuario_correo,
        token,
        message: "Usuario creado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  // Verificar credenciales de login
  static async verifyCredentials(usuario_correo, usuario_contrasena) {
    try {
      const user = await this.findUserByEmail(usuario_correo);
      if (!user) {
        return { success: false, message: "Credenciales inválidas" };
      }
      if (user.usuario_estado === 0) {
        return { success: false, message: "Usuario desactivado" };
      }
      const passwordMatch = await bcrypt.compare(
        usuario_contrasena,
        user.usuario_contrasena
      );
      if (!passwordMatch) {
        return { success: false, message: "Credenciales inválidas" };
      }
      const { usuario_contrasena: _, ...userWithoutPassword } = user;

      // Si es un médico, obtener el medico_id
      let medico_id = null;
      if (user.rol_id === 2) {
        const medicoQuery = `SELECT medico_id FROM medicos WHERE usuario_id = ? AND medico_estado = 1`;
        const medicoResult = await db.executeQuery(medicoQuery, [
          user.usuario_id,
        ]);
        if (medicoResult.success && medicoResult.data.length > 0) {
          medico_id = medicoResult.data[0].medico_id;
        }
      }

      // Si es un paciente, obtener el paciente_id
      let paciente_id = null;
      if (user.rol_id === 3) {
        const pacienteQuery = `SELECT paciente_id FROM pacientes WHERE usuario_id = ? AND paciente_estado = 1`;
        const pacienteResult = await db.executeQuery(pacienteQuery, [
          user.usuario_id,
        ]);
        if (pacienteResult.success && pacienteResult.data.length > 0) {
          paciente_id = pacienteResult.data[0].paciente_id;
        }
      }

      const token = jwt.sign(
        {
          usuario_id: user.usuario_id,
          usuario_correo: user.usuario_correo,
          rol_id: user.rol_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      return {
        success: true,
        user: {
          ...userWithoutPassword,
          medico_id,
          paciente_id,
        },
        token,
        message: "Login exitoso",
      };
    } catch (error) {
      throw new Error(`Error al verificar credenciales: ${error.message}`);
    }
  }

  // Cambiar contraseña
  static async changePassword(usuario_id, currentPassword, newPassword) {
    try {
      const query =
        "SELECT usuario_contrasena FROM usuarios WHERE usuario_id = ?";
      const result = await db.executeQuery(query, [usuario_id]);
      if (!result.success || result.data.length === 0) {
        throw new Error("Usuario no encontrado");
      }
      const user = result.data[0];
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        user.usuario_contrasena
      );
      if (!passwordMatch) {
        throw new Error("Contraseña actual incorrecta");
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery =
        "UPDATE usuarios SET usuario_contrasena = ? WHERE usuario_id = ?";
      const updateResult = await db.executeQuery(updateQuery, [
        hashedNewPassword,
        usuario_id,
      ]);
      if (!updateResult.success) {
        throw new Error(
          `Error al actualizar contraseña: ${updateResult.error}`
        );
      }
      return { success: true, message: "Contraseña actualizada exitosamente" };
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  // Obtener información completa del usuario con su rol
  static async getUserWithRole(usuario_id) {
    const query = `
            SELECT u.*, r.rol_nombre 
            FROM usuarios u 
            LEFT JOIN roles r ON u.rol_id = r.rol_id 
            WHERE u.usuario_id = ?
        `;
    const result = await db.executeQuery(query, [usuario_id]);
    if (!result.success) {
      throw new Error(`Error al obtener usuario: ${result.error}`);
    }
    const user = result.data[0];
    if (!user) return null;
    const { usuario_contrasena: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default Auth;
