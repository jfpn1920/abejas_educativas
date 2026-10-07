// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const contenedorQuiz = document.getElementById('quiz');
const mensaje = document.getElementById('mensaje');
const btnRevisar = document.getElementById('btnRevisar');
const btnReiniciar = document.getElementById('btnReiniciar');
const casillas = document.querySelectorAll('[data-ayuda]');   // casillas de "cómo ayudar"
const progresoAyuda = document.getElementById('progresoAyuda');
const inputNota = document.getElementById('nota');
// ===== PREGUNTAS DEL QUIZ =====
// correcta: posición de la respuesta correcta (0 es la primera opción)
const preguntas = [
    { id: 'p1', texto: '¿Cuántas reinas hay en una colmena?', opciones: ['Una', 'Dos', 'Diez'], correcta: 0 },
    { id: 'p2', texto: '¿Qué recolectan las abejas de las flores para hacer miel?', opciones: ['Agua', 'Néctar', 'Hojas'], correcta: 1 },
    { id: 'p3', texto: '¿Cómo se llama el transporte del polen entre flores?', opciones: ['Fotosíntesis', 'Migración', 'Polinización'], correcta: 2 }
];
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'abejas_estado';
// ===== ESTADO POR DEFECTO =====
// respuestas: opción elegida por pregunta | revisado: si ya se corrigió
// ayudas: casillas marcadas | nota: texto escrito por el usuario
const estadoInicial = { respuestas: {}, revisado: false, ayudas: [], nota: '' };
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CREAR EL QUIZ CON JAVASCRIPT =====
function construirQuiz() {
    preguntas.forEach(pregunta => {
        const grupo = document.createElement('fieldset');
        grupo.dataset.id = pregunta.id;
        const leyenda = document.createElement('legend');
        leyenda.textContent = pregunta.texto;
        grupo.appendChild(leyenda);
        // Una opción (botón de radio) por cada respuesta posible
        pregunta.opciones.forEach((opcion, indice) => {
            const etiqueta = document.createElement('label');
            etiqueta.className = 'opcion';
            etiqueta.innerHTML = `<input type="radio" name="${pregunta.id}" value="${indice}"> `;
            etiqueta.append(opcion);
            grupo.appendChild(etiqueta);
        });
        contenedorQuiz.appendChild(grupo);
    });
}
// ===== GUARDAR LA RESPUESTA ELEGIDA =====
function elegirRespuesta(id, indice) {
    estado.respuestas[id] = indice;
    estado.revisado = false;  // si cambias una respuesta, hay que revisar de nuevo
    guardarEstado();
    dibujarPantalla();
}
// ===== REVISAR LAS RESPUESTAS =====
function revisar() {
    // Todas las preguntas deben tener respuesta
    if (Object.keys(estado.respuestas).length < preguntas.length) {
        mensaje.textContent = 'Responde todas las preguntas antes de revisar.';
        return;
    }
    estado.revisado = true;
    guardarEstado();
    dibujarPantalla();
}
// ===== REINICIAR EL QUIZ =====
function reiniciarQuiz() {
    estado.respuestas = {};
    estado.revisado = false;
    guardarEstado();
    dibujarPantalla();
}
// ===== MARCAR O DESMARCAR UNA AYUDA =====
function alternarAyuda(id, marcada) {
    if (marcada) estado.ayudas.push(id);                           // la agregamos
    else estado.ayudas = estado.ayudas.filter(a => a !== id);      // la quitamos
    guardarEstado();
    dibujarPantalla();
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    let aciertos = 0;
    document.querySelectorAll('fieldset').forEach((grupo, i) => {
        const pregunta = preguntas[i];
        const elegida = estado.respuestas[pregunta.id];
        // Marca la opción elegida y quita el aviso anterior (si lo había)
        grupo.querySelectorAll('input').forEach(radio => { radio.checked = Number(radio.value) === elegida; });
        grupo.querySelector('.respuesta')?.remove();
        grupo.classList.remove('correcta', 'incorrecta');
        if (!estado.revisado) return;  // sin revisar, no se pintan resultados
        const acerto = elegida === pregunta.correcta;
        if (acerto) aciertos++;
        grupo.classList.add(acerto ? 'correcta' : 'incorrecta');
        // Si falló, mostramos cuál era la respuesta correcta
        if (!acerto) {
            const aviso = document.createElement('p');
            aviso.className = 'respuesta';
            aviso.textContent = `Respuesta correcta: ${pregunta.opciones[pregunta.correcta]}`;
            grupo.appendChild(aviso);
        }
    });
    mensaje.textContent = estado.revisado ? `Acertaste ${aciertos} de ${preguntas.length} preguntas.` : '';
    // Casillas de ayuda guardadas y su progreso
    casillas.forEach(c => { c.checked = estado.ayudas.includes(c.dataset.ayuda); });
    progresoAyuda.textContent = `Ya practicas ${estado.ayudas.length} de ${casillas.length} acciones.`;
}  
// ===== EVENTOS =====
// Un solo evento "change" detecta cualquier opción del quiz que se elija
contenedorQuiz.addEventListener('change', evento => {
    elegirRespuesta(evento.target.name, Number(evento.target.value));
});
btnRevisar.addEventListener('click', revisar);
btnReiniciar.addEventListener('click', reiniciarQuiz);
casillas.forEach(c => c.addEventListener('change', () => alternarAyuda(c.dataset.ayuda, c.checked)));
// La nota se guarda mientras se escribe
inputNota.addEventListener('input', () => {
    estado.nota = inputNota.value;
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
construirQuiz();                // crea las preguntas
inputNota.value = estado.nota;  // recupera la nota escrita
dibujarPantalla();              // recupera respuestas, resultado y ayudas