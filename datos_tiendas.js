// Simulador de Base de Datos Geográfica de Tiendas Subway y Reviews

const tiendasSubway = [
    // --- NORTEAMÉRICA ---
    { lat: 40.7128, lng: -74.0060, pais: "Estados Unidos", ciudad: "New York", continente: "Norteamérica", calificacion: 4.5, review: "Excelente servicio rápido. El clásico de atún nunca falla.", direccion: "https://maps.google.com/?q=Subway+New+York" },
    { lat: 34.0522, lng: -118.2437, pais: "Estados Unidos", ciudad: "Los Angeles", continente: "Norteamérica", calificacion: 4.0, review: "Muy fresco, aunque a veces hay mucha fila a la hora del almuerzo.", direccion: "https://maps.google.com/?q=Subway+Los+Angeles" },
    { lat: 41.8781, lng: -87.6298, pais: "Estados Unidos", ciudad: "Chicago", continente: "Norteamérica", calificacion: 4.8, review: "Subway Series es lo mejor que les pudo pasar. El sándwich de pavo es genial.", direccion: "https://maps.google.com/?q=Subway+Chicago" },
    { lat: 43.6510, lng: -79.3470, pais: "Canadá", ciudad: "Toronto", continente: "Norteamérica", calificacion: 4.2, review: "Limpio, ordenado y el pan siempre caliente.", direccion: "https://maps.google.com/?q=Subway+Toronto" },
    
    // --- LATINOAMÉRICA ---
    { lat: 4.6097, lng: -74.0817, pais: "Colombia", ciudad: "Bogotá", continente: "Latinoamérica", calificacion: 4.7, review: "¡El nuevo menú está brutal! Los sabores de los chefs locales le dieron un giro buenísimo.", direccion: "https://maps.google.com/?q=Subway+Bogota" },
    { lat: 6.2442, lng: -75.5812, pais: "Colombia", ciudad: "Medellín", continente: "Latinoamérica", calificacion: 4.5, review: "Buenísimo para salir del apuro con algo saludable.", direccion: "https://maps.google.com/?q=Subway+Medellin" },
    { lat: 19.4326, lng: -99.1332, pais: "México", ciudad: "CDMX", continente: "Latinoamérica", calificacion: 4.1, review: "Me encanta que tienen la opción del pan de orégano parmesano. Es mi favorito.", direccion: "https://maps.google.com/?q=Subway+CDMX" },
    { lat: -23.5505, lng: -46.6333, pais: "Brasil", ciudad: "São Paulo", continente: "Latinoamérica", calificacion: 4.4, review: "O melhor para um lanche rápido. Atendimento nota 10.", direccion: "https://maps.google.com/?q=Subway+Sao+Paulo" },
    { lat: -34.6037, lng: -58.3816, pais: "Argentina", ciudad: "Buenos Aires", continente: "Latinoamérica", calificacion: 3.9, review: "Zafa para comer rápido en el centro.", direccion: "https://maps.google.com/?q=Subway+Buenos+Aires" },

    // --- EUROPA ---
    { lat: 51.5074, lng: -0.1278, pais: "Reino Unido", ciudad: "Londres", continente: "Europa", calificacion: 4.3, review: "Quick bite before the tube. Nice vegan options.", direccion: "https://maps.google.com/?q=Subway+London" },
    { lat: 48.8566, lng: 2.3522, pais: "Francia", ciudad: "París", continente: "Europa", calificacion: 4.0, review: "Sympa pour un dej rapide, même si c'est un peu cher.", direccion: "https://maps.google.com/?q=Subway+Paris" },
    { lat: 52.5200, lng: 13.4050, pais: "Alemania", ciudad: "Berlín", continente: "Europa", calificacion: 4.6, review: "Frische Zutaten, nettes Personal.", direccion: "https://maps.google.com/?q=Subway+Berlin" },
    { lat: 40.4168, lng: -3.7038, pais: "España", ciudad: "Madrid", continente: "Europa", calificacion: 4.4, review: "El teriyaki nunca decepciona, local muy limpio.", direccion: "https://maps.google.com/?q=Subway+Madrid" },
    { lat: 41.9028, lng: 12.4964, pais: "Italia", ciudad: "Roma", continente: "Europa", calificacion: 4.1, review: "Buono per un pasto veloce.", direccion: "https://maps.google.com/?q=Subway+Rome" },

    // --- ASIA / OCEANÍA ---
    { lat: 35.6762, lng: 139.6503, pais: "Japón", ciudad: "Tokio", continente: "Asia", calificacion: 4.8, review: "野菜たっぷりでとても健康的。スタッフの対応が素晴らしい。(Muchos vegetales, saludable. Gran staff)", direccion: "https://maps.google.com/?q=Subway+Tokyo" },
    { lat: 28.6139, lng: 77.2090, pais: "India", ciudad: "Nueva Delhi", continente: "Asia", calificacion: 4.2, review: "Good paneer options for vegetarians. A bit spicy which I like.", direccion: "https://maps.google.com/?q=Subway+Delhi" },
    { lat: 25.2048, lng: 55.2708, pais: "Emiratos Árabes", ciudad: "Dubái", continente: "Asia", calificacion: 4.5, review: "Perfect for lunch at the mall. Fresh and tasty.", direccion: "https://maps.google.com/?q=Subway+Dubai" },
    { lat: -33.8688, lng: 151.2093, pais: "Australia", ciudad: "Sídney", continente: "Oceanía", calificacion: 4.3, review: "Classic footlong on the go.", direccion: "https://maps.google.com/?q=Subway+Sydney" },
    
    // --- MAS PUNTOS PARA CREAR CALOR/CLUSTERING ---
    { lat: 40.7589, lng: -73.9851, pais: "Estados Unidos", ciudad: "New York", continente: "Norteamérica", calificacion: 4.1, review: "Buen lugar en Times Square.", direccion: "https://maps.google.com/?q=Subway+Times+Square" },
    { lat: 40.7306, lng: -73.9352, pais: "Estados Unidos", ciudad: "New York", continente: "Norteamérica", calificacion: 4.4, review: "Sándwiches bien hechos.", direccion: "https://maps.google.com/?q=Subway+NYC" },
    { lat: 4.6300, lng: -74.0700, pais: "Colombia", ciudad: "Bogotá", continente: "Latinoamérica", calificacion: 4.2, review: "Cerca a la universidad, siempre salva.", direccion: "https://maps.google.com/?q=Subway+Bogota" },
    { lat: 4.6500, lng: -74.0500, pais: "Colombia", ciudad: "Bogotá", continente: "Latinoamérica", calificacion: 4.6, review: "Atención rapidísima, me encanta.", direccion: "https://maps.google.com/?q=Subway+Bogota" },
    { lat: 51.5100, lng: -0.1300, pais: "Reino Unido", ciudad: "Londres", continente: "Europa", calificacion: 4.0, review: "Standard Subway.", direccion: "https://maps.google.com/?q=Subway+London" },
];
