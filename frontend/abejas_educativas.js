//--------------------------------------//
//--|funcionalidad_abejas_educativas|---// 
//--------------------------------------//
const contenedorQuiz = document.getElementById("quiz");
const mensaje = document.getElementById("mensaje");
const btnRevisar = document.getElementById("btnRevisar");
const btnReiniciar = document.getElementById("btnReiniciar");
const casillas = document.querySelectorAll("[data-ayuda]");
const progresoAyuda = document.getElementById("progresoAyuda");
const inputNota = document.getElementById("nota");
//----------------//
//--|datos_quiz|--//
//----------------//
const preguntas = [
    {
        id: "p1",
        texto: "¿Cuántas reinas hay en una colmena?",
        opciones: ["Una", "Dos", "Diez"],
        correcta: 0
    },
    {
        id: "p2",
        texto: "¿Qué recolectan las abejas de las flores para hacer miel?",
        opciones: ["Agua", "Néctar", "Hojas"],
        correcta: 1
    },
    {
        id: "p3",
        texto: "¿Cómo se llama el transporte del polen entre flores?",
        opciones: ["Fotosíntesis", "Migración", "Polinización"],
        correcta: 2
    }
];
//--------------------------//
//--|almacenamiento_local|--//
//--------------------------//
const CLAVE = "abejas_estado";
function nuevoEstado() {
    return { respuestas: {}, revisado: false, ayudas: [], nota: "" };
}
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        if (guardado) {
            return JSON.parse(guardado);
        }
        return nuevoEstado();
    } catch (error) {
        return nuevoEstado();
    }
}
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
let estado = leerEstado();
//------------------------//
//--|construccion_quiz|---//
//------------------------//
function construirQuiz() {
    preguntas.forEach((pregunta) => {
        const grupo = document.createElement("fieldset");
        const leyenda = document.createElement("legend");
        leyenda.textContent = pregunta.texto;
        grupo.appendChild(leyenda);
        pregunta.opciones.forEach((texto, indice) => {
            const etiqueta = document.createElement("label");
            etiqueta.className = "opcion";
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = pregunta.id;
            radio.value = indice;
            radio.addEventListener("change", () => elegirRespuesta(pregunta.id, indice));
            etiqueta.appendChild(radio);
            etiqueta.appendChild(document.createTextNode(" " + texto));
            grupo.appendChild(etiqueta);
        });
        contenedorQuiz.appendChild(grupo);
    });
}
//--------------------//
//--|acciones_quiz|---//
//--------------------//
function elegirRespuesta(id, indice) {
    estado.respuestas[id] = indice;
    estado.revisado = false;
    guardarEstado();
    dibujarPantalla();
}
function revisar() {
    const respondidas = Object.keys(estado.respuestas).length;
    if (respondidas < preguntas.length) {
        mensaje.textContent = "Responde todas las preguntas antes de revisar.";
        return;
    }
    estado.revisado = true;
    guardarEstado();
    dibujarPantalla();
}
function reiniciarQuiz() {
    estado.respuestas = {};
    estado.revisado = false;
    guardarEstado();
    dibujarPantalla();
}
//----------------------//
//--|acciones_ayudas|---//
//----------------------//
function alternarAyuda(id, marcada) {
    if (marcada) {
        estado.ayudas.push(id);
    } else {
        estado.ayudas = estado.ayudas.filter((a) => a !== id);
    }
    guardarEstado();
    dibujarPantalla();
}
//--------------//
//--|pantalla|--//
//--------------//
function dibujarPantalla() {
    let aciertos = 0;
    const grupos = document.querySelectorAll("fieldset");
    grupos.forEach((grupo, i) => {
        const pregunta = preguntas[i];
        const elegida = estado.respuestas[pregunta.id];
        const radios = grupo.querySelectorAll("input");
        radios.forEach((radio) => {
            radio.checked = Number(radio.value) === elegida;
        });
        const avisoViejo = grupo.querySelector(".respuesta");
        if (avisoViejo) {
            avisoViejo.remove();
        }
        grupo.classList.remove("correcta");
        grupo.classList.remove("incorrecta");
        if (estado.revisado) {
            if (elegida === pregunta.correcta) {
                aciertos++;
                grupo.classList.add("correcta");
            } else {
                grupo.classList.add("incorrecta");
                const aviso = document.createElement("p");
                aviso.className = "respuesta";
                aviso.textContent = "Respuesta correcta: " + pregunta.opciones[pregunta.correcta];
                grupo.appendChild(aviso);
            }
        }
    });
    if (estado.revisado) {
        mensaje.textContent = "Acertaste " + aciertos + " de " + preguntas.length + " preguntas.";
    } else {
        mensaje.textContent = "";
    }
    casillas.forEach((casilla) => {
        casilla.checked = estado.ayudas.includes(casilla.dataset.ayuda);
    });
    progresoAyuda.textContent = "Ya practicas " + estado.ayudas.length + " de " + casillas.length + " acciones.";
}
//--------------//
//--|eventos|---//
//--------------//
btnRevisar.addEventListener("click", revisar);
btnReiniciar.addEventListener("click", reiniciarQuiz);
casillas.forEach((casilla) => {
    casilla.addEventListener("change", () => alternarAyuda(casilla.dataset.ayuda, casilla.checked));
});
inputNota.addEventListener("input", () => {
    estado.nota = inputNota.value;
    guardarEstado();
});
//---------------//
//--|arranque|---//
//---------------//
construirQuiz();
inputNota.value = estado.nota;
dibujarPantalla();