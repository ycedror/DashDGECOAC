// --- script.js ---
// URL del archivo JSON integrado en Azure Blob Storage
const URL_INTEGRAL = "https://jsonbd.blob.core.windows.net/dashboarddgecdoac/integral.json";

// Variable global con todos los datos
let datosIntegrales = {};

// Iniciar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
});

/**
 *  Cargar integral.json desde Azure
 */
async function cargarDatos() {
    try {
        const response = await fetch(URL_INTEGRAL, { cache: "no-store" });

        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo integral.json");
        }

        datosIntegrales = await response.json();

        console.log("✔ Datos cargados:", datosIntegrales);

        popularListaContratos(datosIntegrales.contratos);

    } catch (error) {
        console.error(error);
        document.getElementById("lista-contratos").innerHTML =
            `<h2 class="titulo-lista" style="background:red;color:white;">Error cargando datos</h2>`;
        
        document.getElementById("detalle-contrato").innerHTML =
            `<p>No se pudo cargar integral.json. Revisa la consola (F12).</p>`;
    }
}

/**
 * Llena la lista izquierda con IDs de contratos
 */
function popularListaContratos(contratos) {
    const contenedor = document.getElementById("lista-contratos");
    const ids = Object.keys(contratos);

    contenedor.innerHTML = `<h2 class="titulo-lista">Contratos (${ids.length})</h2>`;

    const ul = document.createElement("ul");

    ids.forEach(id => {
        const li = document.createElement("li");
        li.textContent = id;
        li.dataset.id = id;

        li.addEventListener("click", () => {

            document.querySelectorAll("#lista-contratos li.activo")
                .forEach(item => item.classList.remove("activo"));

            li.classList.add("activo");

            mostrarDetalleContrato(id);
        });

        ul.appendChild(li);
    });

    contenedor.appendChild(ul);
}

/**
 * Muestra panel derecho con la información del contrato
 */
function mostrarDetalleContrato(id) {
    const contenedor = document.getElementById("detalle-contrato");
    const contrato = datosIntegrales.contratos[id];

    if (!contrato) {
        contenedor.innerHTML = `<p>Error: No existe el ID ${id}</p>`;
        return;
    }

    let html = `<h2>${id}</h2>`;

    html += renderizarSeccion("1. Detalles del Contrato", contrato.detalles);
    html += renderizarSeccion("2. Planes", contrato.planes);
    html += renderizarSeccion("3. Periodos", contrato.periodos);
    html += renderizarSeccion("4. Garantía y PMT", contrato.garantia_pmt);
    html += renderizarSeccion("5. Trámites de Terminación (PTA)", contrato.pta);
    html += renderizarSeccion("6. Contraprestaciones", contrato.contraprestaciones);

    contenedor.innerHTML = html;
}

/**
 * Renderiza cajas del panel derecho
 */
function renderizarSeccion(titulo, datos) {
    let contenido = "";

    const tieneDatos =
        datos &&
        (Array.isArray(datos) ? datos.length > 0 : Object.keys(datos).length > 0);

    if (tieneDatos) {
        contenido = `<pre>${JSON.stringify(datos, null, 2)}</pre>`;
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
