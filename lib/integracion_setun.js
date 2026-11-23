// integracion_setun.js — Puente entre el periódico y Setun 1958
(function() {
    console.log("🔌 integracion_setun.js cargado");

    // ── Adaptar AutoEvolucion a NOTICIAS ──
    // El autoevolucion.js de Pro-scout es de fútbol. Aquí lo sobreescribimos
    // para que trabaje con análisis de noticias.
    window.AutoEvolucionNoticias = {
        memoria: (() => {
            try { return JSON.parse(localStorage.getItem('periodico_setun_memoria') || '[]'); }
            catch(e) { return []; }
        })(),
        generacion: parseInt(localStorage.getItem('periodico_setun_generacion') || '0'),

        registrar: function(analisis) {
            // analisis = { titulo, categoria, setun, bitnet, consenso, fuentes, fecha }
            const registro = {
                titulo: (analisis.titulo || '').slice(0, 80),
                categoria: analisis.categoria || 'general',
                setun: analisis.setun || 'MANTENER',
                bitnet: analisis.bitnet || 'ROTACIÓN',
                consenso: analisis.consenso || 0,
                fuentes: analisis.fuentes || 0,
                fecha: new Date().toISOString()
            };
            this.memoria.push(registro);
            if (this.memoria.length > 100) this.memoria.shift();
            localStorage.setItem('periodico_setun_memoria', JSON.stringify(this.memoria));
            this.evolucionar();
            return this.getStats();
        },

        evolucionar: function() {
            if (this.memoria.length < 5) {
                return { precision: 0, generacion: this.generacion, total: this.memoria.length };
            }
            let coincidencias = 0;
            this.memoria.forEach(r => {
                const setun = (r.setun || '').toLowerCase();
                const bitnet = (r.bitnet || '').toLowerCase();
                const setunPos = setun.includes('comprar') || setun.includes('positivo');
                const setunNeu = setun.includes('mantener') || setun.includes('neutro');
                const setunNeg = setun.includes('vender') || setun.includes('negativo');
                const bitnetPos = bitnet.includes('élite') || bitnet.includes('galáctico') || bitnet.includes('destacado');
                const bitnetNeu = bitnet.includes('rotación') || bitnet.includes('titular');
                const bitnetNeg = bitnet.includes('descarte');
                if ((setunPos && bitnetPos) || (setunNeu && bitnetNeu) || (setunNeg && bitnetNeg)) {
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

    // ── Esperar a que el módulo del periódico esté listo ──
    let intentos = 0;
    const checkInterval = setInterval(() => {
        intentos++;
        // Detectar que el módulo ya corrió (busca algo que el módulo cree)
        const moduloListo = document.getElementById('currentDate')?.innerHTML?.length > 0
                          || window.rustWASM
                          || window.Diagnostico;

        if (moduloListo && window.SetunCore) {
            clearInterval(checkInterval);
            console.log("✅ Setun: módulo del periódico detectado. Inyectando panel...");

            // ── Panel visual ──
            const panelHTML = `
            <div id="setun-panel" style="
                position: fixed; bottom: 10px; right: 10px;
                background: #1a1a2e; color: #eee;
                border: 1px solid #0f3460; border-radius: 8px;
                padding: 12px; font-family: monospace; font-size: 12px;
                z-index: 9999; max-width: 340px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            ">
                <div style="font-weight:bold; margin-bottom:6px;">🧬 Setun 1958 — Evolución</div>
                <div id="setun-stats">Análisis: 0 | Generación: 0 | Precisión: --</div>
                <div id="setun-consenso" style="margin-top:6px; font-size:11px; color:#aaa;">Consenso: --</div>
                <button id="btn-evolucionar" style="
                    margin-top:8px; background:#0f3460; color:#fff;
                    border:none; padding:6px 10px; border-radius:4px; cursor:pointer;
                ">🔬 Recalcular</button>
                <button id="btn-reset-setun" style="
                    margin-top:8px; background:#333; color:#fff;
                    border:none; padding:6px 8px; border-radius:4px; cursor:pointer;
                ">🗑️</button>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', panelHTML);

            // ── Botón recalcular ──
            document.getElementById('btn-evolucionar').addEventListener('click', () => {
                const stats = window.AutoEvolucionNoticias.evolucionar();
                document.getElementById('setun-stats').textContent =
                    `Análisis: ${stats.total} | Generación: ${stats.generacion} | Precisión: ${stats.precision}%`;
            });

            // ── Botón reset ──
            document.getElementById('btn-reset-setun').addEventListener('click', () => {
                if (confirm('¿Resetear memoria de Setun?')) {
                    window.AutoEvolucionNoticias.reset();
                    document.getElementById('setun-stats').textContent = 'Análisis: 0 | Generación: 0 | Precisión: --';
                }
            });

            // ── Enganchar al análisis del periódico ──
            // El periódico llama a generarAnalisis(false) cada vez que analiza.
            // Vamos a "parchear" esa función para que Setun reciba los datos.
            if (typeof window.generarAnalisis === 'function') {
                const originalGenerar = window.generarAnalisis;
                window.generarAnalisis = async function(...args) {
                    const resultado = await originalGenerar.apply(this, args);
                    try {
                        // Extraer datos del resultado (ajustar según estructura real)
                        const analisis = {
                            titulo: document.querySelector('.analisis-titulo')?.textContent || 'Análisis',
                            categoria: window.currentCategory || 'general',
                            fuentes: document.querySelectorAll('.fuente-item').length || 0,
                            setun: 'MANTENER',
                            bitnet: 'ROTACIÓN',
                            consenso: 0
                        };
                        // Calcular con Setun
                        if (window.SetunCore && window.SetunConsenso) {
                            const ternario = window.SetunCore.ternario(analisis.fuentes, 2, 6);
                            analisis.setun = ternario === 1 ? 'COMPRAR' : (ternario === -1 ? 'VENDER' : 'MANTENER');
                            analisis.bitnet = analisis.fuentes > 4 ? 'ÉLITE' : (analisis.fuentes > 1 ? 'DESTACADO' : 'ROTACIÓN');
                            if (window.SetunConsenso.calcular) {
                                const cons = window.SetunConsenso.calcular({
                                    setun: analisis.setun,
                                    bitnet: analisis.bitnet,
                                    finanzas: 'NEUTRO'
                                });
                                analisis.consenso = cons.puntos || 0;
                                document.getElementById('setun-consenso').textContent =
                                    `Consenso: ${cons.puntos || 0} → ${cons.veredicto || '--'}`;
                            }
                        }
                        const stats = window.AutoEvolucionNoticias.registrar(analisis);
                        document.getElementById('setun-stats').textContent =
                            `Análisis: ${stats.total} | Generación: ${stats.generacion} | Precisión: ${stats.precision}%`;
                    } catch(e) {
                        console.warn('⚠️ Setun: error procesando análisis', e);
                    }
                    return resultado;
                };
                console.log("✅ Setun: generarAnalisis parcheado");
            } else {
                console.warn("⚠️ Setun: generarAnalisis no encontrado (¿el módulo aún no cargó?)");
            }

            // ── Cargar stats iniciales ──
            const stats = window.AutoEvolucionNoticias.getStats();
            document.getElementById('setun-stats').textContent =
                `Análisis: ${stats.total} | Generación: ${stats.generacion} | Precisión: ${stats.precision}%`;

            console.log("✅ Setun integrado en el periódico");
        }

        if (intentos >= 60) {
            clearInterval(checkInterval);
            console.warn("⚠️ Setun: timeout esperando el módulo del periódico");
        }
    }, 500);
})();
