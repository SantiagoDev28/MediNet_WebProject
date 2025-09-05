import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ClockIcon,
  CalendarIcon,
  EnvelopeIcon,
  BellIcon,
  UserIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import AppointmentForm from "./AppointmentForm";
import AddPatientForm from "./AddPatientForm";
import CalendarView from "./CalendarView";
import NotificationsView from "./NotificationsView";
import appointmentService from "../../../services/appointmentService";
import { useAuth } from "../../../contexts/AuthContext";

const DoctorDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Esta semana");
  const [currentMonth, setCurrentMonth] = useState("Ago");
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isAddPatientFormOpen, setIsAddPatientFormOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Estadísticas del dashboard
  const weeklyStats = [
    {
      title: "Total Pacientes",
      value: stats.totalPatients.toString(),
      icon: UserGroupIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Citas",
      value: stats.totalAppointments.toString(),
      icon: CalendarIcon,
      color: "bg-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Citas Completadas",
      value: stats.completedAppointments.toString(),
      icon: CheckCircleIcon,
      color: "bg-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Citas Pendientes",
      value: stats.pendingAppointments.toString(),
      icon: ClockIcon,
      color: "bg-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData);

      // Calcular estadísticas
      const total = appointmentsData.length;
      const completed = appointmentsData.filter(
        (apt) => apt.cita_estado === 1
      ).length;
      const pending = total - completed;

      setStats({
        totalPatients:
          appointmentsData.length > 0
            ? new Set(appointmentsData.map((apt) => apt.paciente_id)).size
            : 0,
        totalAppointments: total,
        completedAppointments: completed,
        pendingAppointments: pending,
      });
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos reales del dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const upcomingAppointments = appointments.slice(0, 4).map((apt) => ({
    name: `${apt.paciente?.usuario?.usuario_nombre || "Paciente"} ${
      apt.paciente?.usuario?.usuario_apellido || ""
    }`,
    type: "Consulta",
    time: apt.cita_hora?.substring(0, 5) || "00:00",
    isHighlighted: apt.cita_estado === 1,
  }));

  const getStatusIcon = (status) => {
    if (status === "completed") {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "completed") {
      return "bg-green-100 text-green-800";
    }
    return "bg-orange-100 text-orange-800";
  };

  const handleCreateAppointment = async (appointmentData) => {
    try {
      console.log("Datos del usuario:", user);
      console.log("Datos de la cita recibidos:", appointmentData);

      // Validar que tenemos los datos necesarios
      if (!user?.medico_id) {
        throw new Error(
          "No se pudo obtener el ID del médico. Por favor, inicia sesión nuevamente."
        );
      }

      if (!appointmentData.paciente_id) {
        throw new Error("Debe seleccionar un paciente");
      }

      if (!appointmentData.cita_fecha) {
        throw new Error("Debe seleccionar una fecha");
      }

      if (!appointmentData.cita_hora) {
        throw new Error("Debe seleccionar una hora");
      }

      if (!appointmentData.cita_tipo) {
        throw new Error("Debe seleccionar un tipo de cita");
      }

      const citaData = {
        medico_id: user.medico_id,
        paciente_id: appointmentData.paciente_id,
        cita_fecha: appointmentData.cita_fecha,
        cita_hora: appointmentData.cita_hora,
        cita_tipo: appointmentData.cita_tipo,
        cita_observaciones: appointmentData.cita_observaciones || null,
        cita_estado: 1, // Pendiente
      };

      console.log("Datos finales de la cita:", citaData);

      await appointmentService.createAppointment(citaData);

      // Recargar las citas
      await loadDashboardData();
    } catch (error) {
      console.error("Error creando cita:", error);
      throw error;
    }
  };

  const handlePatientAdded = (newPatient) => {
    console.log("Nuevo paciente agregado:", newPatient);
    // Aquí podrías actualizar la lista de pacientes si es necesario
  };

  const handleAddPatientClick = () => {
    setIsAddPatientFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Barra Lateral Izquierda */}
      <div className="w-20 bg-blue-800 rounded-r-3xl flex flex-col items-center py-8 space-y-8">
        {/* Logo */}
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-800"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col space-y-6">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              currentView === "dashboard"
                ? "bg-blue-600"
                : "bg-blue-800 hover:bg-blue-700"
            }`}
            title="Dashboard"
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView("calendar")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              currentView === "calendar"
                ? "bg-blue-600"
                : "bg-blue-800 hover:bg-blue-700"
            }`}
            title="Calendario de Citas"
          >
            <CalendarIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView("notifications")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors ${
              currentView === "notifications"
                ? "bg-blue-600"
                : "bg-blue-800 hover:bg-blue-700"
            }`}
            title="Notificaciones"
          >
            <EnvelopeIcon className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Título y Acciones */}
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Médico
              </h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsAppointmentFormOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Agendar Cita</span>
                </button>
                <button
                  onClick={() => setIsAddPatientFormOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Agregar Paciente</span>
                </button>
              </div>
            </div>

            {/* Perfil y Notificaciones */}
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
                title="Cerrar Sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Dr. {user?.usuario_nombre || "Médico"}{" "}
                    {user?.usuario_apellido || ""}
                  </p>
                  <p className="text-xs text-gray-500">Médico</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <main className="flex-1">
          {currentView === "dashboard" && (
            <div className="p-8 space-y-8">
              {/* Saludo y Gráfico */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Buenos Días,{" "}
                      <span className="text-blue-600">
                        Dr. {user?.usuario_nombre || "Médico"}
                      </span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Que tengas un excelente día de trabajo
                    </p>
                  </div>
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Weekly Reports */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reportes Semanales
                  </h2>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Esta semana">Esta semana</option>
                    <option value="Semana pasada">Semana pasada</option>
                    <option value="Este mes">Este mes</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {weeklyStats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}
                        >
                          <stat.icon
                            className={`w-6 h-6 ${stat.color} text-white`}
                          />
                        </div>
                        <button
                          className={`px-3 py-1 ${stat.color} text-white text-sm rounded-lg font-semibold`}
                        >
                          {stat.value}
                        </button>
                      </div>
                      <p className="text-gray-600 mt-4 text-sm">{stat.title}</p>
                    </div>
                  ))}

                  {/* Botón de agregar */}
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
                    <PlusIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Mis Citas */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Mis Citas
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-2 font-semibold text-gray-700">
                          Paciente
                        </th>
                        <th className="text-left py-4 px-2 font-semibold text-gray-700">
                          Fecha
                        </th>
                        <th className="text-left py-4 px-2 font-semibold text-gray-700">
                          Hora
                        </th>
                        <th className="text-left py-4 px-2 font-semibold text-gray-700">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-8 text-center text-gray-500"
                          >
                            Cargando citas...
                          </td>
                        </tr>
                      ) : appointments.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-8 text-center text-gray-500"
                          >
                            No hay citas programadas
                          </td>
                        </tr>
                      ) : (
                        appointments.map((appointment) => (
                          <tr
                            key={appointment.cita_id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-gray-900">
                                  {appointment.paciente?.usuario
                                    ?.usuario_nombre || "Paciente"}{" "}
                                  {appointment.paciente?.usuario
                                    ?.usuario_apellido || ""}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-gray-600">
                              {new Date(
                                appointment.cita_fecha
                              ).toLocaleDateString("es-ES")}
                            </td>
                            <td className="py-4 px-2 text-gray-600">
                              {appointment.cita_hora?.substring(0, 5) ||
                                "00:00"}
                            </td>
                            <td className="py-4 px-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(
                                  appointment.cita_estado
                                    ? "completed"
                                    : "pending"
                                )}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    appointment.cita_estado
                                      ? "completed"
                                      : "pending"
                                  )}`}
                                >
                                  {appointment.cita_estado
                                    ? "Completada"
                                    : "Pendiente"}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {currentView === "calendar" && <CalendarView />}

          {currentView === "notifications" && <NotificationsView />}
        </main>
      </div>

      {/* Formulario de Citas */}
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={() => setIsAppointmentFormOpen(false)}
        onSubmit={handleCreateAppointment}
        onAddPatient={handleAddPatientClick}
      />

      {/* Formulario de Agregar Paciente */}
      <AddPatientForm
        isOpen={isAddPatientFormOpen}
        onClose={() => setIsAddPatientFormOpen(false)}
        onPatientAdded={handlePatientAdded}
      />
    </div>
  );
};

export default DoctorDashboard;
