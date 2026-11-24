// integracion_setun.js — Puente entre el periódico y Setun 1958 (ADAPTADO A PERIODISMO)
(function() {
    console.log("🔌 integracion_setun.js cargado (modo periodismo)");

    // ═══════════════════════════════════════════════════════════
    // 🧬 VARIABLES DE PERIODISMO (traducidas de las de fútbol)
    // ═══════════════════════════════════════════════════════════
    window.SetunPeriodismo = {
        // Extrae métricas del DOM y del estado del periódico
        extraerMetricas: function() {
            const texto = document.body.innerText || '';
            const palabras = texto.toLowerCase().match(/\b[a-záéíóúñ]+\b/g) || [];
            const unicas = new Set(palabras);
            const citas = (texto.match(/["“«][^"”»]+["”»]/g) || []).length;
            const fuentesDOM = document.querySelectorAll('.fuente-item, .noticia-card, .news-item').length;
            
            // APIs consultadas (del log de Diagnóstico)
            const log = document.getElementById('diagnosticoLog')?.innerText || '';
            const apis = (log.match(/✅ (Wikipedia|Hacker News|Reddit|GDELT)/g) || []).length;
            const correcciones = (log.match(/✏️.*correcciones/g) || []).length;
            const reddit = (log.match(/Reddit: ✅/g) || []).length;
            const wiki = (log.match(/Wikipedia: ✅/g) || []).length;
            
            // Fechas (frescura)
            const fechas = texto.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || [];
            const hoy = new Date();
            let frescura = 0;
            if (fechas.length > 0) {
                try {
                    const f = fechas[0].split('/');
                    const fechaNoticia = new Date(f[2], f[1]-1, f[0]);
                    frescura = Math.min(30, Math.max(0, (hoy - fechaNoticia) / (1000*60*60*24)));
                } catch(e) {}
            }

            return {
                fuentesActivas: fuentesDOM || 15,      // default 15 (ya vimos que el periódico consigue 15)
                diversidadFuentes: apis || 2,          // Wikipedia + Hacker News
                frescura: Math.round(frescura),        // 0 = hoy, 30 = hace un mes
                densidadCitica: citas,
                correcciones: correcciones || 0,
                riquezaLexica: palabras.length > 0 ? (unicas.size / palabras.length) : 0,
                legibilidad: 50,                        // placeholder (mejorable)
                coberturaCategorias: 3,                 // placeholder
                internacional: wiki / (wiki + reddit + 1), // ratio de fuentes internacionales
                sesgo: reddit / (wiki + 1),             // ratio de ruido
                longitud: texto.length
            };
        },

        // Convierte métricas de periodismo a "señales" ternarias para Setun
        calcularSenales: function(m) {
            const setun = [];
            // 1. Fuentes (¿hay muchas?) → señal
            setun.push(window.SetunCore.ternario(m.fuentesActivas, 2, 8));
            // 2. Diversidad (¿varias APIs?) → señal
            setun.push(window.SetunCore.ternario(m.diversidadFuentes, 1, 4));
            // 3. Frescura (¿es actual?) → invertida: menos días = mejor
            setun.push(window.SetunCore.ternario(m.frescura, 15, 3) * -1);
            // 4. Citas (¿bien documentado?) → señal
            setun.push(window.SetunCore.ternario(m.densidadCitica, 2, 10));
            // 5. Riqueza léxica (¿no es repetitivo?) → señal
            setun.push(window.SetunCore.ternario(m.riquezaLexica, 0.3, 0.6));
            // 6. Correcciones (¿está limpio?) → invertida
            setun.push(window.SetunCore.ternario(m.correcciones, 10, 2) * -1);

            return setun;
        },

        // Calcula la decisión setun completa
        calcular: function() {
            const m = this.extraerMetricas();
            const senales = this.calcularSenales(m);
            const filtro = window.SetunCore.filtroAnalogico(senales);

            let decision, color;
            if (filtro === 1) {
                decision = "PUBLICAR (1) - Noticia sólida";
                color = "#10b981";
            } else if (filtro === -1) {
                decision = "REVISAR (-1) - Falta verificación";
                color = "#ef4444";
            } else {
                decision = "MANTENER (0) - Publicable con reservas";
                color = "#f59e0b";
            }

            // BitNet: usar las métricas como "jugador" adaptado
            const jugadorAdaptado = {
                overall: m.fuentesActivas * 4,        // 0-60 → simula overall
                goals: m.densidadCitica,              // citas ≈ goles
                assists: m.diversidadFuentes,         // APIs ≈ asistencias
                pace: 100 - m.frescura,               // frescura invertida
                defending: m.correcciones === 0 ? 80 : 40
            };
            const bitnet = window.SetunCore.inferenciaBitNet(jugadorAdaptado);

            // Consenso
            const consenso = window.SetunConsenso.calcular({
                setun: decision.includes('PUBLICAR') ? 'COMPRAR' : (decision.includes('REVISAR') ? 'VENDER' : 'MANTENER'),
                bitnet: bitnet.valorTernario === 1 ? 'ÉLITE' : (bitnet.valorTernario === -1 ? 'DESCARTE' : 'ROTACIÓN'),
                finanzas: 'NEUTRO'
            });

            return {
                metricas: m,
                senales: senales,
                filtro: filtro,
                decision: decision,
                color: color,
                bitnet: bitnet,
                consenso: consenso,
                timestamp: new Date().toISOString()
            };
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🧬 AUTO-EVOLUCIÓN PARA NOTICIAS
    // ═══════════════════════════════════════════════════════════
    window.AutoEvolucionNoticias = {
        memoria: (() => {
            try { return JSON.parse(localStorage.getItem('periodico_setun_memoria') || '[]'); }
            catch(e) { return []; }
        })(),
        generacion: parseInt(localStorage.getItem('periodico_setun_generacion') || '0'),

        registrar: function(resultadoSetun) {
            const registro = {
                decision: resultadoSetun.decision,
                filtro: resultadoSetun.filtro,
                bitnet: resultadoSetun.bitnet.decision,
                consenso: resultadoSetun.consenso.puntos || 0,
                metricas: resultadoSetun.metricas,
                fecha: new Date().toISOString()
            };
            this.memoria.push(registro);
            if (this.memoria.length > 100) this.memoria.shift();
            localStorage.setItem('periodico_setun_memoria', JSON.stringify(this.memoria));
            this.evolucionar();
            return this.getStats();
        },

        evolucionar: function() {
            if (this.memoria.length < 3) {
                return { precision: 0, generacion: this.generacion, total: this.memoria.length };
            }
            // Precisión = % de análisis donde setun y bitnet coinciden
            let coincidencias = 0;
            this.memoria.forEach(r => {
                const setunPos = r.decision.includes('PUBLICAR');
                const setunNeg = r.decision.includes('REVISAR');
                const bitnetPos = r.bitnet.includes('ÉLITE') || r.bitnet.includes('COMPRAR');
                const bitnetNeg = r.bitnet.includes('DESCARTE') || r.bitnet.includes('VENDER');
                if ((setunPos && bitnetPos) || (setunNeg && bitnetNeg) ||
                    (!setunPos && !setunNeg && !bitnetPos && !bitnetNeg)) {
                    coincidencias++;
                }
            });
            const precision = Math.round((coincidencias / this.memoria.length) * 100);
            if (this.memoria.length % 5 === 0) {
                this.generacion++;
                localStorage.setItem('periodico_setun_generacion', this.generacion);
            }
            return { precision, generacion: this.generacion, total: this.memoria.length };
        },

        getStats: function() { return this.evolucionar(); },
        reset: function() {
            this.memoria = [];
            this.generacion = 0;
            localStorage.removeItem('periodico_setun_memoria');
            localStorage.removeItem('periodico_setun_generacion');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // 🔌 PANEL VISUAL
    // ═══════════════════════════════════════════════════════════
    let intentos = 0;
    const checkInterval = setInterval(() => {
        intentos++;
        const moduloListo = document.getElementById('currentDate')?.innerHTML?.length > 0
                          || window.rustWASM
                          || window.Diagnostico;

        if (moduloListo && window.SetunCore) {
            clearInterval(checkInterval);
            console.log("✅ Setun: módulo del periódico detectado. Inyectando panel...");

            const panelHTML = `
            <div id="setun-panel" style="
                position: fixed; bottom: 10px; right: 10px;
                background: #1a1a2e; color: #eee;
                border: 1px solid #0f3460; border-radius: 8px;
                padding: 12px; font-family: monospace; font-size: 12px;
                z-index: 9999; max-width: 360px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            ">
                <div style="font-weight:bold; margin-bottom:6px;">🧬 Setun 1958 — Periodismo</div>
                <div id="setun-decision" style="font-weight:bold; font-size:13px; margin-bottom:4px;">Decisión: --</div>
                <div id="setun-stats">Análisis: 0 | Generación: 0 | Precisión: --</div>
                <div id="setun-metricas" style="margin-top:6px; font-size:11px; color:#aaa;">--</div>
                <div id="setun-consenso" style="margin-top:4px; font-size:11px; color:#aaa;">Consenso: --</div>
                <button id="btn-evolucionar" style="
                    margin-top:8px; background:#0f3460; color:#fff;
                    border:none; padding:6px 10px; border-radius:4px; cursor:pointer;
                ">🔬 Analizar</button>
                <button id="btn-reset-setun" style="
                    margin-top:8px; background:#333; color:#fff;
                    border:none; padding:6px 8px; border-radius:4px; cursor:pointer;
                ">🗑️</button>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', panelHTML);

            // Botón Analizar
            document.getElementById('btn-evolucionar').addEventListener('click', () => {
                const r = window.SetunPeriodismo.calcular();
                document.getElementById('setun-decision').textContent = r.decision;
                document.getElementById('setun-decision').style.color = r.color;
                document.getElementById('setun-metricas').textContent =
                    `Fuentes: ${r.metricas.fuentesActivas} | APIs: ${r.metricas.diversidadFuentes} | Citas: ${r.metricas.densidadCitica} | Frescura: ${r.metricas.frescura}d`;
                document.getElementById('setun-consenso').textContent =
                    `Consenso: ${r.consenso.puntos || 0} → ${r.consenso.veredicto || '--'}`;
                const stats = window.AutoEvolucionNoticias.registrar(r);
                document.getElementById('setun-stats').textContent =
                    `Análisis: ${stats.total} | Generación: ${stats.generacion} | Precisión: ${stats.precision}%`;
                console.log("🧬 Setun análisis:", r);
            });

            // Botón Reset
            document.getElementById('btn-reset-setun').addEventListener('click', () => {
                if (confirm('¿Resetear memoria de Setun?')) {
                    window.AutoEvolucionNoticias.reset();
                    document.getElementById('setun-stats').textContent = 'Análisis: 0 | Generación: 0 | Precisión: --';
                    document.getElementById('setun-decision').textContent = 'Decisión: --';
                    document.getElementById('setun-metricas').textContent = '--';
                    document.getElementById('setun-consenso').textContent = 'Consenso: --';
                }
            });

            // Stats iniciales
            const stats = window.AutoEvolucionNoticias.getStats();
            document.getElementById('setun-stats').textContent =
                `Análisis: ${stats.total} | Generación: ${stats.generacion} | Precisión: ${stats.precision}%`;

            console.log("✅ Setun Periodismo integrado en el periódico");
        }

        if (intentos >= 60) {
            clearInterval(checkInterval);
            console.warn("⚠️ Setun: timeout esperando el módulo del periódico");
        }
    }, 500);
})();
