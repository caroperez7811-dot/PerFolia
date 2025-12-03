// función global accesible inmediatamente (no depende de DOMContentLoaded)
window.playSound = async function () {
    const audio = document.getElementById('musicaFondo');
    const musicBtn = document.getElementById('musicaBtn');
    if (!audio) return console.warn('no audio element encontrado');
    try {
        // asegurar que no está muteado y volumen correcto
        audio.muted = false;
        audio.volume = 0.6;
        if (audio.paused) {
            console.log('Intentando reproducir audio...');
            await audio.play();
            musicBtn?.classList.add('encendido');
            console.log('Reproducción iniciada');
        } else {
            audio.pause();
            musicBtn?.classList.remove('encendido');
            console.log('Audio pausado');
        }
    } catch (err) {
        console.error('playSound: audio.play() rejected:', err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('musicaFondo');
    if (audio) {
        audio.crossOrigin = 'anonymous';
        audio.loop = true;
        audio.volume = 0.6;
        try { audio.load(); } catch(e) { console.warn('audio.load() failed', e); }
        audio.addEventListener('error', (ev) => {
            console.error('Audio element error event:', ev, 'networkState:', audio.networkState, 'readyState:', audio.readyState);
        });
        audio.addEventListener('canplaythrough', () => console.log('Audio: canplaythrough — recurso cargado y listo'));
    }

    // unlock: primer gesto del usuario
    let _unlocked = false;
    function unlockAudio() {
        if (_unlocked) return;
        _unlocked = true;
        if (audio) {
            audio.play().then(() => audio.pause()).catch((err) => console.warn('unlock play failed:', err));
        }
        document.removeEventListener('pointerdown', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    }
    document.addEventListener('pointerdown', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    const musicBtn = document.getElementById('musicaBtn');
    if (musicBtn) {
        musicBtn.style.pointerEvents = 'auto';
        musicBtn.addEventListener('click', window.playSound);
    }

    // Mapear botones de abrir/cerrar a sus ventanas
    const mappings = [
        { open: 'abrirVentana', popup: 'ventanaEmergente', close: 'cerrarVentana' },
        { open: 'abrirVentana1', popup: 'ventanaEmergente1', close: 'cerrarVentana1' },
        { open: 'abrirVentana2', popup: 'ventanaEmergente2', close: 'cerrarVentana2' },
        { open: 'abrirVentana3', popup: 'ventanaEmergente3', close: 'cerrarVentana3' },
    ];

    mappings.forEach(({ open, popup, close }) => {
        const btnOpen = document.getElementById(open);
        const modal = document.getElementById(popup);
        const btnClose = document.getElementById(close);

        if (btnOpen && modal) {
            btnOpen.addEventListener('click', () => {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                if (musicBtn) musicBtn.style.display = 'none';
            });
        }

        if (btnClose && modal) {
            btnClose.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                if (musicBtn) musicBtn.style.display = '';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    if (musicBtn) musicBtn.style.display = '';
                }
            });
        }
    });

    // Asegura que los botones internos que llaman a playSound funcionen también
    ['musicaBtn2','musicaBtn3','musicaBtn4','musicaBtn5'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.addEventListener('click', window.playSound);
    });

    // Scroll suave desde el botón "Abrir el cuaderno" hacia el final de la página
    const btnAbrir = document.getElementById('btnCuaderno2');
    if (btnAbrir) {
        btnAbrir.addEventListener('click', (e) => {
            e.preventDefault();
            // quita/pon clases si usas pantallas activas
            document.querySelectorAll('.pantalla').forEach(s => s.classList.remove('active'));
            const cuaderno = document.getElementById('cuaderno');
            if (cuaderno) cuaderno.classList.add('active');

            // calcular la posición más baja posible (compatible entre navegadores)
            const maxScroll = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );

            // desplazar suavemente hasta abajo
            window.scrollTo({ top: maxScroll, behavior: 'smooth' });

            // asegurar foco en el cuaderno tras el scroll (pequeña demora)
            setTimeout(() => {
                if (cuaderno) {
                    const primero = cuaderno.querySelector('div');
                    if (primero) {
                        primero.tabIndex = -1;
                        primero.focus({ preventScroll: true });
                    } else {
                        cuaderno.tabIndex = -1;
                        cuaderno.focus({ preventScroll: true });
                    }
                }
            }, 600);
        });
    }

    // Scroll: manejar ambos botones y activar la sección antes de desplazar
    const btnsAbrir = document.querySelectorAll('#btnCuaderno, #btnCuaderno2');
    btnsAbrir.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cuaderno = document.getElementById('cuaderno');
        if (!cuaderno) return;

        // mostrar la sección del cuaderno (y ocultar otras pantallas)
        document.querySelectorAll('.pantalla').forEach(s => s.classList.remove('active'));
        cuaderno.classList.add('active');

        // esperar reflow y luego desplazar suavemente (más fiable que calcular offsets inmediatamente)
        requestAnimationFrame(() => {
          setTimeout(() => {
            cuaderno.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // opcional: enfocar el primer panel para accesibilidad
            const primero = cuaderno.querySelector('div');
            if (primero) { primero.tabIndex = -1; primero.focus({ preventScroll: true }); }
          }, 60);
        });
      });
    });

    // ----------------- EFECTO MAQUINA DE ESCRIBIR PARA RECUERDOS Y CUADERNO -----------------
    // selecciona solo los textos del cuaderno y los párrafos dentro de las ventanas emergentes
    const typeTargets = Array.from(document.querySelectorAll(
      '#cuaderno p, #cuaderno h1, #cuaderno h2, #cuaderno h3, #cuaderno h4, #cuaderno h5, #cuaderno h6, .contenido-ventana p'
    )).filter(el => !el.classList.contains('cartaTitulo')); // excluir títulos grandes si aparecen por error

    // guarda el texto original y vacía el elemento para prepararlo a teclear (si no se guardó ya)
    typeTargets.forEach(el => {
      if (!el.dataset.fulltext) {
        el.dataset.fulltext = el.textContent.trim();
        el.textContent = ''; // vacío inicial para el efecto
      }
    });

    // función de espera
    const wait = ms => new Promise(res => setTimeout(res, ms));

    // función que teclea el texto (asíncrona) — sin caret y más lenta
    async function typeWrite(el, baseSpeed = 30) { // baseSpeed en ms; aumentalo si quieres más lento
      if (!el || el.dataset.typed === '1') return;
      el.dataset.typed = '1';
      const text = el.dataset.fulltext || '';
      // escribir carácter a carácter
      for (let i = 0; i < text.length; i++) {
        el.insertAdjacentText('beforeend', text[i]);
        // velocidad con pequeña variación para parecer más natural
        const jitter = Math.floor(Math.random() * 40) - 20; // -20..19 ms
        await wait(Math.max(18, baseSpeed + jitter));
      }
      // asegurar el texto final (por si hubo trimming)
      el.textContent = text;
    }

    // usar IntersectionObserver para activar el efecto cuando el texto entra en pantalla
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeWrite(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    typeTargets.forEach(el => observer.observe(el));

    // También permitir disparar la animación manualmente si un modal se abre por JS
    const modals = document.querySelectorAll('.ventana-emergente');
    modals.forEach(modal => {
      const mo = new MutationObserver(() => {
        if (getComputedStyle(modal).display !== 'none') {
          modal.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(p => {
            if (p.dataset.typed !== '1') typeWrite(p);
          });
        }
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['style'] });
    });
    // ------------------------------------------------------------------------------------

    // EFECTO HOVER: REVEAL DEL BACKGROUND AL PASAR MOUSE SOBRE "Encuentra la ilustración"
    const contenedoresImagen = document.querySelectorAll('.contenedor-imagen');
    contenedoresImagen.forEach(cont => {
      const parentDiv = cont.closest('#cuaderno > div');
      if (!parentDiv) return;

      cont.addEventListener('mouseenter', () => {
        parentDiv.classList.add('reveal-bg');
      });

      cont.addEventListener('mouseleave', () => {
        parentDiv.classList.remove('reveal-bg');
      });

      // También al hacer tap en móvil (toggle)
      cont.addEventListener('click', () => {
        parentDiv.classList.toggle('reveal-bg');
      });
    });

    // Mostrar el gif solo cuando la PRIMERA página del cuaderno esté visible
    const firstPage = document.querySelector('#cuaderno > div:first-child');
    const gif = document.getElementById('gifCuaderno');
    if (firstPage && gif) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            gif.classList.add('visible');
          } else {
            gif.classList.remove('visible');
          }
        });
      }, { threshold: [0.5] });

      obs.observe(firstPage);
    }
});