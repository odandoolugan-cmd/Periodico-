// setun_periodico_ui.js — Interfaz visual de Setun para el periódico
(function() {
    console.log("🎨 Cargando UI de Setun...");

    // 1. Inyectar el CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .setun-card { background: #0f172a; border-radius: 12px; padding: 15px; margin-bottom: 15px; color: #e2e8f0; font-family: system-ui, sans-serif; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); border-left: 4px solid #334155; }
        .setun-card.verde { border-left-color: #10b981; border: 1px solid #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
        .setun-card.amarillo { border-left-color: #f59e0b; border: 1px solid #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.2); }
        .setun-card.rojo { border-left-color: #ef4444; border: 1px solid #ef4444; box-shadow: 0 0 10px rgba(239,68,68,0.2); }
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
        
        /* Panel flotante principal */
        #setun-flotante { 
            position: fixed; bottom: 80px; right: 20px; width: 340px; max-height: 80vh; 
            overflow-y: auto; z-index: 99999; padding-right: 5px; display: none;
        }
        #setun-flotante::-webkit-scrollbar { width: 6px; }
        #setun-flotante::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

        /* Botón flotante de acceso rápido */
        #btn-setun-flotante {
            position: fixed; bottom: 20px; right: 20px; z-index: 99998;
            background: #8b5cf6; color: white; border: none; padding: 12px 20px;
            border-radius: 30px; font-weight: bold; font-size: 14px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
        }
    `;
    document.head.appendChild(style);

    // 2. Crear el Botón Flotante de acceso rápido
    const botonFlotante = document.createElement('button');
    botonFlotante.id = 'btn-setun-flotante';
    botonFlotante.innerHTML = '🧬 Analizar Noticia';
    document.body.appendChild(botonFlotante);

    // 3. Función para renderizar
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
            <div class="setun-card amarillo">
                <div class="setun-title">🧠 ANÁLISIS PROFUNDO (3 CAPAS)</div>
                <div class="setun-value amarillo">${bitnetTexto}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:5px;">SETUN EMA: Estado ${resultado.bitnet.valorTernario} | Tendencia: Estable</div>
            </div>
            <div class="setun-card">
                <div class="setun-title">🧠 RED NEURONAL TERNARIA</div>
                <div class="setun-value" style="color:#e2e8f0;">${bitnetTexto}</div>
                <div style="font-size:11px;color:#94a3b8;font-family:monospace;margin-top:5px;">Vector: [ ${resultado.senales.map(s => s === 1 ? '1' : (s === -1 ? '-1' : '0')).join(' | ')} ]</div>
                <div class="setun-sub" style="margin-top:8px;">📊 ${m.fuentesActivas > 5 ? 'Cobertura mediática alta.' : 'Cobertura moderada.'}</div>
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
        `;

        let panel = document.getElementById('setun-flotante');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'setun-flotante';
            document.body.appendChild(panel);
        }
        panel.innerHTML = html;
        panel.style.display = 'block'; // Mostrar el panel
    };

    // 4. Lógica del Botón Flotante
    botonFlotante.addEventListener('click', () => {
        console.log("🔬 Botón Analizar pulsado...");
        const panel = document.getElementById('setun-flotante');
        
        // Si el panel ya está visible, lo ocultamos (como un interruptor)
        if (panel && panel.style.display === 'block') {
            panel.style.display = 'none';
            botonFlotante.innerHTML = '🧬 Analizar Noticia';
            return;
        }

        // Si no, calculamos y mostramos
        if (window.SetunPeriodismo) {
            try {
                const res = window.SetunPeriodismo.calcular();
                window.renderSetunUI(res);
                botonFlotante.innerHTML = '❌ Cerrar Análisis';
                if(window.AutoEvolucionNoticias) window.AutoEvolucionNoticias.registrar(res);
            } catch(err) { console.error("❌ Error al calcular:", err); }
        } else {
            console.error("❌ SetunPeriodismo no está listo.");
        }
    });

})();
