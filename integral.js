// --- script: integrar.js ---
// Versión para cargar TODOS los JSON desde Azure Blob Storage

import fs from 'fs';
import fetch from 'node-fetch';

console.log("Iniciando integración de archivos JSON desde Azure Blob Storage...");

async function cargarJSON(url) {
    console.log(`Cargando: ${url}`);
    const response = await fetch(url);
    if (!response.ok)        throw new Error(`Error al cargar ${url}: ${response.statusText}`);
    return await response.json();
}

async function ejecutar() {
    try {
        // -----------------------------
        // 1. Cargar todos los archivos JSON desde Azure Blob Storage
        // -----------------------------

        const base = "https://jsonbd.blob.core.windows.net/dashboarddgecdoac/";

        const contratos        = await cargarJSON(base + "contratos.json");
        const asignaciones     = await cargarJSON(base + "asignaciones.json");
        const periodos         = await cargarJSON(base + "periodos.json");
        const garantiaPMT      = await cargarJSON(base + "GarantiayPMT.json");
        const pta              = await cargarJSON(base + "PTA.json");
        const constAsig        = await cargarJSON(base + "contraprestacionsAsiganciones.json");
        const constCont        = await cargarJSON(base + "contraprestacionesContratos.json");
        const planes           = await cargarJSON(base + "planes.json");

        console.log("✔ Todos los archivos cargados correctamente desde Azure.");

        // -----------------------------
        // 2. Inicializar el archivo integral
        // -----------------------------

        let integral = {
            contratos: {},
            asignaciones: {},
            resumen_contraprestaciones_asignaciones: constAsig
        };

        // -----------------------------
        // 3. Procesar CONTRATOS
        // -----------------------------
        console.log("Procesando Contratos...");

        contratos.forEach(contrato => {
            const id = contrato['ID CNH'];
            if (id) {
                integral.contratos[id] = {
                    detalles: contrato,
                    periodos: [],
                    garantia_pmt: [],
                    pta: [],
                    planes: [],
                    contraprestaciones: null
                };
            }
        });

        // -----------------------------
        // 4. Anidar información relacionada a CONTRATOS
        // -----------------------------

        // Periodos
        periodos.forEach(item => {
            const id = item.CONTRATO;
            if (integral.contratos[id]) {
                integral.contratos[id].periodos.push(item);
            }
        });

        // Garantía y PMT
        garantiaPMT.forEach(item => {
            const id = item.Contrato;
            if (integral.contratos[id]) {
                integral.contratos[id].garantia_pmt.push(item);
            }
        });

        // PTA
        pta.forEach(item => {
            const id = item.Contrato;
            if (integral.contratos[id]) {
                integral.contratos[id].pta.push(item);
            }
        });

        // Planes
        planes.forEach(item => {
            const id = item['ID Contrato'];
            if (integral.contratos[id]) {
                integral.contratos[id].planes.push(item);
            }
        });

        // Contraprestaciones (1 a 1)
        constCont.forEach(item => {
            const id = item.Contrato;
            if (integral.contratos[id]) {
                integral.contratos[id].contraprestaciones = item;
            }
        });

        // -----------------------------
        // 5. Procesar ASIGNACIONES
        // -----------------------------
        console.log("Procesando Asignaciones...");

        asignaciones.forEach(asig => {
            const id = asig['Asignación original'] || asig['Asignación original'.normalize()] || asig['AsignaciÃ³n original']; 
            if (id) {
                integral.asignaciones[id] = {
                    detalles: asig
                };
            }
        });

        // -----------------------------
        // 6. Guardar archivo integral.json
        // -----------------------------
        console.log("Guardando archivo integral.json...");

        fs.writeFileSync('integral.json', JSON.stringify(integral, null, 2));

        console.log("✔ Éxito: Archivo 'integral.json' generado correctamente.");

    } catch (error) {
        console.error("❌ Error durante la integración:", error);
    }
}

// Ejecutar
ejecutar();
