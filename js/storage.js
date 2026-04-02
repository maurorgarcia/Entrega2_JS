/**
 * storage.js
 * Módulo de almacenamiento persistente con localStorage.
 * Centraliza toda la interacción con localStorage.
 */

const Storage = {
  /** Clave utilizada en localStorage */
  CLAVE: "simulador_turnos_v2",

  /**
   * Guarda el array de turnos en localStorage.
   * @param {Array} turnos - Array de objetos turno a persistir
   */
  guardar(turnos) {
    try {
      localStorage.setItem(this.CLAVE, JSON.stringify(turnos));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  },

  /**
   * Carga los turnos guardados desde localStorage.
   * @returns {Array} Array de turnos o array vacío si no hay datos
   */
  cargar() {
    try {
      const datos = localStorage.getItem(this.CLAVE);
      return datos ? JSON.parse(datos) : [];
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      return [];
    }
  },

  /**
   * Elimina todos los turnos del localStorage.
   */
  limpiar() {
    try {
      localStorage.removeItem(this.CLAVE);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
    }
  },
};
