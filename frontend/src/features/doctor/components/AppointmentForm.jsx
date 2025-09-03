import { useState } from "react";
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const AppointmentForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "",
    location: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const appointmentTypes = [
    "Consulta General",
    "Seguimiento",
    "Urgencia",
    "Examen",
    "Cirugía",
    "Terapia",
  ];

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const validateField = (field, value) => {
    let errorMsg = "";

    switch (field) {
      case "patientName":
        if (!value.trim()) {
          errorMsg = "El nombre del paciente es requerido";
        } else if (value.trim().length < 3) {
          errorMsg = "El nombre debe tener al menos 3 caracteres";
        }
        break;

      case "patientEmail":
        if (!value.trim()) {
          errorMsg = "El correo del paciente es requerido";
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value)) {
          errorMsg = "Correo inválido";
        }
        break;

      case "patientPhone":
        if (!value.trim()) {
          errorMsg = "El teléfono del paciente es requerido";
        } else if (!/^[0-9]{10}$/.test(value)) {
          errorMsg = "Teléfono inválido (10 dígitos)";
        }
        break;

      case "appointmentDate":
        if (!value.trim()) {
          errorMsg = "La fecha de la cita es requerida";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            errorMsg = "La fecha no puede ser anterior a hoy";
          }
        }
        break;

      case "appointmentTime":
        if (!value.trim()) {
          errorMsg = "La hora de la cita es requerida";
        }
        break;

      case "appointmentType":
        if (!value.trim()) {
          errorMsg = "Selecciona el tipo de cita";
        }
        break;

      case "location":
        if (!value.trim()) {
          errorMsg = "La ubicación es requerida";
        }
        break;

      default:
        break;
    }

    return errorMsg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errorMsg = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Aquí iría la lógica para enviar la cita al backend
      await onSubmit(formData);

      // Limpiar formulario
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        appointmentDate: "",
        appointmentTime: "",
        appointmentType: "",
        location: "",
        notes: "",
      });

      setErrors({});
      setTouched({});

      onClose();
    } catch (error) {
      console.error("Error al crear la cita:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInputBorderClass = (fieldName) => {
    if (!touched[fieldName]) {
      return "border-gray-300";
    }
    if (errors[fieldName]) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500";
    }
    return "border-green-500 focus:border-green-500 focus:ring-green-500";
  };

  const getStatusIcon = (fieldName) => {
    if (!touched[fieldName]) return null;

    if (errors[fieldName]) {
      return (
        <XMarkIcon className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    if (formData[fieldName] && !errors[fieldName]) {
      return (
        <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
      );
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-100 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Agendar Nueva Cita
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Paciente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "patientName"
                    )}`}
                    placeholder="Nombre completo"
                    required
                  />
                  {getStatusIcon("patientName")}

                  {errors.patientName && touched.patientName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.patientName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo del Paciente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="patientEmail"
                    value={formData.patientEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "patientEmail"
                    )}`}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  {getStatusIcon("patientEmail")}

                  {errors.patientEmail && touched.patientEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.patientEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono del Paciente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "patientPhone"
                    )}`}
                    placeholder="3001234567"
                    required
                  />
                  {getStatusIcon("patientPhone")}

                  {errors.patientPhone && touched.patientPhone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.patientPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cita *
                </label>
                <div className="relative">
                  <select
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full px-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "appointmentType"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {appointmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {getStatusIcon("appointmentType")}

                  {errors.appointmentType && touched.appointmentType && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.appointmentType}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de la Cita *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "appointmentDate"
                    )}`}
                    required
                  />
                  {getStatusIcon("appointmentDate")}

                  {errors.appointmentDate && touched.appointmentDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.appointmentDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de la Cita *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "appointmentTime"
                    )}`}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {getStatusIcon("appointmentTime")}

                  {errors.appointmentTime && touched.appointmentTime && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.appointmentTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicación y Notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${getInputBorderClass(
                      "location"
                    )}`}
                    placeholder="Consultorio, sala, etc."
                    required
                  />
                  {getStatusIcon("location")}

                  {errors.location && touched.location && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Observaciones, síntomas, etc."
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading || Object.keys(errors).some((key) => errors[key])
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? "Agendando..." : "Agendar Cita"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
