// noticias_recientes.js — Inyecta noticias frescas
(function() {
    console.log("📡 Cargando CDN de Noticias Recientes (GDELT)...");
    
    async function fetchGDELT() {
        const fechaInicio = new Date(Date.now() - 7 * 864e5).toISOString().replace(/[-:T]/g, '').slice(0, 14);
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

    // Esperar a que la página termine de cargar
    setTimeout(async () => {
        const cuerpo = document.body.innerText;
        
        // Si detectamos Assange o fechas viejas
        if (cuerpo.includes('Assange') || cuerpo.includes('2012') || cuerpo.includes('2013')) {
            console.log("🕵️ Noticias viejas detectadas. Inyectando noticias de los últimos 7 días...");
            const nuevasNoticias = await fetchGDELT();
            
            if (nuevasNoticias.length > 0) {
                // Buscar el contenedor de las noticias
                const tarjetas = document.querySelectorAll('.noticia-card, .news-item, .card');
                let contenedor = null;
                
                tarjetas.forEach(t => {
                    if (t.innerText.includes('HACKER NEWS') || t.innerText.includes('Hacker News')) {
                        contenedor = t.parentElement;
                    }
                });

                if (contenedor) {
                    contenedor.innerHTML = nuevasNoticias.map(n => `
                        <div class="noticia-card" style="background:#fff; border-radius:8px; padding:15px; margin-bottom:10px; border-left:4px solid #3b82f6; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                            <div style="font-size:10px; color:#3b82f6; font-weight:bold; margin-bottom:5px;">🌐 GDELT NEWS</div>
                            <h4 style="margin:0 0 8px 0; font-size:16px; color:#1e293b;">${n.title}</h4>
                            <p style="margin:0; font-size:12px; color:#64748b;">${n.domain} · Reciente</p>
                            <a href="${n.url}" target="_blank" style="display:inline-block; margin-top:8px; font-size:12px; color:#2563eb; text-decoration:none;">Leer nota original →</a>
                        </div>
                    `).join('');
                    console.log(`✅ ${nuevasNoticias.length} noticias frescas inyectadas con éxito.`);
                } else {
                    console.log("⚠️ No se encontró el contenedor de noticias.");
                }
            }
        }
    }, 5000); // Esperar 5 segundos a que carguen las originales
})();
