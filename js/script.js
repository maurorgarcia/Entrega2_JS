// Capacidad máxima de turnos por día
const MAX_TURNOS = 10;

const ESPECIALIDADES = [
  "Clínica General",
  "Pediatría",
  "Cardiología",
  "Traumatología",
  "Dermatología",
  "Oftalmología",
  "Neurología",
  "Ginecología",
];

// Estado principal de la app
let turnos = Storage.cargar();
let turnoAEliminar = null;

// Referencias al DOM
const formulario         = document.getElementById("form-turno");
const inputNombre        = document.getElementById("nombre");
const inputEdad          = document.getElementById("edad");
const selectEspecialidad = document.getElementById("especialidad");
const inputMotivo        = document.getElementById("motivo");
const contenedorTurnos   = document.getElementById("lista-turnos");
const mensajeVacio       = document.getElementById("lista-vacia");
const btnLimpiar         = document.getElementById("btn-limpiar");
const btnConfirmar       = document.getElementById("btn-confirmar-eliminar");
const toastContenedor    = document.getElementById("toast-contenedor");

const statTotal       = document.getElementById("stat-total");
const statDisponibles = document.getElementById("stat-disponibles");
const statProximo     = document.getElementById("stat-proximo");
const statPorcentaje  = document.getElementById("stat-porcentaje");
const barraOcupacion  = document.getElementById("barra-ocupacion");
const badgeTexto      = document.getElementById("badge-texto");

// Muestra un toast en pantalla (reemplaza alert)
function mostrarNotificacion(mensaje, tipo = "success") {
  const iconos = {
    success: "bi-check-circle-fill",
    danger:  "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info:    "bi-info-circle-fill",
  };

  const idToast = `toast-${Date.now()}`;
  const icono   = iconos[tipo] || "bi-bell-fill";

  const htmlToast = `
    <div id="${idToast}" class="toast align-items-center text-bg-${tipo} border-0 mb-2" role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icono} me-2"></i>${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>`;

  toastContenedor.insertAdjacentHTML("beforeend", htmlToast);

  const toastElemento = document.getElementById(idToast);
  const instanciaToast = new bootstrap.Toast(toastElemento, { delay: 3500 });
  instanciaToast.show();

  toastElemento.addEventListener("hidden.bs.toast", () => toastElemento.remove());
}

function limpiarError(idCampo) {
  const input = document.getElementById(idCampo);
  const error = document.getElementById(`error-${idCampo}`);
  if (input) input.classList.remove("is-invalid");
  if (error) error.textContent = "";
}

function mostrarErrorCampo(idCampo, mensaje) {
  const input = document.getElementById(idCampo);
  const error = document.getElementById(`error-${idCampo}`);
  if (input) input.classList.add("is-invalid");
  if (error) error.textContent = mensaje;
}

// Valida el formulario y retorna los datos o null si hay errores
function validarFormulario() {
  ["nombre", "edad", "especialidad", "motivo"].forEach(limpiarError);

  const nombre       = inputNombre.value.trim();
  const edadValor    = inputEdad.value.trim();
  const especialidad = selectEspecialidad.value;
  const motivo       = inputMotivo.value.trim();
  const edad         = parseInt(edadValor, 10);
  let esValido       = true;

  if (!nombre) {
    mostrarErrorCampo("nombre", "El nombre es obligatorio.");
    esValido = false;
  } else if (nombre.length < 3) {
    mostrarErrorCampo("nombre", "Mínimo 3 caracteres.");
    esValido = false;
  }

  if (!edadValor) {
    mostrarErrorCampo("edad", "La edad es obligatoria.");
    esValido = false;
  } else if (isNaN(edad) || edad < 1 || edad > 120) {
    mostrarErrorCampo("edad", "Ingresá una edad entre 1 y 120.");
    esValido = false;
  }

  if (!especialidad) {
    mostrarErrorCampo("especialidad", "Seleccioná una especialidad.");
    esValido = false;
  }

  if (!motivo) {
    mostrarErrorCampo("motivo", "El motivo de consulta es obligatorio.");
    esValido = false;
  } else if (motivo.length < 5) {
    mostrarErrorCampo("motivo", "Describí el motivo con al menos 5 caracteres.");
    esValido = false;
  }

  if (!esValido) return null;

  return { nombre, edad, especialidad, motivo };
}

function crearHTMLTarjetaTurno(turno) {
  return `
    <div class="turno-card" id="turno-${turno.id}">
      <div class="turno-numero">${turno.numero}</div>
      <div class="turno-info">
        <div class="turno-nombre">${turno.nombre}</div>
        <div class="turno-meta">
          <span><i class="bi bi-person me-1"></i>${turno.edad} años</span>
          <span><i class="bi bi-clock me-1"></i>${turno.hora}</span>
        </div>
        <span class="turno-especialidad-badge">
          <i class="bi bi-hospital me-1"></i>${turno.especialidad}
        </span>
        <div class="turno-motivo">
          <i class="bi bi-clipboard-pulse me-1"></i>${turno.motivo}
        </div>
      </div>
      <button
        class="btn-eliminar-turno"
        data-id="${turno.id}"
        title="Eliminar turno de ${turno.nombre}">
        <i class="bi bi-trash3"></i>
      </button>
    </div>`;
}

function renderizarTurnos() {
  if (turnos.length === 0) {
    contenedorTurnos.innerHTML = "";
    mensajeVacio.classList.remove("d-none");
  } else {
    mensajeVacio.classList.add("d-none");
    contenedorTurnos.innerHTML = turnos.map(crearHTMLTarjetaTurno).join("");
  }

  actualizarEstadisticas();
  registrarEventosEliminar();
}

function actualizarEstadisticas() {
  const total       = turnos.length;
  const disponibles = Math.max(0, MAX_TURNOS - total);
  const porcentaje  = Math.round((total / MAX_TURNOS) * 100);
  const proximo     = total > 0 ? `#${turnos[0].numero} · ${turnos[0].nombre.split(" ")[0]}` : "—";

  statTotal.textContent       = total;
  statDisponibles.textContent = disponibles;
  statProximo.textContent     = proximo;
  statPorcentaje.textContent  = porcentaje + "%";
  badgeTexto.textContent      = `${total} / ${MAX_TURNOS} turnos`;

  barraOcupacion.style.width = porcentaje + "%";
  barraOcupacion.setAttribute("aria-valuenow", porcentaje);

  // Color de la barra según nivel de ocupación
  barraOcupacion.className = "progress-bar";
  if (porcentaje < 50) {
    barraOcupacion.classList.add("nivel-bajo");
  } else if (porcentaje < 85) {
    barraOcupacion.classList.add("nivel-medio");
  } else {
    barraOcupacion.classList.add("nivel-alto");
  }
}

function registrarPaciente() {
  if (turnos.length >= MAX_TURNOS) {
    mostrarNotificacion("No hay turnos disponibles. Capacidad máxima alcanzada.", "danger");
    return;
  }

  const datos = validarFormulario();
  if (!datos) return;

  // Hora estimada a partir de las 8:00, cada 20 minutos
  const minutosExtra = turnos.length * 20;
  const horaBase     = new Date();
  horaBase.setHours(8, minutosExtra, 0, 0);
  const horaFormateada = horaBase.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const nuevoPaciente = {
    id:            `p${Date.now()}`,
    numero:        turnos.length + 1,
    nombre:        datos.nombre,
    edad:          datos.edad,
    especialidad:  datos.especialidad,
    motivo:        datos.motivo,
    hora:          horaFormateada,
    fechaRegistro: new Date().toLocaleString("es-AR"),
  };

  turnos.push(nuevoPaciente);
  Storage.guardar(turnos);

  renderizarTurnos();
  formulario.reset();
  ["nombre", "edad", "especialidad", "motivo"].forEach(limpiarError);

  mostrarNotificacion(
    `Turno #${nuevoPaciente.numero} asignado a ${nuevoPaciente.nombre} — ${horaFormateada}`,
    "success"
  );
}

// Abre el modal de confirmación en lugar de usar confirm()
function solicitarEliminar(idTurno) {
  const turno = turnos.find((t) => t.id === idTurno);
  if (!turno) return;

  turnoAEliminar = idTurno;
  document.getElementById("modal-nombre-paciente").textContent = turno.nombre;

  const modal = new bootstrap.Modal(document.getElementById("modal-confirmar"));
  modal.show();
}

function eliminarTurnoConfirmado() {
  if (!turnoAEliminar) return;

  turnos = turnos.filter((t) => t.id !== turnoAEliminar);

  // Reasignar números correlativos tras la eliminación
  turnos.forEach((t, indice) => {
    t.numero = indice + 1;
  });

  Storage.guardar(turnos);
  renderizarTurnos();

  mostrarNotificacion("Turno eliminado correctamente.", "info");

  turnoAEliminar = null;
  bootstrap.Modal.getInstance(document.getElementById("modal-confirmar")).hide();
}

function limpiarTodosTurnos() {
  if (turnos.length === 0) {
    mostrarNotificacion("No hay turnos para eliminar.", "warning");
    return;
  }

  const cantidad = turnos.length;
  turnos = [];
  Storage.limpiar();
  renderizarTurnos();

  mostrarNotificacion(`Se eliminaron ${cantidad} turno(s).`, "info");
}

// Registra eventos en botones generados dinámicamente
function registrarEventosEliminar() {
  contenedorTurnos.querySelectorAll(".btn-eliminar-turno").forEach((boton) => {
    boton.addEventListener("click", () => {
      const idTurno = boton.getAttribute("data-id");
      solicitarEliminar(idTurno);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // Poblar el select con las especialidades del array
  ESPECIALIDADES.forEach((esp) => {
    const opcion       = document.createElement("option");
    opcion.value       = esp;
    opcion.textContent = esp;
    selectEspecialidad.appendChild(opcion);
  });

  renderizarTurnos();

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    registrarPaciente();
  });

  btnConfirmar.addEventListener("click", eliminarTurnoConfirmado);
  btnLimpiar.addEventListener("click", limpiarTodosTurnos);

  [inputNombre, inputEdad, selectEspecialidad, inputMotivo].forEach((campo) => {
    campo.addEventListener("input", () => limpiarError(campo.id));
  });
});
