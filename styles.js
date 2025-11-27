/* ------------------ CAMBIO DE PANTALLAS ------------------ */

const inicio = document.getElementById("inicio");
const cuaderno = document.getElementById("cuaderno");
const btnCuaderno = document.getElementById("btnCuaderno");
const btnCuaderno2 = document.getElementById("btnCuaderno2");
const btnVolver = document.getElementById("btnVolver");

const abrirCuaderno = () => {
  inicio.classList.remove("active");
  cuaderno.classList.add("active");
};

if (btnCuaderno) btnCuaderno.addEventListener("click", abrirCuaderno);
if (btnCuaderno2) btnCuaderno2.addEventListener("click", abrirCuaderno);
if (btnVolver) {
  btnVolver.addEventListener("click", () => {
    cuaderno.classList.remove("active");
    inicio.classList.add("active");
  });
}

/* ------------------ MOSTRAR IMÁGENES AL HOVER ------------------ */

document.addEventListener("DOMContentLoaded", function () {
  const contenedores = document.querySelectorAll(".contenedor-imagen");

  contenedores.forEach(contenedor => {
    const imagen = contenedor.querySelector(".imagenes");
    const textoHover = contenedor.querySelector(".texto-hover");

    if (imagen && textoHover) {
      contenedor.addEventListener("mouseenter", function () {
        imagen.classList.add("visible");
        setTimeout(() => textoHover.classList.add("oculto"), 500);
      });
    }
  });
});

/* ------------------ CONTROL DE AUDIO ------------------ */

function playSound() {
  let audio = document.getElementById("musicaFondo");
  let boton = document.getElementById("musicaBtn");

  if (audio.paused) {
    audio.play();
    boton.classList.add("encendido");
  } else {
    audio.pause();
    boton.classList.remove("encendido");
  }
}

/* ------------------ ANIMACIÓN TEXTOS CUADERNO ------------------ */

document.addEventListener("DOMContentLoaded", function () {
  const secciones = document.querySelectorAll("#cuaderno > div");

  function prepararAnimacion(elemento) {
    const palabras = elemento.textContent.trim().split(" ");
    elemento.innerHTML = "";
    elemento.classList.add("texto-animado");
    elemento.dataset.animado = "false";

    palabras.forEach((palabra, index) => {
      const span = document.createElement("span");
      span.textContent = palabra;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.filter = "blur(4px)";
      elemento.appendChild(span);

      if (index < palabras.length - 1) {
        elemento.appendChild(document.createTextNode(" "));
      }
    });
  }

  function animarElemento(elemento) {
    elemento.dataset.animado = "true";
    const spans = elemento.querySelectorAll("span");

    spans.forEach((span, i) => {
      span.style.animation = `fade-in 0.8s ${i * 0.05}s forwards cubic-bezier(0.11, 0, 0.5, 0)`;
    });
  }

  secciones.forEach(seccion => {
    const titulo = seccion.querySelector("h1, h2, h3, h4, h5, h6");
    const texto = seccion.querySelector("p");

    if (titulo) prepararAnimacion(titulo);
    if (texto) prepararAnimacion(texto);
  });

  const primerTitulo = secciones[0].querySelector("h1, h2, h3, h4, h5, h6");
  const primerTexto = secciones[0].querySelector("p");

  if (primerTitulo) animarElemento(primerTitulo);
  if (primerTexto) animarElemento(primerTexto);

  cuaderno.addEventListener("scroll", () => {
    secciones.forEach(seccion => {
      const rect = seccion.getBoundingClientRect();
      const titulo = seccion.querySelector("h1, h2, h3, h4, h5, h6");
      const texto = seccion.querySelector("p");

      if (titulo) {
        if (rect.left < window.innerWidth && rect.right > 0) {
          if (titulo.dataset.animado === "false") animarElemento(titulo);
        } else {
          if (titulo.dataset.animado === "true") {
            titulo.dataset.animado = "false";
            titulo.querySelectorAll("span").forEach(span => {
              span.style.animation = "none";
              span.style.opacity = "0";
              span.style.filter = "blur(4px)";
            });
          }
        }
      }

      if (texto) {
        if (rect.left < window.innerWidth && rect.right > 0) {
          if (texto.dataset.animado === "false") animarElemento(texto);
        } else {
          if (texto.dataset.animado === "true") {
            texto.dataset.animado = "false";
            texto.querySelectorAll("span").forEach(span => {
              span.style.animation = "none";
              span.style.opacity = "0";
              span.style.filter = "blur(4px)";
            });
          }
        }
      }
    });
  });
});

/* ------------------ SISTEMA FINAL DE VENTANAS EMERGENTES ------------------ */

document.addEventListener("DOMContentLoaded", function () {

  function prepararAnimacionVentana(elemento) {
    const palabras = elemento.textContent.trim().split(" ");
    elemento.innerHTML = "";
    elemento.classList.add("texto-animado");

    palabras.forEach((palabra, index) => {
      const span = document.createElement("span");
      span.textContent = palabra;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.filter = "blur(4px)";
      elemento.appendChild(span);

      if (index < palabras.length - 1) {
        elemento.appendChild(document.createTextNode(" "));
      }
    });
  }

  function animarElementoVentana(elemento) {
    const spans = elemento.querySelectorAll("span");
    spans.forEach((span, i) => {
      span.style.animation = `fade-in 0.8s ${i * 0.05}s forwards cubic-bezier(0.11, 0, 0.5, 0)`;
    });
  }

  // Preparar todos los textos al inicio
  document.querySelectorAll(".ventana-emergente").forEach(ventana => {
    const txt = ventana.querySelector(".contenido-ventana p");
    if (txt) prepararAnimacionVentana(txt);
  });

  // Abrir ventanas usando el número REAL del id
  document.querySelectorAll('[id^="abrirVentana"]').forEach(boton => {
    boton.addEventListener("click", () => {

      const n = boton.id.replace("abrirVentana", "");
      const ventana = document.getElementById(
        n === "" ? "ventanaEmergente" : "ventanaEmergente" + n
      );

      const texto = ventana.querySelector(".contenido-ventana p");

      texto.querySelectorAll("span").forEach(span => {
        span.style.animation = "none";
        span.style.opacity = "0";
        span.style.filter = "blur(4px)";
      });

      setTimeout(() => animarElementoVentana(texto), 50);

      ventana.style.display = "flex";
    });
  });

  // Cerrar ventanas
  document.querySelectorAll('[id^="cerrarVentana"]').forEach(boton => {
    boton.addEventListener("click", () => {

      const n = boton.id.replace("cerrarVentana", "");
      const ventana = document.getElementById(
        n === "" ? "ventanaEmergente" : "ventanaEmergente" + n
      );

      ventana.style.display = "none";
    });
  });

});
