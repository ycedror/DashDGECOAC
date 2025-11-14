// --- script.js ---
// Código 100% JavaScript puro sin Node ni librerías externas

// URL pública del archivo integral.json en Azure Blob Storage
// REEMPLAZA ESTA LÍNEA CON TU URL REAL:
const URL_INTEGRAL_JSON = "https://jsonbd.blob.core.windows.net/dashboarddgecdoac/integral.json";

// Variable global para almacenar todos nuestros datos
let datosIntegrales = {};

// 1. Iniciar todo cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
});

/**
 * Carga el archivo integral.json directamente desde Azure Blob Storage
 */
async function cargarDatos() {
    try {
        const response = await fetch(URL_INTEGRAL_JSON);

        if (!response.ok) {
            throw new Error(`Error al cargar integral.json: ${response.statusText}`);
        }

        datosIntegrales = await response.json();

        console.log("Datos cargados:", datosIntegrales);

        // Llenamos la lista de contratos
        popularListaContratos(datosIntegrales.contratos);

    } catch (error) {
        console.error(error);

        document.getElementById("lista-contratos").innerHTML =
            `<h2 class="titulo-lista" style="background-color: red;">Error al cargar datos</h2>`;

        document.getElementById("detalle-contrato").innerHTML =
            `<p>No se pudo cargar el archivo integral.json. Revisa la consola (F12) para más detalles.</p>`;
    }
}

/**
 * Llena la columna izquierda con la lista de contratos
 */
function popularListaContratos(contratos) {
    const listaNav = document.getElementById("lista-contratos");

    const idsContratos = Object.keys(contratos);

    listaNav.innerHTML = "";
    listaNav.innerHTML += `<h2 class="titulo-lista">Contratos (${idsContratos.length})</h2>`;

    const listaUl = document.createElement("ul");

    idsContratos.forEach(id => {
        const li = document.createElement("li");
        li.textContent = id;
        li.dataset.id = id;

        // Evento clic para seleccionar contrato
        li.addEventListener("click", () => {
            document.querySelectorAll("#lista-contratos li.activo")
                .forEach(item => item.classList.remove("activo"));

            li.classList.add("activo");

            mostrarDetalleContrato(id);
        });

        listaUl.appendChild(li);
    });

    listaNav.appendChild(listaUl);
}

/**
 * Muestra en el panel derecho los detalles del contrato seleccionado
 */
function mostrarDetalleContrato(id) {
    const detalleMain = document.getElementById("detalle-contrato");
    const contrato = datosIntegrales.contratos[id];

    if (!contrato) {
        detalleMain.innerHTML = `<p>Error: No se encontraron datos para el ID ${id}</p>`;
        return;
    }

    let htmlDetalle = `<h2>${id}</h2>`;

    htmlDetalle += renderizarSeccion("1. Detalles del Contrato", contrato.detalles);
    htmlDetalle += renderizarSeccion("2. Planes", contrato.planes);
    htmlDetalle += renderizarSeccion("3. Periodos", contrato.periodos);
    htmlDetalle += renderizarSeccion("4. Garantía y PMT", contrato.garantia_pmt);
    htmlDetalle += renderizarSeccion("5. Trámites de Terminación (PTA)", contrato.pta);
    htmlDetalle += renderizarSeccion("6. Contraprestaciones", contrato.contraprestaciones);

    detalleMain.innerHTML = htmlDetalle;
}

/**
 * Crea visualmente una sección del detalle del contrato
 */
function renderizarSeccion(titulo, datos) {
    let contenido = "";

    const hayDatos = (datos && (Array.isArray(datos) ? datos.length > 0 : Object.keys(datos).length > 0));

    if (hayDatos) {
        const datosFormateados = JSON.stringify(datos, null, 2);
        contenido = `<pre>${datosFormateados}</pre>`;
    } else {
        contenido = `<p class="no-datos">No hay datos disponibles para esta sección.</p>`;
    }

    return `
        <div class="seccion">
            <h3>${titulo}</h3>
            ${contenido}
        </div>
    `;
}

