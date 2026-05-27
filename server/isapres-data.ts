export interface IsaprePlan {
  nombre: string;
  precio_uf: number;
  cobertura_ambulatorio: string;
  cobertura_hospitalario: string;
  cobertura_dental: boolean;
  tope_anual_uf: number;
  descripcion: string;
}

export interface Isapre {
  nombre: string;
  rut: string;
  telefono: string;
  web: string;
  descripcion: string;
  regiones: string[];
  planes: IsaprePlan[];
  ventajas: string[];
  desventajas: string[];
  calificacion: number;
}

export const isapresData: Isapre[] = [
  {
    nombre: "Banmédica",
    rut: "96.532.950-9",
    telefono: "600 600 2626",
    web: "https://www.banmedica.cl",
    descripcion: "Una de las Isapres más grandes de Chile, con amplia red de prestadores y cobertura nacional.",
    regiones: ["Todas las regiones de Chile"],
    calificacion: 4.2,
    ventajas: [
      "Amplia red de clínicas y médicos",
      "Cobertura en todo Chile",
      "App móvil completa",
      "Atención preferencial en Clínica Santa María y Clínica Vespucio",
    ],
    desventajas: [
      "Precios más altos que el promedio",
      "Tiempos de espera en algunos servicios",
    ],
    planes: [
      {
        nombre: "Plan Básico",
        precio_uf: 2.5,
        cobertura_ambulatorio: "70%",
        cobertura_hospitalario: "80%",
        cobertura_dental: false,
        tope_anual_uf: 200,
        descripcion: "Plan de entrada con coberturas esenciales",
      },
      {
        nombre: "Plan Estándar",
        precio_uf: 4.2,
        cobertura_ambulatorio: "80%",
        cobertura_hospitalario: "90%",
        cobertura_dental: true,
        tope_anual_uf: 350,
        descripcion: "Plan intermedio con dental incluido",
      },
      {
        nombre: "Plan Premium",
        precio_uf: 7.8,
        cobertura_ambulatorio: "90%",
        cobertura_hospitalario: "95%",
        cobertura_dental: true,
        tope_anual_uf: 600,
        descripcion: "Cobertura máxima con beneficios adicionales",
      },
    ],
  },
  {
    nombre: "Colmena Golden Cross",
    rut: "96.539.100-2",
    telefono: "600 600 2000",
    web: "https://www.colmena.cl",
    descripcion: "Isapre con fuerte presencia en Santiago y regiones, reconocida por su servicio al cliente.",
    regiones: ["Todas las regiones de Chile"],
    calificacion: 4.0,
    ventajas: [
      "Buen servicio al cliente",
      "Precios competitivos",
      "Amplia red de prestadores",
      "Planes flexibles",
    ],
    desventajas: [
      "Cobertura dental limitada en planes básicos",
      "Tiempos de reembolso variables",
    ],
    planes: [
      {
        nombre: "Plan Básico Colmena",
        precio_uf: 2.2,
        cobertura_ambulatorio: "70%",
        cobertura_hospitalario: "80%",
        cobertura_dental: false,
        tope_anual_uf: 180,
        descripcion: "Plan accesible para personas sanas",
      },
      {
        nombre: "Plan Familiar",
        precio_uf: 5.5,
        cobertura_ambulatorio: "85%",
        cobertura_hospitalario: "90%",
        cobertura_dental: true,
        tope_anual_uf: 400,
        descripcion: "Ideal para familias con niños",
      },
      {
        nombre: "Plan Ejecutivo",
        precio_uf: 9.0,
        cobertura_ambulatorio: "95%",
        cobertura_hospitalario: "97%",
        cobertura_dental: true,
        tope_anual_uf: 800,
        descripcion: "Cobertura total para ejecutivos",
      },
    ],
  },
  {
    nombre: "Cruz Blanca",
    rut: "96.506.530-8",
    telefono: "600 600 2800",
    web: "https://www.cruzblanca.cl",
    descripcion: "Isapre con larga trayectoria, parte del grupo Bupa, con estándares internacionales.",
    regiones: ["Todas las regiones de Chile"],
    calificacion: 4.1,
    ventajas: [
      "Estándares internacionales Bupa",
      "Cobertura internacional disponible",
      "Excelente red de clínicas",
      "Tecnología digital avanzada",
    ],
    desventajas: [
      "Precios elevados",
      "Burocracia en algunos procesos",
    ],
    planes: [
      {
        nombre: "Plan Salud 70",
        precio_uf: 3.0,
        cobertura_ambulatorio: "70%",
        cobertura_hospitalario: "80%",
        cobertura_dental: false,
        tope_anual_uf: 220,
        descripcion: "Plan con 70% de cobertura general",
      },
      {
        nombre: "Plan Salud 80",
        precio_uf: 5.0,
        cobertura_ambulatorio: "80%",
        cobertura_hospitalario: "90%",
        cobertura_dental: true,
        tope_anual_uf: 380,
        descripcion: "Plan con 80% de cobertura y dental",
      },
      {
        nombre: "Plan Salud 90",
        precio_uf: 8.5,
        cobertura_ambulatorio: "90%",
        cobertura_hospitalario: "95%",
        cobertura_dental: true,
        tope_anual_uf: 700,
        descripcion: "Cobertura premium con beneficios internacionales",
      },
    ],
  },
  {
    nombre: "Consalud",
    rut: "96.591.040-0",
    telefono: "600 600 2700",
    web: "https://www.consalud.cl",
    descripcion: "Una de las Isapres más grandes de Chile en número de afiliados, con precios accesibles.",
    regiones: ["Todas las regiones de Chile"],
    calificacion: 3.8,
    ventajas: [
      "Precios muy competitivos",
      "Gran cantidad de prestadores",
      "Planes para todos los presupuestos",
      "Cobertura nacional amplia",
    ],
    desventajas: [
      "Servicio al cliente mejorable",
      "Procesos de reembolso lentos en algunos casos",
    ],
    planes: [
      {
        nombre: "Plan Básico Consalud",
        precio_uf: 1.9,
        cobertura_ambulatorio: "65%",
        cobertura_hospitalario: "75%",
        cobertura_dental: false,
        tope_anual_uf: 150,
        descripcion: "El plan más económico del mercado",
      },
      {
        nombre: "Plan Medio",
        precio_uf: 3.8,
        cobertura_ambulatorio: "75%",
        cobertura_hospitalario: "85%",
        cobertura_dental: false,
        tope_anual_uf: 280,
        descripcion: "Buen balance precio-cobertura",
      },
      {
        nombre: "Plan Alto",
        precio_uf: 6.5,
        cobertura_ambulatorio: "85%",
        cobertura_hospitalario: "92%",
        cobertura_dental: true,
        tope_anual_uf: 500,
        descripcion: "Alta cobertura a precio razonable",
      },
    ],
  },
  {
    nombre: "Esencial",
    rut: "76.354.771-4",
    telefono: "600 600 3737",
    web: "https://www.esencial.cl",
    descripcion: "Isapre más nueva del mercado, con enfoque digital y precios competitivos.",
    regiones: ["Región Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Los Lagos"],
    calificacion: 3.9,
    ventajas: [
      "Proceso 100% digital",
      "Precios competitivos",
      "Atención ágil",
      "App moderna",
    ],
    desventajas: [
      "Red de prestadores más limitada",
      "Menor presencia en regiones extremas",
    ],
    planes: [
      {
        nombre: "Plan Digital Básico",
        precio_uf: 2.0,
        cobertura_ambulatorio: "70%",
        cobertura_hospitalario: "80%",
        cobertura_dental: false,
        tope_anual_uf: 160,
        descripcion: "Plan digital accesible",
      },
      {
        nombre: "Plan Digital Plus",
        precio_uf: 4.0,
        cobertura_ambulatorio: "80%",
        cobertura_hospitalario: "88%",
        cobertura_dental: true,
        tope_anual_uf: 320,
        descripcion: "Plan digital con dental",
      },
    ],
  },
  {
    nombre: "Vida Tres",
    rut: "96.625.780-2",
    telefono: "600 600 8483",
    web: "https://www.vidatres.cl",
    descripcion: "Isapre con enfoque en calidad de vida y bienestar integral.",
    regiones: ["Todas las regiones de Chile"],
    calificacion: 4.0,
    ventajas: [
      "Enfoque en bienestar integral",
      "Programas de prevención",
      "Buena atención al cliente",
      "Planes con beneficios adicionales",
    ],
    desventajas: [
      "Precios algo elevados",
      "Red de prestadores mediana",
    ],
    planes: [
      {
        nombre: "Plan Vida 70",
        precio_uf: 2.8,
        cobertura_ambulatorio: "70%",
        cobertura_hospitalario: "80%",
        cobertura_dental: false,
        tope_anual_uf: 200,
        descripcion: "Plan con programa de bienestar incluido",
      },
      {
        nombre: "Plan Vida 85",
        precio_uf: 5.2,
        cobertura_ambulatorio: "85%",
        cobertura_hospitalario: "92%",
        cobertura_dental: true,
        tope_anual_uf: 420,
        descripcion: "Cobertura alta con beneficios de salud preventiva",
      },
      {
        nombre: "Plan Vida Total",
        precio_uf: 8.0,
        cobertura_ambulatorio: "92%",
        cobertura_hospitalario: "96%",
        cobertura_dental: true,
        tope_anual_uf: 650,
        descripcion: "Cobertura máxima con bienestar integral",
      },
    ],
  },
];
