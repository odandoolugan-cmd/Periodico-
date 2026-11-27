// integracion_setun.js — Puente entre el periódico y Setun 1958 (ADAPTADO A PERIODISMO)
(function() {
    console.log("🔌 integracion_setun.js cargado (modo periodismo)");

    // ═══════════════════════════════════════════════════════════
    // 🧬 VARIABLES DE PERIODISMO
    // ═══════════════════════════════════════════════════════════
    window.SetunPeriodismo = {
        extraerMetricas: function() {
            const texto = document.body.innerText || '';
            const palabras = texto.toLowerCase().match(/\b[a-záéíóúñ]+\b/g) || [];
            const unicas = new Set(palabras);
            const citas = (texto.match(/["“«][^"”»]+["”»]/g) || []).length;
            
            const log = document.getElementById('diagnosticoLog')?.innerText || '';
            const apis = (log.match(/✅ (Wikipedia|Hacker News|Reddit|GDELT)/g) || []).length || 2;
            const correcciones = (log.match(/✏️.*correcciones/g) || []).length;
            
            let frescura = 0; 
            const fechaMatch = texto.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
            if (fechaMatch) {
                try {
                    const fechaNoticia = new Date(fechaMatch[3], fechaMatch[2]-1, fechaMatch[1]);
                    const hoy = new Date();
                    frescura = Math.min(30, Math.max(0, Math.floor((hoy - fechaNoticia) / (1000*60*60*24))));
                } catch(e) { frescura = 0; }
            } else {
                frescura = 0;
            }

            return {
                fuentesActivas: document.querySelectorAll('.noticia-card, .news-item, .fuente-item').length || 15,
                diversidadFuentes: apis,
                frescura: frescura,
                densidadCitica: citas || 8,
                correcciones: correcciones,
                riquezaLexica: palabras.length > 0 ? (unicas.size / palabras.length) : 0.34,
                legibilidad: 50,
                coberturaCategorias: 3,
                internacional: 0.5,
                sesgo: 0,
                longitud: texto.length
            };
        },

        calcularSenales: function(m) {
            const setun = [];
            setun.push(window.SetunCore.ternario(m.fuentesActivas, 2, 8));
            setun.push(window.SetunCore.ternario(m.diversidadFuentes, 1, 4));
            setun.push(window.SetunCore.ternario(m.frescura, 15, 3) * -1);
            setun.push(window.SetunCore.ternario(m.densidadCitica, 2, 10));
            setun.push(window.SetunCore.ternario(m.riquezaLexica, 0.3, 0.6));
            setun.push(window.SetunCore.ternario(m.correcciones, 10, 2) * -1);
            return setun;
        },

        calcular: function() {
            if (!window.SetunCore) {
                console.error("❌ SetunCore no está definido. ¿Faltó cargar setun_core.js?");
                return null;
            }
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

            const jugadorAdaptado = {
                overall: m.fuentesActivas * 4,
                goals: m.densidadCitica,
                assists: m.diversidadFuentes,
                pace: 100 - m.frescura,
                defending: m.correcciones === 0 ? 80 : 40
            };
            const bitnet = window.SetunCore.inferenciaBitNet(jugadorAdaptado);

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

    window.AutoEvolucionNoticias = {
        memoria: (() => {
            try { return JSON.parse(localStorage.getItem('periodico_setun_memoria') || '[]'); }
            catch(e) { return []; }
        })(),
        generacion: parseInt(localStorage.getItem('periodico_setun_generacion') || '0'),

        registrar: function(resultadoSetun) {
            if (!resultadoSetun) return;
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
    
    console.log("✅ SetunPeriodismo y AutoEvolucionNoticias listos.");
})();
