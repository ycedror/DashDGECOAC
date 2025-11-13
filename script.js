// --- script.js ---

// Variable global para almacenar todos nuestros datos
let datosIntegrales = {};

// 1. Iniciar todo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

/**
 * Carga el archivo integral.json
 */
async function cargarDatos() {
    try {
        const response = await fetch('https://jsonbd.blob.core.windows.net/dashboarddgecdoac/integral.js');
        if (!response.ok) {
            throw new Error(`Error al cargar integral.json: ${response.statusText}`);
        }
        datosIntegrales = await response.json();
        
        console.log("Datos cargados:", datosIntegrales);
        
        // Una vez cargados los datos, llenamos la lista de contratos
        popularListaContratos(datosIntegrales.contratos);

    } catch (error) {
        console.error(error);
        document.getElementById('lista-contratos').innerHTML = `<h2 class="titulo-lista" style="background-color: red;">Error al cargar datos</h2>`;
        document.getElementById('detalle-contrato').innerHTML = `<p>No se pudo cargar el archivo integral.json. Revisa la consola (F12) para más detalles.</p>`;
    }
}

/**
 * Llena la columna izquierda (Maestro) con la lista de contratos
 */
function popularListaContratos(contratos) {
    const listaNav = document.getElementById('lista-contratos');
    
    // Obtenemos todos los IDs de los contratos
    const idsContratos = Object.keys(contratos);
    
    listaNav.innerHTML = ''; // Limpiamos el "Cargando..."
    listaNav.innerHTML += `<h2 class="titulo-lista">Contratos (${idsContratos.length})</h2>`;

    const listaUl = document.createElement('ul');
    
    idsContratos.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id;
        li.dataset.id = id; // Guardamos el ID para identificar el clic
        
        // AÑADIMOS EL EVENTO DE CLIC
        li.addEventListener('click', () => {
            // Limpiamos la clase 'activo' de cualquier otro elemento
            document.querySelectorAll('#lista-contratos li.activo').forEach(item => {
                item.classList.remove('activo');
            });
            // Añadimos la clase 'activo' al que clicamos
            li.classList.add('activo');
            
            // Mostramos los detalles de ESE contrato
            mostrarDetalleContrato(id);
        });
        
        listaUl.appendChild(li);
    });

    listaNav.appendChild(listaUl);
}

/**
 * Muestra la información del contrato seleccionado en la columna derecha (Detalle)
 */
function mostrarDetalleContrato(id) {
    const detalleMain = document.getElementById('detalle-contrato');
    const contrato = datosIntegrales.contratos[id];

    if (!contrato) {
        detalleMain.innerHTML = `<p>Error: No se encontraron datos para el ID ${id}</p>`;
        return;
    }

    // Construimos el HTML para el panel de detalle
    // Aquí usamos la función renderizarSeccion para cada bloque de datos
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
 * Función Ayudante (Helper) para crear cada "caja" de sección.
 * Muestra los datos en formato JSON (<pre>) para mantener la discretización.
 */
function renderizarSeccion(titulo, datos) {
    let contenido = '';
    
    // Verificamos si hay datos
    const hayDatos = (datos && (Array.isArray(datos) ? datos.length > 0 : Object.keys(datos).length > 0));

    if (hayDatos) {
        // Convertimos el objeto/array a un string JSON formateado
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
