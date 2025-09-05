import { useState, useEffect } from "react";
import {
  BellIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import appointmentService from "../../../services/appointmentService";

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, overdue, completed

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const appointments = await appointmentService.getAppointments();

      // Generar notificaciones basadas en las citas
      const generatedNotifications = generateNotifications(appointments);
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (appointments) => {
    const now = new Date();
    const notifications = [];

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.cita_fecha);
      const appointmentDateTime = new Date(
        `${appointment.cita_fecha}T${appointment.cita_hora}`
      );
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);

      // Notificación de cita próxima (próximas 2 horas)
      if (hoursUntilAppointment > 0 && hoursUntilAppointment <= 2) {
        notifications.push({
          id: `upcoming-${appointment.cita_id}`,
          type: "upcoming",
          title: "Cita Próxima",
          message: `Tienes una cita con ${
            appointment.paciente_nombre
          } en ${Math.round(hoursUntilAppointment * 60)} minutos`,
          time: appointmentDateTime,
          appointment: appointment,
          priority: "high",
          read: false,
        });
      }

      // Notificación de cita vencida (pasó hace menos de 2 horas)
      if (hoursUntilAppointment < 0 && hoursUntilAppointment >= -2) {
        notifications.push({
          id: `overdue-${appointment.cita_id}`,
          type: "overdue",
          title: "Cita Vencida",
          message: `La cita con ${
            appointment.paciente_nombre
          } era hace ${Math.round(
            Math.abs(hoursUntilAppointment) * 60
          )} minutos`,
          time: appointmentDateTime,
          appointment: appointment,
          priority: "urgent",
          read: false,
        });
      }

      // Notificación de cita completada
      if (appointment.cita_estado === "Completada") {
        notifications.push({
          id: `completed-${appointment.cita_id}`,
          type: "completed",
          title: "Cita Completada",
          message: `La cita con ${appointment.paciente_nombre} ha sido completada`,
          time: appointmentDateTime,
          appointment: appointment,
          priority: "low",
          read: false,
        });
      }

      // Notificación de cita cancelada
      if (appointment.cita_estado === "Cancelada") {
        notifications.push({
          id: `cancelled-${appointment.cita_id}`,
          type: "cancelled",
          title: "Cita Cancelada",
          message: `La cita con ${appointment.paciente_nombre} ha sido cancelada`,
          time: appointmentDateTime,
          appointment: appointment,
          priority: "medium",
          read: false,
        });
      }
    });

    // Ordenar por prioridad y tiempo
    return notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.time - a.time;
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "upcoming":
        return <ClockIcon className="w-5 h-5" />;
      case "overdue":
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case "completed":
        return <CheckCircleIcon className="w-5 h-5" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "urgent") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    switch (type) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} notificaciones sin leer`
                : "Todas las notificaciones leídas"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2">
          {[
            { key: "all", label: "Todas" },
            { key: "upcoming", label: "Próximas" },
            { key: "overdue", label: "Vencidas" },
            { key: "completed", label: "Completadas" },
            { key: "cancelled", label: "Canceladas" },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                      notification.type,
                      notification.priority
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(
                            notification.type,
                            notification.priority
                          )}`}
                        >
                          {notification.priority === "urgent"
                            ? "Urgente"
                            : notification.priority === "high"
                            ? "Alta"
                            : notification.priority === "medium"
                            ? "Media"
                            : "Baja"}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mt-1">{notification.message}</p>

                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatTime(notification.time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{notification.appointment.paciente_nombre}</span>
                      </div>
                      {notification.appointment.cita_observaciones && (
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">
                            {notification.appointment.cita_observaciones}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "No tienes notificaciones en este momento"
                : `No hay notificaciones de tipo "${filter}"`}
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "overdue").length}
                </p>
                <p className="text-sm text-gray-500">Vencidas</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "upcoming").length}
                </p>
                <p className="text-sm text-gray-500">Próximas</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.type === "completed").length}
                </p>
                <p className="text-sm text-gray-500">Completadas</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
