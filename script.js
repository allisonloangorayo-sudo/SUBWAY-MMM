// Cambiar navbar al hacer scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Intersection Observer para las animaciones "Reveal" (KitKat style)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Opcional: Descomentar la siguiente línea si quieres que la animación ocurra solo una vez
            // observer.unobserve(entry.target);
        } else {
            // Si quieres que el elemento vuelva a desaparecer al salir del viewport
            entry.target.classList.remove('active');
        }
    });
}, observerOptions);

// Seleccionar todos los elementos a animar
const animatedElements = document.querySelectorAll('.slide-up, .fade-in, .slide-left, .slide-right');

animatedElements.forEach(el => {
    observer.observe(el);
});

// Suave scroll para links de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// --- INICIALIZACIÓN DEL MAPA GLOBAL ---
// Solo inicializar si el elemento del mapa existe
if (document.getElementById('map')) {
    // Coordenadas centrales globales iniciales
    const map = L.map('map').setView([20, 0], 2);

    // Añadir capa de mapa oscuro de CartoDB para que combine con Subway/KitKat style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Inicializar MarkerClusterGroup (Agrupación/Efecto Calor)
    const markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });

    // Función para generar estrellas HTML
    function getStarsHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fa-solid fa-star"></i>';
            } else if (i - 0.5 === rating) {
                stars += '<i class="fa-solid fa-star-half-stroke"></i>';
            } else {
                stars += '<i class="fa-regular fa-star"></i>';
            }
        }
        return stars;
    }

    // Agregar marcadores iterando sobre 'tiendasSubway' (definida en datos_tiendas.js)
    if (typeof tiendasSubway !== 'undefined') {
        tiendasSubway.forEach(tienda => {
            // Icono personalizado SVG simple
            const subwayIcon = L.divIcon({
                className: 'custom-subway-icon',
                html: `<div style="background-color: var(--subway-green); width: 24px; height: 24px; border-radius: 50%; border: 3px solid var(--subway-yellow); box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([tienda.lat, tienda.lng], { icon: subwayIcon });
            
            // Construir contenido del Popup
            const popupContent = `
                <div class="popup-content">
                    <h3>Subway ${tienda.ciudad}</h3>
                    <p><strong>${tienda.pais}</strong> - ${tienda.continente}</p>
                    <div class="stars">${getStarsHTML(tienda.calificacion)} <span>(${tienda.calificacion})</span></div>
                    <p><em>"${tienda.review}"</em></p>
                    <a href="${tienda.direccion}" target="_blank" class="route-btn">
                        <i class="fa-solid fa-location-dot"></i> Cómo llegar
                    </a>
                </div>
            `;
            
            // Vincular popup para que se abra al hacer hover (mouseover) o al hacer click
            marker.bindPopup(popupContent, { minWidth: 250 });
            
            // Abrir popup en hover, útil para pc
            marker.on('mouseover', function (e) {
                this.openPopup();
            });

            markers.addLayer(marker);
        });
    }

    // Agregar todos los agrupadores al mapa
    map.addLayer(markers);

    // --- GEOLOCALIZACIÓN: Buscar Restaurante Más Cercano ---
    document.getElementById('btn-geolocate').addEventListener('click', function() {
        if (navigator.geolocation) {
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
            navigator.geolocation.getCurrentPosition(position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Función Haversine para distancia en KM
                function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
                  var R = 6371; // Radius of the earth in km
                  var dLat = deg2rad(lat2-lat1);  // deg2rad below
                  var dLon = deg2rad(lon2-lon1); 
                  var a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2)
                    ; 
                  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                  var d = R * c; // Distance in km
                  return d;
                }
                function deg2rad(deg) { return deg * (Math.PI/180) }

                let closestStore = null;
                let minDistance = Infinity;

                if (typeof tiendasSubway !== 'undefined') {
                    tiendasSubway.forEach(store => {
                        let dist = getDistanceFromLatLonInKm(userLat, userLng, store.lat, store.lng);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestStore = store;
                        }
                    });

                    if (closestStore) {
                        map.flyTo([closestStore.lat, closestStore.lng], 15);
                        setTimeout(() => {
                            L.popup()
                                .setLatLng([closestStore.lat, closestStore.lng])
                                .setContent(`
                                    <div class="popup-content">
                                        <h3 style="color:var(--subway-green);">¡Tu restaurante más cercano!</h3>
                                        <p><strong>Subway ${closestStore.ciudad}</strong> (${minDistance.toFixed(1)} km de ti)</p>
                                        <a href="${closestStore.direccion}" target="_blank" class="route-btn">Ir a Maps</a>
                                    </div>
                                `)
                                .openOn(map);
                        }, 1500);
                    }
                }
                this.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Encontrado!';
                setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Buscar mi restaurante más cercano'; }, 3000);
            }, error => {
                alert("No se pudo obtener tu ubicación. " + error.message);
                this.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Buscar mi restaurante más cercano';
            });
        } else {
            alert("Geolocalización no soportada en este navegador.");
        }
    });
}

// --- MENÚ INTERACTIVO DATA Y LÓGICA ---
const menuData = [
    { id: 1, name: "Italian B.M.T.™", cat: "clasicos", price: 18500, veg: false, rating: 4.8, img: "img/classic_subway_sandwich_1778789827697.png", desc: "Salami, pepperoni y jamón. El clásico mundial." },
    { id: 2, name: "Pollo Teriyaki", cat: "clasicos", price: 19900, veg: false, rating: 4.9, img: "img/teriyaki_chicken_sandwich_1778789926622.png", desc: "Tiras de pollo bañadas en salsa teriyaki dulce." },
    { id: 3, name: "Subway Series: La Bestia", cat: "series", price: 25000, veg: false, rating: 5.0, img: "img/classic_subway_sandwich_1778789827697.png", desc: "Medio kilo de carne, queso doble y mucho sabor." },
    { id: 4, name: "Veggie Delite®", cat: "clasicos", price: 14500, veg: true, rating: 4.5, img: "img/veggie_sandwich_1778790301630.png", desc: "Una crujiente combinación de vegetales frescos." },
    { id: 5, name: "Combo Dúo Apanado", cat: "promociones", price: 13500, veg: false, rating: 4.6, img: "img/teriyaki_chicken_sandwich_1778789926622.png", desc: "El mejor combo apanado para compartir." },
    { id: 6, name: "Subway Series: El Jefe", cat: "series", price: 23500, veg: false, rating: 4.7, img: "img/classic_subway_sandwich_1778789827697.png", desc: "Steak y queso con vegetales salteados premium." }
];

const menuGrid = document.getElementById('menu-grid');
let currentCategory = 'todos';

function renderMenu() {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';
    
    let filtered = menuData;
    
    // Categoría
    if (currentCategory !== 'todos') {
        filtered = filtered.filter(item => item.cat === currentCategory);
    }
    
    // Dieta (Vegetariano)
    const diet = document.getElementById('filter-diet').value;
    if (diet === 'vegetariano') {
        filtered = filtered.filter(item => item.veg === true);
    }
    
    // Sort
    const sort = document.getElementById('sort-price').value;
    if (sort === 'price-asc') {
        filtered = filtered.sort((a,b) => a.price - b.price);
    } else if (sort === 'price-desc') {
        filtered = filtered.sort((a,b) => b.price - a.price);
    } else if (sort === 'rating') {
        filtered = filtered.sort((a,b) => b.rating - a.rating);
    } else {
        filtered = filtered.sort((a,b) => a.id - b.id);
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div class="menu-likes"><i class="fa-solid fa-heart"></i> ${item.rating}</div>
            <img src="${item.img}" alt="${item.name}" class="menu-img">
            <h3 class="menu-title">${item.name}</h3>
            <p class="menu-desc">${item.desc}</p>
            <div class="menu-price">$${item.price.toLocaleString('es-CO')}</div>
            <button class="btn-add">Agregar</button>
        `;
        menuGrid.appendChild(card);
    });
}

if (menuGrid) {
    renderMenu();

    // Filtros Listeners
    document.getElementById('filter-diet').addEventListener('change', renderMenu);
    document.getElementById('sort-price').addEventListener('change', renderMenu);

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-cat');
            renderMenu();
        });
    });
}

// --- SOCIAL LISTENING LOGIC ---
const socialData = {
    instagram: { vol: "2.5M", likes: "45K", sent: "Positivo (85%)", topic: "Visuales de comida (Foodporn), Subway Series" },
    tiktok: { vol: "4.8M", likes: "120K", sent: "Mixto (60%)", topic: "Challenges, Reviews de influencers" },
    youtube: { vol: "1.5M", likes: "80K", sent: "Positivo (90%)", topic: "Lanzamientos Oficiales, TV Ads (Subway Series)" },
    twitter: { vol: "800K", likes: "5K", sent: "Crítico (45%)", topic: "Servicio al cliente, Novedades, Funas" },
    facebook: { vol: "1.2M", likes: "20K", sent: "Positivo (75%)", topic: "Promociones familiares, Cupones locales" }
};

function showSocialData(platform) {
    const sd = document.getElementById('social-dashboard');
    sd.classList.add('active');
    document.getElementById('sd-title').innerHTML = `Métricas Exclusivas Subway: <span style="color:var(--white); text-transform:uppercase;">${platform}</span>`;
    document.getElementById('sd-vol').innerText = socialData[platform].vol;
    document.getElementById('sd-likes').innerText = socialData[platform].likes;
    document.getElementById('sd-sent').innerText = socialData[platform].sent;
    document.getElementById('sd-topic').innerText = socialData[platform].topic;
}
// Attach to window so onclick works
window.showSocialData = showSocialData;


// --- CAROUSEL PROMOCIONES ---
const track = document.querySelector('.carousel-track');
if (track) {
    // Generar 10 slides (usaremos imágenes simuladas basadas en los assets que tenemos para llenar el requerimiento)
    const imgs = [
        "img/classic_subway_sandwich_1778789827697.png",
        "img/teriyaki_chicken_sandwich_1778789926622.png",
        "img/veggie_sandwich_1778790301630.png",
        "img/vintage_sandwich_shop_1778789769248.png",
        "img/classic_subway_sandwich_1778789827697.png",
        "img/teriyaki_chicken_sandwich_1778789926622.png",
        "img/veggie_sandwich_1778790301630.png",
        "img/classic_subway_sandwich_1778789827697.png",
        "img/teriyaki_chicken_sandwich_1778789926622.png",
        "img/veggie_sandwich_1778790301630.png"
    ];

    imgs.forEach(src => {
        const li = document.createElement('li');
        li.className = 'carousel-slide';
        li.innerHTML = `<img src="${src}" class="carousel-img" alt="Promoción Subway">`;
        track.appendChild(li);
    });

    const slides = Array.from(track.children);
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    let currentIndex = 0;

    function moveToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        currentIndex = index;
    }

    nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));

    // Auto rotate every 30 seconds
    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 30000);
}

// --- ENCUESTA EN TIEMPO REAL & CHART.JS ---

// Inicializar datos de encuesta (Simulación de DB)
let surveyResults = JSON.parse(localStorage.getItem('subwaySurvey')) || {
    excelente: 45, buena: 30, regular: 15, mala: 10
};

let surveyChartInstance = null;

// Inicializar Chart de Encuesta
const ctxSurvey = document.getElementById('surveyChart');
if (ctxSurvey) {
    surveyChartInstance = new Chart(ctxSurvey, {
        type: 'doughnut',
        data: {
            labels: ['Excelente', 'Buena', 'Regular', 'Mala'],
            datasets: [{
                data: [surveyResults.excelente, surveyResults.buena, surveyResults.regular, surveyResults.mala],
                backgroundColor: ['#008C15', '#fcc900', '#f39c12', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: 'white' } }
            }
        }
    });
}

// Lógica de formulario de encuesta
const surveyForm = document.getElementById('survey-form');
if (surveyForm) {
    surveyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const opinion = document.getElementById('survey-opinion').value;
        if(opinion && surveyResults[opinion] !== undefined) {
            surveyResults[opinion] += 1;
            localStorage.setItem('subwaySurvey', JSON.stringify(surveyResults));
            
            // Actualizar Chart en vivo
            if(surveyChartInstance) {
                surveyChartInstance.data.datasets[0].data = [
                    surveyResults.excelente, 
                    surveyResults.buena, 
                    surveyResults.regular, 
                    surveyResults.mala
                ];
                surveyChartInstance.update();
            }
            
            this.style.display = 'none';
            document.getElementById('survey-thanks').style.display = 'block';
        }
    });
}

// --- CARGAR Y RENDERIZAR NUEVO MMM DASHBOARD ---
function renderMMMCharts() {
    if (typeof mmmData === 'undefined') {
        console.error("Los datos de MMM no están disponibles. Asegúrate de que mmm_data.js esté cargado.");
        return;
    }
    
    const data = mmmData;
    Chart.defaults.color = '#fff';
    Chart.defaults.font.family = 'Inter';

    const t = data.trends;

    // CAPÍTULO 1: Evolución Semanal
    const ctxCap1Line = document.getElementById('cap1LineChart');
    if (ctxCap1Line) {
        new Chart(ctxCap1Line, {
            type: 'line',
            data: {
                labels: t.dates,
                datasets: [
                    { label: 'Subway', data: t.subway, borderColor: '#008C15', backgroundColor: 'rgba(0,140,21,0.2)', fill: true, tension: 0.3, borderWidth: 3 },
                    { label: "McDonald's", data: t.mcdonalds, borderColor: '#FFC72C', tension: 0.3, borderWidth: 2 },
                    { label: 'Burger King', data: t.burgerking, borderColor: '#f39c12', tension: 0.3, borderWidth: 2 },
                    { label: 'KFC', data: t.kfc, borderColor: '#E31837', tension: 0.3, borderWidth: 2 },
                    { label: 'Starbucks', data: t.starbucks, borderColor: '#00704A', tension: 0.3, borderWidth: 2 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { x: { ticks: { maxTicksLimit: 10 } } }
            }
        });
    }

    // CAPÍTULO 1: Share of Search Area
    const ctxCap1Area = document.getElementById('cap1AreaChart');
    if (ctxCap1Area) {
        new Chart(ctxCap1Area, {
            type: 'line',
            data: {
                labels: t.dates,
                datasets: [
                    { label: 'Subway SOS', data: t.sos_subway.map(x => x*100), backgroundColor: '#008C15', fill: 'origin', tension: 0.3 },
                    { label: 'McDonalds SOS', data: t.sos_mcdonalds.map(x => x*100), backgroundColor: '#FFC72C', fill: '-1', tension: 0.3 }
                ]
            },
            options: {
                scales: { y: { stacked: true, max: 100 } }
            }
        });
    }

    // CAPÍTULO 2: Inversión (Simulada de los insights para la gráfica)
    const ctxCap2Bar = document.getElementById('cap2BarChart');
    if (ctxCap2Bar) {
        new Chart(ctxCap2Bar, {
            type: 'bar',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
                datasets: [
                    { label: "McDonald's", data: [11600, 12000, 11800, 11900], backgroundColor: '#FFC72C' },
                    { label: 'KFC', data: [13600, 13000, 14000, 13800], backgroundColor: '#E31837' },
                    { label: 'Subway', data: [4900, 5000, 5100, 5500], backgroundColor: '#008C15' }
                ]
            },
            options: {
                color: '#333',
                scales: { x: { ticks: { color: '#333' } }, y: { ticks: { color: '#333' } } },
                plugins: { legend: { labels: { color: '#333' } } }
            }
        });
    }

    const ctxCap2Radar = document.getElementById('cap2RadarChart');
    if (ctxCap2Radar) {
        new Chart(ctxCap2Radar, {
            type: 'radar',
            data: {
                labels: ['Facebook', 'Instagram', 'YouTube', 'Portales', 'Programmatic'],
                datasets: [
                    { label: 'Subway', data: [60, 30, 5, 5, 0], borderColor: '#008C15', backgroundColor: 'rgba(0,140,21,0.4)' },
                    { label: "McDonald's", data: [40, 20, 25, 10, 5], borderColor: '#FFC72C', backgroundColor: 'rgba(255,199,44,0.4)' }
                ]
            },
            options: {
                color: '#333',
                scales: { r: { pointLabels: { color: '#333', font: { size: 12 } } } },
                plugins: { legend: { labels: { color: '#333' } } }
            }
        });
    }

    // CAPÍTULO 3: Contribución MMM
    const ctxCap3Contrib = document.getElementById('cap3ContribChart');
    if (ctxCap3Contrib) {
        new Chart(ctxCap3Contrib, {
            type: 'bar',
            data: {
                labels: t.dates,
                datasets: [
                    { label: 'Efecto Adstock Digital', data: t.subway.map(x => x * 0.4), backgroundColor: '#008C15' },
                    { label: 'Efecto Tradicional', data: t.subway.map(x => x * 0.2), backgroundColor: '#FFC72C' },
                    { label: 'Base / Otros', data: t.subway.map(x => x * 0.4), backgroundColor: '#555' }
                ]
            },
            options: {
                scales: { x: { stacked: true, ticks: { maxTicksLimit: 10 } }, y: { stacked: true } }
            }
        });
    }

    // Resumen del modelo
    const modelDiv = document.getElementById('cap3ModelSummary');
    if (modelDiv) {
        const c = data.model.coefs;
        modelDiv.innerHTML = `
            <ul style="list-style:none; padding:0;">
                <li style="margin-bottom: 10px;"><strong>R² Ajustado:</strong> ${(data.model.r2_adj * 100).toFixed(1)}%</li>
                <li style="margin-bottom: 10px;"><strong>Impacto Digital (Adstock):</strong> <span style="color:#008C15">+${c.adstock_digital ? c.adstock_digital.toFixed(3) : 0} pts</span> por cada millón invertido.</li>
                <li style="margin-bottom: 10px;"><strong>Impacto Tradicional:</strong> <span style="color:#FFC72C">${c.adstock_tradicional ? c.adstock_tradicional.toFixed(3) : 0} pts</span></li>
                <li style="margin-bottom: 10px;"><strong>Presión Competitiva:</strong> <span style="color:#E31837">${c.presion_competitiva ? c.presion_competitiva.toFixed(3) : 0} pts</span> (Efecto del dominio de competidores)</li>
            </ul>
        `;
    }

    // CAPÍTULO 4: Perceptual Map
    const ctxCap4Scatter = document.getElementById('cap4ScatterChart');
    if (ctxCap4Scatter) {
        new Chart(ctxCap4Scatter, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'Subway (Actual)', data: [{x: 2, y: 5}], backgroundColor: '#008C15', pointRadius: 15 },
                    { label: 'Espacio: Healthy Convenience', data: [{x: 8, y: 8}], backgroundColor: 'rgba(0,140,21,0.3)', pointRadius: 40, pointHoverRadius: 40 },
                    { label: "McDonald's", data: [{x: -5, y: -8}], backgroundColor: '#FFC72C', pointRadius: 20 },
                    { label: 'KFC', data: [{x: -6, y: -6}], backgroundColor: '#E31837', pointRadius: 18 }
                ]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'Indulgente <------> Saludable / Funcional', color: '#fff' }, min: -10, max: 10 },
                    y: { title: { display: true, text: 'Rápido <------> Experiencia', color: '#fff' }, min: -10, max: 10 }
                }
            }
        });
    }

    // CAPÍTULO 5: Escenarios
    const ctxCap5Bar = document.getElementById('cap5BarChart');
    if (ctxCap5Bar) {
        const s = data.scenarios;
        new Chart(ctxCap5Bar, {
            type: 'bar',
            data: {
                labels: ['Escenario 1 (Base)', 'Escenario 2 (+30% Digital)', 'Escenario 3 (Ataque McD)', 'Escenario 4 (Posicionamiento)'],
                datasets: [{
                    label: 'Índice de Búsqueda Proyectado',
                    data: [s.base, s.scen2, s.scen3, s.scen4],
                    backgroundColor: ['#555', '#008C15', '#E31837', '#fcc900']
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

// Inicializar al cargar
setTimeout(renderMMMCharts, 500);

