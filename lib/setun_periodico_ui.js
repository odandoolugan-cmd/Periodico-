// setun_periodico_ui.js — Interfaz visual de Setun para el periódico
(function() {
    console.log("🎨 Cargando UI de Setun para periodismo...");

    // 1. Inyectar el CSS de Pro-scout adaptado
    const style = document.createElement('style');
    style.innerHTML = `
        .setun-card {
            background: #0f172a; /* Azul oscuro/morado de Pro-scout */
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            color: #e2e8f0;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
            border-left: 4px solid #334155;
        }
        .setun-card.verde { border-left-color: #10b981; border: 1px solid #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
        .setun-card.amarillo { border-left-color: #f59e0b; border: 1px solid #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.2); }
        .setun-card.rojo { border-left-color: #ef4444; border: 1px solid #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
        
        .setun-title { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; text-transform: uppercase;}
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
        
        /* Panel flotante */
        #setun-flotante {
            position: fixed; bottom: 20px; right: 20px;
            width: 340px; max-height: 80vh; overflow-y: auto;
            z-index: 99999; padding-right: 5px;
        }
        #setun-flotante::-webkit-scrollbar { width: 6px; }
        #setun-flotante::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        
        /* Radar Chart SVG */
        .radar-container { width: 100%; height: 150px; display: flex; justify-content: center; align-items: center; }
    `;
    document.head.appendChild(style);

    // 2. Función para renderizar las tarjetas visuales
    window.renderSetunUI = function(resultado) {
        const m = resultado.metricas;
        const esVerde = resultado.filtro === 1;
        const esRojo = resultado.filtro === -1;
        const color = esVerde ? 'verde' : (esRojo ? 'rojo' : 'amarillo');

        // Formatear decisión
        let decisionTexto = "REVISAR";
        let descTexto = "Falta verificación o contexto.";
        if (esVerde) { decisionTexto = "PUBLICAR"; descTexto = "Noticia sólida y bien documentada."; }
        else if (!esRojo) { decisionTexto = "MANTENER"; descTexto = "Publicable con reservas."; }

        const html = `
            <!-- 1. SETUN DE CONSENSO -->
            <div class="setun-card ${color}">
                <div class="setun-title">🧬 SETUN DE CONSENSO <span style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:9px;">ANÁLISIS</span></div>
                <div class="setun-value ${color}">${decisionTexto}</div>
                <div class="setun-desc">${descTexto}</div>
                <div style="border-top:1px solid #334155; margin: 10px 0;"></div>
                <div style="font-size:11px;color:#94a3b8;">Setun: ${resultado.decision.split(' ')[0]} | BitNet: ${resultado.bitnet.decision.split(' ')[0]}</div>
                <div class="setun-sub" style="margin-top:8px;">💡 ${resultado.consenso.veredicto || 'Consenso neutral'}</div>
            </div>

            <!-- 2. NÚCLEO SETUN -->
            <div class="setun-card ${color}">
                <div class="setun-title">🧬 NÚCLEO SETUN 1958 <span style="color:#10b981">■ ONLINE</span></div>
                <div class="setun-value ${color}">${resultado.decision}</div>
                <div style="font-size:11px;color:#94a3b8;font-family:monospace;">[ CAPA 1: ${resultado.senales.join(' | ')} ] -> FILTRO ANALÓGICO</div>
            </div>

            <!-- 3. MATRIZ DE DECISIÓN -->
            <div class="setun-card ${color}">
                <div class="setun-title">📊 MATRIZ DE DECISIÓN</div>
                <div class="setun-value ${color}">${esVerde ? 'INVERSIÓN SEGURA' : (esRojo ? 'ALTO RIESGO' : 'RIESGO MODERADO')}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:5px;">
                    SETUN CONTEXTUAL: Sinergia ${Math.min(100, m.fuentesActivas * 6)}% | Riesgo: ${esVerde ? 'Bajo' : (esRojo ? 'Alto' : 'Medio')}<br>
                    BITNET HEBBBIANO: Puntaje ${Math.min(100, m.densidadCitica * 5 + 20)}/100
                </div>
            </div>

            <!-- 4. BITNET PROFUNDO -->
            <div class="setun-card amarillo">
                <div class="setun-title">🧠 BITNET PROFUNDO (3 CAPAS)</div>
                <div class="setun-value amarillo">${resultado.bitnet.decision}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:5px;">SETUN EMA: Estado ${resultado.bitnet.valorTernario} | Tendencia: Estable</div>
            </div>

            <!-- 5. SCOUT NEURONAL (Variables) -->
            <div class="setun-card">
                <div class="setun-title">🧠 SCOUT NEURONAL TERNARIO (BITNET)</div>
                <div class="setun-value" style="color:#e2e8f0;">${resultado.bitnet.decision.split('-')[0]}</div>
                <div style="font-size:11px;color:#94a3b8;font-family:monospace;margin-top:5px;">Vector: [ ${resultado.senales.map(s => s === 1 ? '1' : (s === -1 ? '-1' : '0')).join(' | ')} ]</div>
                <div class="setun-sub" style="margin-top:8px;">📊 Perfil periodístico. ${m.fuentesActivas > 5 ? 'Cobertura mediática alta.' : 'Cobertura moderada.'}</div>
            </div>

            <!-- 6. VARIABLES EXTRA (Grid) -->
            <div class="setun-card">
                <div class="setun-title">📊 VARIABLES EXTRA DE PERIODISMO</div>
                <div class="setun-grid">
                    <div class="setun-stat">
                        <div class="setun-stat-label">FRESCURA</div>
                        <div class="setun-stat-val">${m.frescura === 0 ? 'Hoy' : 'Hace ' + m.frescura + 'd'}</div>
                    </div>
                    <div class="setun-stat">
                        <div class="setun-stat-label">CITAS</div>
                        <div class="setun-stat-val">${m.densidadCitica}</div>
                    </div>
                    <div class="setun-stat">
                        <div class="setun-stat-label">FUENTES</div>
                        <div class="setun-stat-val">${m.fuentesActivas}</div>
                    </div>
                    <div class="setun-stat">
                        <div class="setun-stat-label">RIQUEZA LÉXICA</div>
                        <div class="setun-stat-val">${(m.riquezaLexica * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
        `;

        // Si el panel flotante no existe, lo creamos
        let panel = document.getElementById('setun-flotante');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'setun-flotante';
            document.body.appendChild(panel);
        }
        
        panel.innerHTML = html;
    };

    // 3. Conectar al botón de analizar
    const checkBtn = setInterval(() => {
        const btn = document.getElementById('btn-evolucionar');
        if (btn && !btn.dataset.setunUi) {
            btn.dataset.setunUi = 'true';
            btn.addEventListener('click', () => {
                // Ejecutamos el cálculo de Setun
                if (window.SetunPeriodismo) {
                    const res = window.SetunPeriodismo.calcular();
                    window.renderSetunUI(res); // Renderiza las tarjetas visuales
                    
                    // Actualizar stats simples en el botón original (opcional)
                    if(window.AutoEvolucionNoticias) {
                        window.AutoEvolucionNoticias.registrar(res);
                    }
                }
            });
            clearInterval(checkBtn);
        }
    }, 1000);

})();
