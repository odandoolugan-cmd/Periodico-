// noticias_recientes.js — Elimina noticias viejas apenas aparezcan en pantalla
(function() {
    console.log("📡 Módulo de Noticias Recientes (Modo Observador) iniciado...");

    // Función que busca y oculta las noticias de Assange
    function ocultarNoticiasViejas() {
        let eliminadas = 0;
        // Buscar todas las tarjetas o elementos que puedan contener noticias
        const elementos = document.querySelectorAll('div, article, li');
        
        elementos.forEach(el => {
            const texto = el.innerText || '';
            // Si el texto tiene "Assange" y un año viejo, lo ocultamos
            if (texto.includes('Assange') && (texto.includes('2012') || texto.includes('2013') || texto.includes('2018') || texto.includes('2019'))) {
                // Asegurarnos de no ocultar todo el contenedor principal, solo la tarjeta
                if (el.children.length < 10) { 
                    el.style.display = 'none';
                    el.style.opacity = '0';
                    eliminadas++;
                }
            }
        });

        if (eliminadas > 0) {
            console.log(`✅ ${eliminadas} tarjetas de noticias viejas (Assange) han sido ocultadas.`);
        }
    }

    // 1. Ejecutar una vez al inicio (por si ya están cargadas)
    ocultarNoticiasViejas();

    // 2. Crear un Observador que vigile los cambios en la página
    const observer = new MutationObserver((mutations) => {
        // Cada vez que la página cambie (se agreguen noticias), volvemos a revisar
        ocultarNoticiasViejas();
    });

    // 3. Empezar a observar todo el cuerpo de la página
    observer.observe(document.body, {
        childList: true, // Vigilar cuando se añaden o quitan elementos
        subtree: true    // Vigilar también los elementos hijos
    });

    // 4. Detener el observador después de 30 segundos para no consumir batería
    setTimeout(() => {
        observer.disconnect();
        console.log("🛑 Observador de noticias detenido (tiempo de carga finalizado).");
    }, 30000);
})();
