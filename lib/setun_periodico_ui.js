// setun_periodico_ui.js — Interfaz visual integrada (Auto-análisis)
(function() {
    console.log("🎨 Cargando UI integrada de Setun...");

    // 1. Inyectar el CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .setun-container { margin: 20px auto; max-width: 800px; padding: 0 15px; font-family: system-ui, sans-serif; }
        .setun-card { background: #0f172a; border-radius: 12px; padding: 15px; margin-bottom: 15px; color: #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); border-left: 4px solid #334155; }
        .setun-card.verde { border-left-color: #10b981; border: 1px solid #10b981; }
        .setun-card.amarillo { border-left-color: #f59e0b; border: 1px solid #f59e0b; }
        .setun-card.rojo { border-left-color: #ef4444; border: 1px solid #ef4444; }
        .setun-title { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; display: flex; justify-content: space-between; text-transform: uppercase;}
        .setun-value { font-size: 22px; font-weight: 800; margin-bottom: 5px; }
        .setun-value.verde { color: #10b981; }
        .setun-value.amarillo { color: #f59e0b; }
        .setun-value.rojo { color: #ef4444; }
        .setun-desc { font-size: 13px; color: #cbd5e1; margin-bottom: 10px; }
        .setun-sub { font-size: 11px; color: #64748b; background: #1e293b; padding: 6px; border-radius: 6px; }
        .setun-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .setun-stat { background: #1e293b; padding: 8px; border-radius: 8px; }
        .setun-stat-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; margin-bottom: 3px; }
        .setun-stat-val { font-size: 14px; font-weight: bold; color: #e2e8f0; }
    `;
    document.head.appendChild(style);

    // 2. Función para renderizar las tarjetas
    window.renderSetunUI = function(resultado) {
        const m = resultado.metricas;
        const esVerde = resultado.filtro === 1;
        const esRojo = resultado.filtro === -1;
        const color = esVerde ? 'verde' : (esRojo ? 'rojo' : 'amarillo');

        let consensoTexto = "REVISIÓN";
        let descTexto = "Faltan fuentes o contexto.";
        if (esVerde) { consensoTexto = "ALTA VIABILIDAD"; descTexto = "Noticia sólida, actual y bien documentada."; } 
        else if (!esRojo) { consensoTexto = "PUBLICABLE"; descTexto = "Aceptable, pero podría mejorar la verificación."; }

        let bitnetTexto = resultado.bitnet.decision;
        if (bitnetTexto.includes("COMPRAR")) bitnetTexto = "DESTACADO / RECOMENDADO";
        else if (bitnetTexto.includes("VENDER")) bitnetTexto = "DESCARTE / REVISAR";
        else bitnetTexto = "ESTÁNDAR / NEUTRAL";

        const html = `
            <div class="setun-container" id="setun-widget">
                <div class="setun-card ${color}">
                    <div class="setun-title">📰 CONSENSO EDITORIAL <span style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:9px;">ANÁLISIS</span></div>
                    <div class="setun-value ${color}">${consensoTexto}</div>
                    <div class="setun-desc">${descTexto}</div>
                    <div style="border-top:1px solid #334155; margin: 10px 0;"></div>
                    <div style="font-size:11px;color:#94a3b8;">Setun: ${resultado.decision.split(' ')[0]} | BitNet: ${bitnetTexto}</div>
                    <div class="setun-sub" style="margin-top:8px;">💡 ${resultado.consenso.veredicto || 'Verificación estándar'}</div>
                </div>
                <div class="setun-card ${color}">
                    <div class="setun-title">🧬 NÚCLEO SETUN 1958 <span style="color:#10b981">■ ONLINE</span></div>
                    <div class="setun-value ${color}">${resultado.decision}</div>
                    <div style="font-size:11px;color:#94a3b8;font-family:monospace;">[ CAPA 1: ${resultado.senales.join(' | ')} ] -> FILTRO ANALÓGICO</div>
                </div>
                <div class="setun-card ${color}">
                    <div class="setun-title">📊 MATRIZ DE VERIFICACIÓN</div>
                    <div class="setun-value ${color}">${esVerde ? 'ALTA CONFIANZA' : (esRojo ? 'ALTO RIESGO (FAKE NEWS)' : 'RIESGO MODERADO')}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:5px;">
                        CONTEXTO: Sinergia ${Math.min(100, m.fuentesActivas * 6)}% | Riesgo: ${esVerde ? 'Bajo' : (esRojo ? 'Alto' : 'Medio')}<br>
                        HEBBIANO: Puntaje ${Math.min(100, m.densidadCitica * 5 + 20)}/100
                    </div>
                </div>
                <div class="setun-card">
                    <div class="setun-title">📊 VARIABLES DE CONTEXTO</div>
                    <div class="setun-grid">
                        <div class="setun-stat"><div class="setun-stat-label">ACTUALIDAD</div><div class="setun-stat-val">${m.frescura === 0 ? 'Hoy' : 'Hace ' + m.frescura + 'd'}</div></div>
                        <div class="setun-stat"><div class="setun-stat-label">CITAS TEXTUALES</div><div class="setun-stat-val">${m.densidadCitica}</div></div>
                        <div class="setun-stat"><div class="setun-stat-label">FUENTES VERIFICADAS</div><div class="setun-stat-val">${m.fuentesActivas}</div></div>
                        <div class="setun-stat"><div class="setun-stat-label">RIQUEZA LÉXICA</div><div class="setun-stat-val">${(m.riquezaLexica * 100).toFixed(1)}%</div></div>
                    </div>
                </div>
            </div>
        `;

        // Buscar dónde inyectarlo (justo después del contenedor del análisis principal)
        let widget = document.getElementById('setun-widget');
        if (!widget) {
            // Buscar el contenedor del análisis de la IA
            const analisisDiv = document.querySelector('.analisis-container, .card-body, .news-content');
            if (analisisDiv) {
                analisisDiv.insertAdjacentHTML('afterend', html);
            } else {
                // Si no lo encuentra, lo pone al final del body
                document.body.insertAdjacentHTML('beforeend', html);
            }
        } else {
            // Si ya existe, actualiza su contenido
            widget.outerHTML = html;
        }
    };

    // 3. Auto-ejecución y Filtro de Noticias
    let ejecutado = false;
    const intervalo = setInterval(() => {
        // Si ya se ejecutó, no hacer nada
        if (ejecutado) return;

        // Filtro de noticias viejas (Assange)
        const textos = document.body.innerText;
        if (textos.includes('Assange') || textos.includes('2012')) {
            const tarjetas = document.querySelectorAll('div');
            tarjetas.forEach(t => {
                if (t.innerText.includes('Assange') && t.innerText.includes('Hacker News') && t.children.length > 1 && t.children.length < 8) {
                    t.style.display = 'none';
                }
            });
        }

        // Si ya cargó el análisis de la IA y tenemos los módulos de Setun listos
        if (textos.includes('Titular:') && window.SetunPeriodismo) {
            ejecutado = true;
            clearInterval(intervalo);
            console.log("🧬 Ejecutando Setun automáticamente...");
            
            try {
                const res = window.SetunPeriodismo.calcular();
                window.renderSetunUI(res);
                if(window.AutoEvolucionNoticias) window.AutoEvolucionNoticias.registrar(res);
            } catch(e) {
                console.error("❌ Error en Setun auto:", e);
            }
        }
    }, 3000);
})();
