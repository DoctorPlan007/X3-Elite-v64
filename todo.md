# X3 — Superinteligencia Conversacional Chilena

## TODO

- [x] Backend: proxy IA con invokeLLM y personalidad X3 (sistema prompt desde X3_MASTER_CONTEXT)
- [x] Schema DB: tablas conversations, messages, memories, projects
- [x] tRPC router: chat con streaming, memoria, proyectos
- [x] Interfaz chat móvil premium: diseño oscuro cian/violeta, PWA
- [x] Campo de texto y botones fijos en la parte inferior (siempre visibles)
- [x] Módulo Isapres chilenas: base de datos, planes, precios, coberturas, comparación
- [x] Módulo finanzas: UF, UTM, tasas, APV, seguros de vida, fondos de pensiones
- [x] Motor de creación de código: X3 genera landing pages, apps, herramientas
- [x] Generación de imágenes cinematográficas con prompts profesionales
- [x] Voz TTS en español chileno (síntesis de voz)
- [x] Voz STT reconocimiento de voz (Web Speech API)
- [x] Memoria persistente entre sesiones (panel lateral deslizable)
- [x] Proyectos internos con panel lateral
- [x] Animaciones cinematográficas suaves (CSS animations)
- [x] PWA: manifest.json, meta tags, agregar a pantalla de inicio
- [x] Datos en tiempo real: UF, UTM, índices bursátiles (APIs públicas)
- [x] Vitest: tests del backend proxy IA y módulos
- [x] Corregir micrófono STT: Web Speech API con permisos correctos, feedback visual, soporte móvil
- [x] Hub de acceso a cuentas: panel con accesos directos a todas las plataformas del usuario
- [x] Redes sociales: Instagram, Facebook, Marketplace, TikTok, WhatsApp, WhatsApp Business
- [x] IAs: Claude, Manus, Gemini, Groq, NotebookLM
- [x] Herramientas: GitHub, Cloudflare, Gmail, Outlook
- [x] Almacenamiento: Google Drive, Google Fotos, Dropbox
- [x] Streaming real de respuestas (texto aparece letra por letra en el frontend)
- [x] Endpoint SSE /api/stream-chat en el servidor Express
- [x] Actualizar X3Chat.tsx para consumir el stream SSE
- [x] Validar en /api/stream-chat que conversationId pertenezca al usuario autenticado
- [x] Corregir manejo de errores SSE en X3Chat (mostrar fallback visible)
- [x] Tests Vitest para el endpoint /api/stream-chat
- [x] Interfaz militar completa (consola de mando, Orbitron/Share Tech Mono, colores #00d4ff)
- [x] Nivel 2 Visión: análisis de imágenes con Gemini (upload foto desde Xiaomi)
- [x] Nivel 3 Datos: UF y USD en tiempo real en el header
- [x] Nivel 4 Voz: síntesis de voz mejorada con toggle on/off
- [x] Bóveda de Seguridad: conversaciones persistidas en BD del servidor
- [x] Modo Ahorro de Datos: limitar historial a 6 mensajes (toggle en header)
- [x] Backend: soporte para imágenes en /api/stream-chat (base64 inline)

## Módulo Legado — El Alma de Alexander
- [x] Tabla `legacy_profile` en BD: historia, valores, forma de hablar de Alexander
- [x] Tabla `legacy_messages`: mensajes individuales para Constanza, Renata y Valentín
- [x] Acceso protegido con clave personal (solo los hijos pueden acceder)
- [x] Integrar legado en system prompt de X3 (habla con la voz y valores de Alexander)
- [x] Página /legado en el frontend con acceso por clave (tab en panel lateral)
- [x] Unificación: system prompt completo con alma de Alexander en Manus y GitHub
- [x] GitHub X3-ELITE actualizado con v4.0 (commit 694e369)
- [x] Mensaje de bienvenida actualizado: "el corazón que late en cada proyecto tuyo"

## Módulo Legado — Completado
- [x] Backend: endpoint /api/legacy/access con verificación de clave (bcrypt)
- [x] Ruta /legado con formulario de clave, estados de error/carga y visualización del legado
- [x] Tests Vitest para validar que solo con clave correcta se accede al legado

## Mejoras v5.0 — Seleccionadas por Alexander

### PRIORIDAD 1 — Legado (dos realidades)
- [x] Ruta /legado completamente separada e independiente de la pantalla principal
- [x] Pantalla Legado: diseño distinto, íntimo, cálido — NO militar, NO profesional
- [x] Acceso exclusivo con clave 2033 (hash bcrypt en servidor, sin exponer la clave)
- [x] Mensajes individuales para Constanza, Renata y Valentín visibles solo tras autenticación
- [x] La pantalla principal NO tiene ninguna referencia al Legado (dos realidades coexistiendo)
- [x] Backend: endpoint /api/legacy/verify + /api/legacy/content protegidos
- [x] Tests Vitest para el módulo Legado (9 tests pasando)

### PRIORIDAD 2 — Potencia de X3
- [x] X3 como núcleo instalable: script embebible en cualquier proyecto (una línea de código)
- [x] Memoria automática: X3 detecta y guarda datos importantes sin que el usuario lo pida
- [x] Generador de landing pages: X3 genera HTML/CSS completo descargable desde el chat
- [x] Informe HTML: botón en header genera informe descargable con análisis de salud y finanzas

### PRIORIDAD 3 — Capacidades avanzadas
- [x] Análisis forense: botón en header activa prompt forense completo de plan de salud
- [x] Simulador de quiebre: integrado en el prompt forense (UCI, cáncer, cirugía, fármacos)
- [x] Voz mejorada: selección automática de la mejor voz disponible (prioridad es-CL masculina)
- [x] Modo claro/oscuro: toggle en el header (luna/sol)
- [x] Memoria automática inteligente: detecta Isapre, trabajo, ciudad, hijos, APV, inversiones

## Pendiente v5.1 — Completado
- [x] Descarga de código generado: cuando X3 genera HTML/CSS, botón de descarga automático en el chat
- [x] Simulador de quiebre real: /simulador con formulario (Isapre, plan, cobertura, tope) y cálculo de copagos por escenario (UCI, cáncer, cirugía, fármacos, parto)

## Mejora pantalla de entrada
- [x] Rediseñar pantalla login/bienvenida: impactante, militar, cinematográfica, con animaciones y frases de impacto

## X3 v6.0 Hyper-Reality — Implementación completa
- [ ] System prompt actualizado con lenguaje de poder, fuentes legales (Ley 21.350, Circular 356, ISO 31000)
- [x] Glassmorphism total — paneles traslúcidos flotantes sobre fondo de datos en movimiento
- [ ] Splash screen Bóveda de Soberanía — escaneo biométrico + partículas neón
- [x] X3_AUDIO — sonidos de sistema (boot, scan, alert, play_impact) con Web Audio API
- [ ] Módulo 7: Autoridad y Verdad — citas legales + links oficiales en respuestas del chat
- [x] Módulo 8: Triángulo Inmunidad Patrimonial — combinador 3 capas visual (tab Blindaje)
- [ ] Módulo 9: Algoritmo Optimización Primas — barras animadas + GENERAR COMBINACIÓN MAESTRA
- [ ] Módulo 10: Modo Presentación Impacto — pantalla completa 3 slides automáticos con voz
- [x] Módulo 11: Simulador Catástrofe vs Blindaje — selector patología + comparativa Isapre vs X3 (/simulador)
- [x] Módulo 12: Radar de Fugas — Scanner vulnerabilidad activo + monto alarma rojo neón (tab Forense)
- [x] Módulo 13: Live Reality Core — UF/Aranceles/Riesgo sincronizados en tiempo real (tab LRC)
- [x] Módulo 14: Veredicto Final — Liquidador de Siniestros (Ilusión vs Realidad vs Inmunidad X3)
- [ ] Exportar Certificado como imagen PNG (html2canvas)
- [ ] Archivo HTML standalone completo con todos los módulos integrados

## PENTÁGONO DE DOMINIO X3 — Operación Soberanía

### FRENTE 1 — SALUD (Ingeniería de Salud)
- [x] Motor comparación forense Isapres (planes, precios, coberturas)
- [x] Blindaje híbrido 3 capas (Isapre + Catastrófico + APV)
- [x] Simulador Catástrofe vs Blindaje X3
- [x] Radar de Fugas Patrimoniales
- [ ] Optimizador automático: detecta falla de cobertura y ensambla blindaje ideal

### FRENTE 2 — INVERSIONES (Arquitectura de Inversión)
- [ ] Módulo APV Tax-Shield: calculador Artículo 42 bis
- [ ] Simulador recuperación tributaria (cuánto regala el cliente al Estado)
- [ ] Integración APV al flujo de caja del blindaje de salud
- [ ] Algoritmo Optimización de Primas — barras animadas + COMBINACIÓN MAESTRA

### FRENTE 3 — WEB/TECH (Factoría Digital)
- [x] Generador de HTML/landing pages desde el chat
- [ ] Generador de landings con Psicología de Autoridad (radar interactivo + veredicto en vivo)
- [ ] Contador de pérdida en tiempo real ("cuánto has perdido sin blindaje")
- [ ] Exportar landing completa como archivo descargable

### FRENTE 4 — LEGAL (X3 Legal Bridge)
- [ ] Módulo detección de vulneración (gasto excesivo, alza ilegal)
- [ ] Generador de expediente técnico con sellos de auditoría
- [ ] Informe pre-calificado para representación judicial (Circular 356)
- [ ] API de notificación a equipo legal con caso adjunto listo para firma

### FRENTE 5 — INFORMES (Intelligence Reports 8K)
- [x] Informe HTML descargable desde el chat
- [ ] Certificado de Inmunidad Financiera (diseño Tactical Intelligence Sheet)
- [ ] Gráficos de Estrés: Sistema Actual (Vulnerable) vs Blindaje X3 (Inmune)
- [ ] Sección Legal en informe: pre-calificación judicial automática
- [ ] Exportar Certificado como imagen PNG (html2canvas)
- [ ] Modo Presentación Impacto — 3 slides automáticos con voz

### ACTIVOS EXISTENTES (archivos adjuntos integrados)
- [x] X3_Soberania_Total.html — interfaz orbe viva con canvas animado
- [x] Pantalla Renata & Valentín — zonas táctiles secretas con voz y fractales de luz

## TRABAJOS DE MAYOR FRECUENCIA — Optimización prioritaria

- [x] Flujo 1: Análisis de Plan Isapre — formulario estructurado (Isapre + plan + perfil) + informe automático descargable (/analisis-isapre)
- [x] Flujo 2: Comparativo 2 planes Isapres — selector dual + tabla lado a lado + veredicto X3 con recomendación (/comparativo)
- [x] Flujo 3: Generador Landing Pages 3D cinemáticas — prompts especializados + preview en iframe + botón descarga HTML (/landing-generator)
- [x] Accesos directos a los 3 flujos en el home de X3 (botones de acción rápida)
- [x] Accesos directos a los 3 flujos en el panel lateral (tabs o sección dedicada)

## INDEPENDENCIA ANDROID — Funcionamiento sin Manus

- [x] PWA manifest.json completo con iconos 192x192 y 512x512
- [x] Service Worker con cache offline de assets críticos
- [x] Prompt de instalación "Agregar a pantalla de inicio" en Android
- [x] Viewport y touch targets optimizados para móvil (min 44px)
- [x] Teclado virtual: no desplaza el layout, input siempre visible
- [x] Scroll suave en todos los paneles y listas
- [x] HTML standalone v6.1 con los 3 flujos completos (sin servidor)
- [x] Modo offline: respuestas precargadas para los flujos principales
- [x] Instrucciones de instalación Android (paso a paso)

## MÓDULOS SELECCIONADOS v6.3 — 27 MAY 2026

- [x] M1: Historial de conversación en Gemini (array de mensajes previos)
- [x] M2: System prompt completo con alma de Alexander (desde X3-ELITE)
- [x] M3: Citas legales en respuestas (Ley 21.350, Circular 356, ISO 31000, Art. 42 bis)
- [x] M4: APV Tax-Shield — calculador Artículo 42 bis (/apv-shield)
- [x] M5: Certificado de Blindaje PNG descargable (en APVShield)
- [x] M6: Análisis de imagen con Gemini Vision (boleta, plan, documento)
- [x] M8: Optimizador automático de blindaje (/optimizador)
- [x] M9: Modo Presentación Impacto (3 slides automáticos + voz en /optimizador)
- [x] M10: Splash screen Bóveda de Soberanía (escaneo biométrico + boot)
- [x] M11: Módulo Autoridad y Verdad (links oficiales SUSESO, SIS, CMF, Minsal)
- [x] M13: Landing con Psicología de Autoridad (radar + contador pérdida + CTA)
- [x] M14: Gráficos de Estrés en informes (vulnerable vs inmune, barras animadas)
- [x] M15: Frente Inversiones APV + Portafolios (calculador arbitraje tributario)
- [x] M17: Factory de Landings (generador masivo por sector con templates Orbitron)
