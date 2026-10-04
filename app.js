const tasks = [
  { id: 0, title: "Actividad 3 · Prototipo de alta fidelidad", course: "UI/UX para Arquitectos", due: "Vence en 2 días", effort: "2 horas", format: "PDF · máx. 20 MB", mode: "Individual", weight: "20 % de la nota", status: "En preparación", tone: "urgent", summary: "Construye un prototipo navegable de tres pantallas, con un flujo principal y criterios de usabilidad y accesibilidad.", requirements: ["Tres pantallas principales", "Una ruta navegable completa", "Decisiones de accesibilidad documentadas"] },
  { id: 1, title: "Ensayo · Ética y decisiones automatizadas", course: "Ética digital", due: "Vence en 4 días", effort: "45 minutos", format: "Documento", mode: "Individual", weight: "15 % de la nota", status: "Pendiente", tone: "normal", summary: "Argumenta una postura frente a un caso de decisión automatizada con dos fuentes del curso.", requirements: ["800 a 1.000 palabras", "Dos fuentes citadas", "Conclusión personal"] },
  { id: 2, title: "Quiz Unidad 2", course: "Gobierno de TI", due: "Enviada · 14 oct", effort: "30 minutos", format: "Cuestionario", mode: "Individual", weight: "10 % de la nota", status: "Enviada", tone: "sent", summary: "Entrega registrada correctamente. El comprobante permanece disponible para evitar reverificaciones.", requirements: ["10 preguntas respondidas", "Envío confirmado", "Código ENT-4F7C2"] },
  { id: 3, title: "Mapa de capacidades", course: "Arquitectura Empresarial", due: "Vence en 6 días", effort: "3 horas", format: "Presentación", mode: "Grupo", weight: "25 % de la nota", status: "Pendiente", tone: "normal", summary: "Construye el mapa de capacidades y justifica las dependencias principales.", requirements: ["Mapa jerárquico", "Dependencias señaladas", "Justificación de una página"] }
];

let selectedTask = 0;
let submissionStep = 0;
let uploaded = false;

const views = [...document.querySelectorAll(".view")];
const routeButtons = [...document.querySelectorAll("[data-route]")];
const taskList = document.querySelector("#task-list");
const taskDetail = document.querySelector("#task-detail");
const toast = document.querySelector("#toast");

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function navigate(route) {
  views.forEach(view => view.classList.toggle("active", view.id === `view-${route}`));
  routeButtons.forEach(button => button.classList.toggle("active", button.dataset.route === route));
  window.scrollTo({ top: 0, behavior: "smooth" });
  const activeView = document.querySelector(`#view-${route}`);
  if (activeView) activeView.querySelector("h1")?.focus({ preventScroll: true });
}

routeButtons.forEach(button => button.addEventListener("click", event => {
  event.preventDefault();
  navigate(button.dataset.route);
}));

function renderTasks() {
  const pendingVisible = document.querySelector('[data-filter="pending"]')?.checked ?? true;
  const sentVisible = document.querySelector('[data-filter="submitted"]')?.checked ?? true;
  const visible = tasks.filter(task => task.tone === "sent" ? sentVisible : pendingVisible);
  taskList.innerHTML = visible.map(task => `
    <button class="task-card ${task.tone} ${task.id === selectedTask ? "selected" : ""}" data-task-id="${task.id}" role="listitem" aria-pressed="${task.id === selectedTask}">
      <span class="priority-bar" aria-hidden="true"></span>
      <span class="task-main"><p>${task.course}</p><h3>${task.title}</h3><span class="task-meta"><span>${task.effort}</span><span>${task.format}</span><span>${task.status}</span></span></span>
      <span class="due ${task.tone === "sent" ? "sent" : ""}">${task.due}</span>
    </button>`).join("");
  taskList.querySelectorAll("[data-task-id]").forEach(button => button.addEventListener("click", () => {
    selectedTask = Number(button.dataset.taskId);
    renderTasks();
    renderDetail();
  }));
}

function renderDetail() {
  const task = tasks[selectedTask];
  const statusClass = task.tone === "sent" ? "success" : task.tone === "urgent" ? "danger" : "warning";
  taskDetail.innerHTML = `
    <p class="eyebrow">${task.course.toUpperCase()}</p>
    <h2>${task.title}</h2>
    <div class="status-row"><span class="status-pill ${statusClass}">${task.status}</span><span class="status-pill neutral">${task.due}</span></div>
    <p>${task.summary}</p>
    <div class="fact-grid"><div><span>Esfuerzo estimado</span><strong>${task.effort}</strong></div><div><span>Formato</span><strong>${task.format}</strong></div><div><span>Modalidad</span><strong>${task.mode}</strong></div><div><span>Ponderación</span><strong>${task.weight}</strong></div></div>
    <div class="requirements"><h3>QUÉ HAY QUE HACER</h3><ul>${task.requirements.map(item => `<li>${item}</li>`).join("")}</ul></div>
    <div class="detail-actions">${task.tone === "sent" ? '<button class="primary-button" data-download-receipt>Descargar comprobante</button>' : '<button class="primary-button" data-start-submission>Comenzar ahora</button><button class="secondary-button" data-schedule>Programar</button>'}</div>`;
  taskDetail.querySelector("[data-start-submission]")?.addEventListener("click", startSubmission);
  taskDetail.querySelector("[data-schedule]")?.addEventListener("click", () => showToast("Actividad programada para mañana a las 19:00."));
  taskDetail.querySelector("[data-download-receipt]")?.addEventListener("click", downloadReceipt);
}

document.querySelector("#filter-button").addEventListener("click", event => {
  const panel = document.querySelector("#filter-panel");
  panel.hidden = !panel.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
});
document.querySelectorAll("#filter-panel input").forEach(input => input.addEventListener("change", renderTasks));
document.querySelector("#open-change-summary").addEventListener("click", () => showToast("Cambios: UI/UX adelantó su cierre; Ética agregó una fuente; Gobierno publicó la calificación."));
document.querySelector("#add-block").addEventListener("click", () => showToast("Bloque agregado: viernes, 18:00–19:00."));
document.querySelectorAll(".time-block").forEach(button => button.addEventListener("click", () => { selectedTask = Number(button.dataset.task); navigate("week"); renderTasks(); renderDetail(); }));
document.querySelectorAll("[data-start-submission]").forEach(button => button.addEventListener("click", startSubmission));
document.querySelectorAll("[data-download-receipt]").forEach(button => button.addEventListener("click", downloadReceipt));

function startSubmission() {
  submissionStep = 0;
  uploaded = false;
  navigate("submission");
  renderSubmission();
}

document.querySelector("#leave-submission").addEventListener("click", () => navigate("week"));

function updateStepper() {
  document.querySelectorAll(".stepper li").forEach((item, index) => {
    item.classList.toggle("current", index === submissionStep);
    item.classList.toggle("complete", index < submissionStep);
  });
}

function renderSubmission() {
  updateStepper();
  const stage = document.querySelector("#submission-stage");
  if (submissionStep === 0) {
    stage.innerHTML = `<h2>Comprueba los requisitos</h2><p>Antes de cargar el archivo, confirma que la entrega contiene lo necesario.</p><div class="check-list"><label><input type="checkbox"> Tres pantallas principales</label><label><input type="checkbox"> Ruta navegable de una tarea</label><label><input type="checkbox"> Decisiones de accesibilidad documentadas</label></div><div class="stage-actions"><button class="primary-button" id="next-stage">Continuar a cargar</button></div>`;
    stage.querySelector("#next-stage").addEventListener("click", () => { const checks = [...stage.querySelectorAll("input")]; if (!checks.every(input => input.checked)) return showToast("Marca los tres requisitos antes de continuar."); submissionStep = 1; renderSubmission(); });
  } else if (submissionStep === 1) {
    stage.innerHTML = `<h2>Carga el archivo</h2><p>Formatos permitidos: PDF. Tamaño máximo: 20 MB.</p><div class="upload-zone"><div><strong>${uploaded ? "prototipo-entrega3.pdf" : "Selecciona el archivo del prototipo"}</strong><p>${uploaded ? "8,4 MB · listo para revisar" : "El archivo todavía no se ha enviado."}</p><button class="secondary-button" id="simulate-upload">${uploaded ? "Reemplazar archivo" : "Elegir archivo de ejemplo"}</button></div></div><div class="stage-actions"><button class="secondary-button" id="back-stage">Atrás</button><button class="primary-button" id="next-stage" ${uploaded ? "" : "disabled"}>Revisar entrega</button></div>`;
    stage.querySelector("#simulate-upload").addEventListener("click", () => { uploaded = true; renderSubmission(); showToast("Archivo cargado. Aún falta confirmar el envío."); });
    stage.querySelector("#back-stage").addEventListener("click", () => { submissionStep = 0; renderSubmission(); });
    stage.querySelector("#next-stage").addEventListener("click", () => { submissionStep = 2; renderSubmission(); });
  } else if (submissionStep === 2) {
    stage.innerHTML = `<h2>Revisa antes de enviar</h2><p>El archivo está cargado, pero <strong>la entrega todavía no se ha enviado</strong>.</p><div class="review-table"><div><span>Actividad</span><strong>Prototipo de alta fidelidad</strong></div><div><span>Archivo</span><strong>prototipo-entrega3.pdf · 8,4 MB</strong></div><div><span>Requisitos</span><strong>3 de 3 confirmados</strong></div><div><span>Estado actual</span><strong>Archivo cargado</strong></div></div><div class="stage-actions"><button class="secondary-button" id="back-stage">Cambiar archivo</button><button class="primary-button" id="confirm-send">Confirmar envío</button></div>`;
    stage.querySelector("#back-stage").addEventListener("click", () => { submissionStep = 1; renderSubmission(); });
    stage.querySelector("#confirm-send").addEventListener("click", () => { submissionStep = 3; renderSubmission(); });
  } else {
    stage.innerHTML = `<div class="confirmation"><div class="confirmation-mark" aria-hidden="true">✓</div><h2>Entrega enviada</h2><p>14 de octubre de 2026, 14:04</p><span class="confirmation-code">ENT-4F7C2</span><div class="file-chip"><span><strong>prototipo-entrega3.pdf</strong><br><small>8,4 MB · recibido correctamente</small></span><span class="status-pill success">Enviado</span></div><div class="stage-actions"><button class="secondary-button" id="finish">Volver a Mi Semana</button><button class="primary-button" data-download-receipt>Descargar comprobante</button></div></div>`;
    stage.querySelector("#finish").addEventListener("click", () => { tasks[0].status = "Enviada"; tasks[0].tone = "sent"; tasks[0].due = "Enviada · hoy"; navigate("week"); renderTasks(); renderDetail(); });
    stage.querySelector("[data-download-receipt]").addEventListener("click", downloadReceipt);
  }
}

function downloadReceipt() {
  const text = "COMPROBANTE DE ENTREGA\nMi Semana - Campus virtual\n\nActividad: Prototipo de alta fidelidad\nArchivo: prototipo-entrega3.pdf\nFecha: 14 de octubre de 2026, 14:04\nEstado: Enviada\nCódigo: ENT-4F7C2\n";
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "comprobante-ENT-4F7C2.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Comprobante descargado.");
}

renderTasks();
renderDetail();
