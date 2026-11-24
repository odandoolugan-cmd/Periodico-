// noticias_recientes.js — Inyecta noticias frescas si las originales son viejas
(function() {
    console.log("📡 Cargando CDN de Noticias Recientes (GDELT)...");
    
    // Función para buscar en GDELT (últimos 3 días)
    async function fetchGDELT() {
        const fechaInicio = new Date(Date.now() - 3 * 864e5).toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=Ecuador&mode=artlist&maxrecords=10&format=json&startdatetime=${fechaInicio}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.articles || [];
        } catch(e) {
            console.warn("⚠️ GDELT falló, usando fallback");
            return [];
        }
    }

    // Esperar a que el periódico cargue las noticias originales
    const checkNoticias = setInterval(async () => {
        const noticiasDOM = document.querySelectorAll('.noticia-card, .news-item');
        if (noticiasDOM.length > 0) {
            clearInterval(checkNoticias);
            
            // Verificar si son noticias viejas (buscando "Assange" o años < 2020)
            const textoNoticias = Array.from(noticiasDOM).map(n => n.innerText).join(' ');
            const esVieja = textoNoticias.includes('Assange') || textoNoticias.includes('2012') || textoNoticias.includes('2013');

            if (esVieja) {
                console.log("🕵️ Noticias viejas detectadas. Inyectando noticias de los últimos 3 días...");
                const nuevasNoticias = await fetchGDELT();
                
                if (nuevasNoticias.length > 0) {
                    // Tomar el contenedor de noticias
                    const contenedor = noticiasDOM[0].parentElement;
                    if (contenedor) {
                        // Limpiar noticias viejas y poner las nuevas
                        contenedor.innerHTML = nuevasNoticias.map(n => `
                            <div class="noticia-card" style="background:#1e293b; border-radius:8px; padding:12px; margin-bottom:10px; border-left:4px solid #3b82f6;">
                                <h4 style="margin:0 0 5px 0; font-size:14px; color:#f8fafc;">${n.title}</h4>
                                <p style="margin:0; font-size:11px; color:#94a3b8;">${n.domain} · ${new Date().toLocaleDateString()}</p>
                                <a href="${n.url}" target="_blank" style="display:inline-block; margin-top:5px; font-size:11px; color:#60a5fa;">Leer más →</a>
                            </div>
                        `).join('');
                        console.log(`✅ ${nuevasNoticias.length} noticias recientes inyectadas.`);
                    }
                } else {
                    console.log("⚠️ No se encontraron noticias nuevas en GDELT.");
                }
            } else {
                console.log("✅ Las noticias originales ya son recientes. No se necesita parche.");
            }
        }
    }, 2000); // Revisar cada 2 segundos

    // Timeout de seguridad (si en 15s no hay noticias, no hacer nada)
    setTimeout(() => clearInterval(checkNoticias), 15000);
})();
