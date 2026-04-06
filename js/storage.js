// Módulo para persistir los turnos en localStorage
const Storage = {
  CLAVE: "simulador_turnos_v2",

  guardar(turnos) {
    try {
      localStorage.setItem(this.CLAVE, JSON.stringify(turnos));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  },

  cargar() {
    try {
      const datos = localStorage.getItem(this.CLAVE);
      return datos ? JSON.parse(datos) : [];
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      return [];
    }
  },

  limpiar() {
    try {
      localStorage.removeItem(this.CLAVE);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
    }
  },
};
