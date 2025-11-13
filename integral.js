// --- script: integrar.js ---
const fs = require('fs');

console.log("Iniciando integración de archivos JSON...");

try {
    // --- 1. Cargar todos los archivos ---
    const contratos = JSON.parse(fs.readFileSync('contratos.json', 'utf-8'));
    const asignaciones = JSON.parse(fs.readFileSync('asignaciones.json', 'utf-8'));
    const periodos = JSON.parse(fs.readFileSync('periodos.json', 'utf-8'));
    const garantiaPMT = JSON.parse(fs.readFileSync('GarantiayPMT.json', 'utf-8'));
    const pta = JSON.parse(fs.readFileSync('PTA.json', 'utf-8'));
    const constAsig = JSON.parse(fs.readFileSync('contraprestacionsAsiganciones.json', 'utf-8'));
    const constCont = JSON.parse(fs.readFileSync('contraprestacionesContratos.json', 'utf-8'));
    const planes = JSON.parse(fs.readFileSync('planes.json', 'utf-8'));

    console.log("Archivos cargados correctamente.");

    // --- 2. Inicializar el objeto integral ---
    let integral = {
        contratos: {},
        asignaciones: {},
        resumen_contraprestaciones_asignaciones: constAsig // Este es un resumen, se va directo
    };

    // --- 3. Procesar CONTRATOS ---
    console.log("Procesando Contratos...");
    contratos.forEach(contrato => {
        const id = contrato['ID CNH'];
        if (id) {
            // Crear la entrada base para este contrato
            integral.contratos[id] = {
                "detalles": contrato,
                "periodos": [],
                "garantia_pmt": [],
                "pta": [],
                "planes": [],
                "contraprestaciones": null // Se espera solo uno
            };
        }
    });

    // --- 4. Anidar datos relacionados a CONTRATOS ---

    // Anidar Periodos
    periodos.forEach(item => {
        const id = item.CONTRATO;
        if (integral.contratos[id]) {
            integral.contratos[id].periodos.push(item);
        }
    });

    // Anidar Garantía y PMT
    garantiaPMT.forEach(item => {
        const id = item.Contrato;
        if (integral.contratos[id]) {
            integral.contratos[id].garantia_pmt.push(item);
        }
    });

    // Anidar PTA
    pta.forEach(item => {
        const id = item.Contrato;
        if (integral.contratos[id]) {
            integral.contratos[id].pta.push(item);
        }
    });

    // Anidar Planes
    planes.forEach(item => {
        const id = item['ID Contrato'];
        if (integral.contratos[id]) {
            integral.contratos[id].planes.push(item);
        }
    });
    
    // Anidar Contraprestaciones de Contratos (asume 1 a 1)
    constCont.forEach(item => {
        const id = item.Contrato;
        if (integral.contratos[id]) {
            integral.contratos[id].contraprestaciones = item;
        }
    });

    // --- 5. Procesar ASIGNACIONES ---
    console.log("Procesando Asignaciones...");
    asignaciones.forEach(asig => {
        const id = asig['Asignación original']; // Usamos este como llave
        if (id) {
            integral.asignaciones[id] = {
                "detalles": asig
                // Nota: 'contraprestacionsAsiganciones.json' no tiene un ID para vincular aquí.
                // Por eso se dejó en la raíz del JSON.
            };
        }
    });

    // --- 6. Guardar el archivo final ---
    console.log("Guardando archivo integral.json...");
    fs.writeFileSync('integral.json', JSON.stringify(integral, null, 2));

    console.log("--- ¡Éxito! Archivo 'integral.json' generado. ---");

} catch (error) {
    console.error("Error durante la integración:", error);
}