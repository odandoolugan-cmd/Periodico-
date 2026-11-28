// integracion_setun.js — Puente entre el periódico y Setun 1958 (ADAPTADO A PERIODISMO)
(function() {
    console.log("🔌 integracion_setun.js cargado (modo periodismo)");

    // ═══════════════════════════════════════════════════════════
    // 🧬 VARIABLES DE PERIODISMO
    // ═══════════════════════════════════════════════════════════
    window.SetunPeriodismo = {

        calcularSenales: function(m) {
            const setun = [];
            setun.push(window.SetunCore.ternario(m.fuentesActivas, 2, 8));        // 1. Fuentes
            setun.push(window.SetunCore.ternario(m.diversidadFuentes, 1, 4));     // 2. APIs
            setun.push(window.SetunCore.ternario(m.frescura, 15, 3) * -1);        // 3. Frescura
            setun.push(window.SetunCore.ternario(m.densidadCitica, 2, 10));       // 4. Citas
            setun.push(window.SetunCore.ternario(m.riquezaLexica, 0.3, 0.6));     // 5. Riqueza
            setun.push(window.SetunCore.ternario(m.correcciones, 10, 2) * -1);    // 6. Correcciones
            setun.push(window.SetunCore.ternario(m.legibilidad, 30, 60));         // 7. Legibilidad (Nuevo)
            setun.push(window.SetunCore.ternario(m.coberturaCategorias, 1, 3));   // 8. Categorías (Nuevo)
            return setun;
        },
        calcular: function() {
            if (!window.SetunCore) {
                console.error("❌ SetunCore no está definido. ¿Faltó cargar setun_core.js?");
                return null;
            }
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

            // ── NUEVAS VARIABLES ──
            
            // 1. Legibilidad Real (Fórmula simplificada de Flesch-Szigriszt)
            // Contar sílabas aproximadas (vocales)
            let silabas = 0;
            palabras.forEach(p => {
                const vocales = p.match(/[aeiouáéíóúñ]/g);
                silabas += vocales ? vocales.length : 1;
            });
            const palabrasPorOracion = palabras.length / ((texto.match(/[.!?]+/g) || []).length || 1);
            const silabasPorPalabra = silabas / (palabras.length || 1);
            const legibilidad = Math.max(0, Math.min(100, 206.84 - (60.1 * silabasPorPalabra) - (1.02 * palabrasPorOracion)));

            // 2. Cobertura de Categorías (Detecta cuántos temas distintos hay)
            let coberturaCategorias = 0;
            if (texto.includes('Economía') || texto.includes('Finanzas')) coberturaCategorias++;
            if (texto.includes('Política') || texto.includes('Asamblea')) coberturaCategorias++;
            if (texto.includes('Seguridad') || texto.includes('Violencia')) coberturaCategorias++;
            if (texto.includes('Tecnología') || texto.includes('Innovación')) coberturaCategorias++;
            if (texto.includes('Sociedad') || texto.includes('Cultura')) coberturaCategorias++;

            return {
                fuentesActivas: document.querySelectorAll('.noticia-card, .news-item, .fuente-item').length || 15,
                diversidadFuentes: apis,
                frescura: frescura,
                densidadCitica: citas || 8,
                correcciones: correcciones,
                riquezaLexica: palabras.length > 0 ? (unicas.size / palabras.length) : 0.34,
                legibilidad: Math.round(legibilidad), // 0 a 100
                coberturaCategorias: coberturaCategorias || 1, // 1 a 5
                internacional: 0.5,
                sesgo: 0,
                longitud: texto.length
            };
        },
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
