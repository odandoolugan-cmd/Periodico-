// noticias_recientes.js — Elimina noticias viejas y deja las frescas
(function() {
    console.log("📡 Módulo de Noticias Recientes iniciado...");
    
    setTimeout(() => {
        // Buscar TODOS los divs que parezcan tarjetas de noticias
        const todasLasTarjetas = document.querySelectorAll('div, article, .card');
        let eliminadas = 0;

        todasLasTarjetas.forEach(tarjeta => {
            const texto = tarjeta.innerText || '';
            
            // Si la tarjeta contiene una fecha vieja (2012-2019) y tiene la palabra Assange, la borramos
            const esVieja = (texto.includes('2012') || texto.includes('2013') || 
                            texto.includes('2018') || texto.includes('2019')) && 
                            texto.includes('Assange');
            
            // También borrar si tiene "Hacker News" y fechas viejas
            const esViejaHN = texto.includes('Hacker News') && 
                             (texto.includes('2012') || texto.includes('2013') || 
                              texto.includes('2018') || texto.includes('2019'));

            if (esVieja || esViejaHN) {
                tarjeta.style.display = 'none'; // Ocultar en lugar de borrar (más seguro)
                eliminadas++;
            }
        });

        // También borrar los textos sueltos que digan Assange en la lista
        const itemsLista = document.querySelectorAll('li, p');
        itemsLista.forEach(item => {
            const texto = item.innerText || '';
            if (texto.includes('Assange') && (texto.includes('2012') || texto.includes('2013'))) {
                item.style.display = 'none';
                eliminadas++;
            }
        });

        if (eliminadas > 0) {
            console.log(`✅ ${eliminadas} noticias viejas de Assange ocultadas. Las noticias frescas de 2026 se mantienen visibles.`);
        } else {
            console.log("ℹ️ No se encontraron noticias viejas para ocultar.");
        }
    }, 5000); // Esperar 5 segundos (dejar que el periódico cargue todo)
})();
