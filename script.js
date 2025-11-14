// --- script.js ---

// Archivo en Azure Blob Storage
// CAMBIA SOLO ESTA LÍNEA si subes una nueva versión o cambias el contenedor
const URL_INTEGRAL = "https://jsonbd.blob.core.windows.net/dashboarddgecdoac/integrar.js";

// Variable global para almacenar todos nuestros datos
let datosIntegrales = {};

// Iniciar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

/**
 * Carga el archivo integral.json desde Azure Blob
 */
async function cargarDatos() {
    try {
        const response = await fetch(URL_INTEGRAL, {
            cache: "no-store"   // evita versiones guardadas en caché
        });

        if (!response.ok) {
            throw new Error(`Error al cargar integral.json: ${response.statusText}`);
        }

        datosIntegrales = await response.json();

        console.log("Datos cargados correctamente:", datosIntegrales);

        // Llenamos la lista (parte izquierda)
        popularListaContratos(datosIntegrales.contratos);

    } catch (error) {
        console.error("No se pudo cargar integral.json:", error);

        document.getElementById('lista-contratos').innerHTML =
            `<h2 class="titulo-lista" style="background-color:red;color:white;">Error al cargar datos</h2>`;

        document.getElementById('detalle-contrato').innerHTML =
            `<p>No se pudo cargar el archivo integral.json. Revisa la consola (F12) para más detalles.</p>`;
    }
}

/**
 * Llena la columna izquierda con la lista de contratos
 */
function popularListaContratos(contratos) {
    const listaNav = document.getElementById('lista-contratos');

    const idsContratos = Object.keys(contratos);

    listaNav.innerHTML = `<h2 class="titulo-lista">Contratos (${idsContratos.length})</h2>`;

    const ul = document.createElement('ul');

    idsContratos.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id;
        li.dataset.id = id;

        li.addEventListener('click', () => {
            document.querySelectorAll('#lista-contratos li.activo')
                .forEach(e => e.classList.remove('activo'));

            li.classList.add('activo');

            mostrarDetalleContrato(id);
        });

        ul.appendChild(li);
    });

    listaNav.appendChild(ul);
}

/**
 * Muestra la información del contrato seleccionado
 */
function mostrarDetalleContrato(id) {
    const detalleMain = document.getElementById('detalle-contrato');
    const contrato = datosIntegrales.contratos[id];

    if (!contrato) {
        detalleMain.innerHTML = `<p>Error: No se encontraron datos para el ID ${id}</p>`;
        return;
    }

    let html = `<h2>${id}</h2>`;

    html += renderizarSeccion("1. Detalles del Contrato", contrato.detalles);
    html += renderizarSeccion("2. Planes", contrato.planes);
    html += renderizarSeccion("3. Periodos", contrato.periodos);
    html += renderizarSeccion("4. Garantía y PMT", contrato.garantia_pmt);
    html += renderizarSeccion("5. Trámites de Terminación (PTA)", contrato.pta);
    html += renderizarSeccion("6. Contraprestaciones", contrato.contraprestaciones);

    detalleMain.innerHTML = html;
}

/**
 * Renderiza cualquier bloque del panel derecho
 */
function renderizarSeccion(titulo, datos) {
    const hayDatos = datos && (
        Array.isArray(datos) ? datos.length > 0 : Object.keys(datos).length > 0
    );

    const contenido = hayDatos
        ? `<pre>${JSON.stringify(datos, null, 2)}</pre>`
        : `<p class="no-datos">No hay datos disponibles para esta sección.</p>`;

    return `
        <div class="seccion">
            <h3>${titulo}</h3>
            ${contenido}
        </div>
    `;
}

