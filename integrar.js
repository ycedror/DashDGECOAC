// Integración nativa 100% navegador sin Node.js ni librerías externas

async function cargarJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error cargando " + url);
    return res.json();
}

// Ejecutar integración
async function integrar() {
    try {
        const base = "https://jsonbd.blob.core.windows.net/dashboarddgecdoac/";

        // 1. Cargar todos los archivos JSON desde Azure
        const [
            contratos,
            asignaciones,
            periodos,
            garantiaPMT,
            pta,
            constAsig,
            constCont,
            planes
        ] = await Promise.all([
            cargarJSON(base + "contratos.json"),
            cargarJSON(base + "asignaciones.json"),
            cargarJSON(base + "periodos.json"),
            cargarJSON(base + "GarantiayPMT.json"),
            cargarJSON(base + "PTA.json"),
            cargarJSON(base + "contraprestacionsAsiganciones.json"),
            cargarJSON(base + "contraprestacionesContratos.json"),
            cargarJSON(base + "planes.json")
        ]);

        // 2. Construcción del objeto integral
        let integral = {
            contratos: {},
            asignaciones: {},
            resumen_contraprestaciones_asignaciones: constAsig
        };

        // 3. Procesar contratos
        contratos.forEach(c => {
            const id = c["ID CNH"];
            if (id) {
                integral.contratos[id] = {
                    detalles: c,
                    periodos: [],
                    garantia_pmt: [],
                    pta: [],
                    planes: [],
                    contraprestaciones: null
                };
            }
        });

        // 4. Anidar datos
        periodos.forEach(p => {
            if (integral.contratos[p.CONTRATO]) {
                integral.contratos[p.CONTRATO].periodos.push(p);
            }
        });

        garantiaPMT.forEach(g => {
            if (integral.contratos[g.Contrato]) {
                integral.contratos[g.Contrato].garantia_pmt.push(g);
            }
        });

        pta.forEach(t => {
            if (integral.contratos[t.Contrato]) {
                integral.contratos[t.Contrato].pta.push(t);
            }
        });

        planes.forEach(pl => {
            const id = pl["ID Contrato"];
            if (integral.contratos[id]) {
                integral.contratos[id].planes.push(pl);
            }
        });

        constCont.forEach(ct => {
            const id = ct.Contrato;
            if (integral.contratos[id]) {
                integral.contratos[id].contraprestaciones = ct;
            }
        });

        // 5. Asignaciones
        asignaciones.forEach(a => {
            const id =
                a["Asignación original"] ||
                a["AsignaciÃ³n original"];
            if (id) {
                integral.asignaciones[id] = { detalles: a };
            }
        });

        // 6. Descargar integral.json en el navegador
        const blob = new Blob([JSON.stringify(integral, null, 2)], {
            type: "application/json"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "integral.json";
        link.click();

        alert("Archivo integral.json generado y descargado.");

    } catch (err) {
        console.error(err);
        alert("Error en la integración — revisa la consola.");
    }
}

// Ejecutar automáticamente
integrar();
