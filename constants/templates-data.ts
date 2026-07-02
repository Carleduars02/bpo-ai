export interface TemplateProfile {
  example_name:      string
  short_description: string  // ≤139 chars
  long_description:  string
  keywords:          string[]
}

export interface TemplateQuickReply {
  title:   string
  message: string
}

export interface TemplateStatusText {
  type: string
  text: string
}

export interface TemplateMessages {
  welcome_messages: string[]
  away_message:     string
  quick_replies:    TemplateQuickReply[]
  status_texts:     TemplateStatusText[]
}

export interface TemplateCatalogItem {
  name:        string
  description: string
  category?:   string
  price?:      number
  cta?:        string
}

export interface SectorTemplate {
  id:              string
  sector:          string
  name:            string
  description:     string
  icon:            string
  profile:         TemplateProfile
  messages:        TemplateMessages
  catalog_items:   TemplateCatalogItem[]
  strategy:        string
  common_mistakes: string[]
}

export const SYSTEM_TEMPLATES: SectorTemplate[] = [
  // ─────────────────────────────────────────────────────────────────
  // RESTAURANTE
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "restaurant",
    sector:      "restaurant",
    name:        "Restaurante",
    description: "Para restaurantes, fondas, comedores y locales de comida con servicio en mesa.",
    icon:        "UtensilsCrossed",
    profile: {
      example_name:      "Sabor Casero Restaurante",
      short_description: "Comida casera con sabor de hogar. Menú diario, a la carta y pedidos express. Abrimos lun-sáb 12-10pm.",
      long_description:  "En Sabor Casero creemos que una buena comida es la base de todo. Preparamos cada plato con ingredientes frescos y recetas de toda la vida. Menú del día, carta completa y servicio a domicilio. Reservas por WhatsApp.",
      keywords:          ["restaurante", "comida casera", "menú del día", "almuerzo", "cena", "a la carta", "delivery", "reservas", "comida fresca", "cocina tradicional", "domicilio", "takeaway"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 👋 Bienvenido a Sabor Casero. Estamos para atenderte. ¿Quieres ver nuestro menú del día, hacer una reserva o pedir a domicilio?",
        "¡Buen día! Gracias por escribirnos. En Sabor Casero tenemos menú diario, carta completa y pedidos para llevar. ¿En qué te ayudamos? 🍽️",
        "¡Hola! Nos alegra que nos escribas. Somos Sabor Casero — comida rica, fresca y a buen precio. ¿Qué necesitas hoy?",
      ],
      away_message: "Hola, gracias por escribirnos. En este momento estamos fuera de horario o atendiendo mesas. Nuestro horario es lunes a sábado de 12:00 a 22:00. Te respondemos en cuanto podamos 🙏",
      quick_replies: [
        { title: "/menu",       message: "¡Hola! Nuestro menú del día incluye entrada, plato fuerte y bebida. También tenemos carta disponible. ¿Quieres que te lo enviemos completo?" },
        { title: "/precios",    message: "El menú del día está a $X. Los platos a la carta varían entre $X y $X. ¿Quieres más detalles de algún plato?" },
        { title: "/horarios",   message: "Atendemos de lunes a sábado de 12:00 a 22:00. Los domingos de 12:00 a 17:00. ¡Te esperamos!" },
        { title: "/reserva",    message: "¡Claro! Para reservar necesito: nombre, número de personas, fecha y hora. ¿Me pasas los datos?" },
        { title: "/domicilio",  message: "Hacemos entregas en la zona. El costo del envío depende de tu ubicación. ¿Nos dices tu dirección para cotizarte?" },
        { title: "/ubicacion",  message: "Estamos ubicados en [dirección]. Puedes encontrarnos fácilmente en [referencia]. ¿Necesitas instrucciones para llegar?" },
        { title: "/pagos",      message: "Aceptamos efectivo, tarjeta de crédito/débito y transferencia. ¿Tienes alguna pregunta sobre los pagos?" },
        { title: "/especiales", message: "Hoy tenemos de especial: [plato especial]. Es por tiempo limitado. ¿Te interesa apartar uno?" },
        { title: "/alergias",   message: "Entendemos la importancia de las alergias. Cuéntanos qué restricciones tienes y buscamos la mejor opción del menú para ti." },
        { title: "/eventos",    message: "¡Organizamos eventos privados! Cumpleaños, reuniones de empresa, celebraciones familiares. ¿Quieres que te cotizemos un evento?" },
      ],
      status_texts: [
        { type: "promocion",   text: "🍽️ MENÚ DEL DÍA — Hoy: [plato]. Entrada + fuerte + bebida por solo $X. Reserva tu mesa o pide a domicilio. ¡Pocos cupos!" },
        { type: "producto",    text: "⭐ PLATO ESTRELLA — Nuestro [nombre del plato] preparado con ingredientes frescos todos los días. ¿Ya lo probaste? Escríbenos." },
        { type: "testimonio",  text: "💬 '\"La mejor comida casera que he probado. El servicio es excelente y los precios son justos.\"' — María G., cliente frecuente." },
        { type: "dato",        text: "🧑‍🍳 ¿Sabías que cocinamos con ingredientes frescos cada día? Sin conservantes, sin congelados. Sabor auténtico en cada plato." },
        { type: "cta",         text: "📦 ¿No puedes venir? ¡Te llevamos la comida! Pedidos a domicilio disponibles. Escríbenos tu dirección y pedido ahora." },
        { type: "horario",     text: "⏰ Hoy abrimos a las 12:00. Mesas disponibles para el almuerzo. Reserva ahora por WhatsApp y asegura tu lugar. ¡Te esperamos!" },
        { type: "motivacional", text: "🌟 Una buena comida lo cambia todo. Hoy te esperamos con nuestro menú del día y mucho cariño en cada plato. ¡Visítanos!" },
      ],
    },
    catalog_items: [
      { name: "Menú del Día",          description: "Entrada + plato fuerte + bebida. Cambia cada día con ingredientes frescos de temporada.",            category: "Menús",     price: 8,  cta: "Escríbenos para ver el menú de hoy" },
      { name: "Bandeja Paisa",          description: "Plato tradicional completo con arroz, frijoles, chicharrón, huevo frito, chorizo y aguacate.",       category: "A la carta", price: 12, cta: "Pide la tuya ahora" },
      { name: "Sopa del Chef",          description: "Sopa reconfortante preparada con receta tradicional. Cambia cada semana según la temporada.",         category: "Entradas",   price: 5,  cta: "Ideal para empezar bien" },
      { name: "Pollo a la Plancha",     description: "Pechuga de pollo marinada, a la plancha, acompañada de ensalada fresca y arroz integral.",           category: "A la carta", price: 10, cta: "Opción saludable y deliciosa" },
      { name: "Postre del Día",         description: "Postre casero preparado diariamente. Flan, arroz con leche, helado artesanal y más según el día.",   category: "Postres",    price: 4,  cta: "Pregunta por el postre de hoy" },
      { name: "Pedido a Domicilio",     description: "Enviamos cualquier plato del menú a tu puerta. Tiempo estimado: 30-45 min según la zona.",           category: "Delivery",   cta: "Dinos tu dirección y pedido" },
    ],
    strategy: "El diferenciador de un restaurante en WhatsApp es la rapidez y la claridad. Responde en menos de 5 minutos durante el horario de atención. Usa los estados para mostrar el menú del día cada mañana — esto genera consultas orgánicas. Las fotos de los platos en el catálogo son el elemento de mayor impacto en la conversión.",
    common_mistakes: [
      "No actualizar el menú del día en los estados — los clientes dejan de consultar si la información es vieja",
      "No tener el horario claro en el mensaje de ausencia — genera frustración y abandono",
      "Responder solo con precios sin ofrecer la opción de reservar — pierdes conversiones",
      "Catálogo sin fotos de los platos — el cliente come con los ojos primero",
      "No tener una respuesta rápida de ubicación — es la pregunta más frecuente",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // SALÓN DE BELLEZA
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "salon",
    sector:      "salon",
    name:        "Salón de Belleza",
    description: "Para salones de belleza, peluquerías femeninas y centros de estética integral.",
    icon:        "Scissors",
    profile: {
      example_name:      "Belleza & Estilo Salón",
      short_description: "Tu salón de confianza. Cortes, coloración, tratamientos y más. Agenda tu cita hoy — cupos limitados.",
      long_description:  "En Belleza & Estilo te transformamos con técnicas actuales y productos premium. Cortes, coloración, mechas, tratamientos capilares y servicios de manicure. Profesionales certificadas. Agenda tu cita por WhatsApp.",
      keywords:          ["salón de belleza", "peluquería", "corte de cabello", "coloración", "mechas", "tratamiento capilar", "manicure", "pedicure", "cita", "agenda", "belleza", "estética"],
    },
    messages: {
      welcome_messages: [
        "¡Hola, bienvenida! ✂️ Soy [nombre] de Belleza & Estilo. ¿Quieres agendar una cita o tienes alguna consulta sobre nuestros servicios?",
        "¡Hola! Gracias por escribirnos 💇‍♀️ En Belleza & Estilo tenemos todo para que luzcas increíble. ¿En qué te ayudamos hoy?",
        "¡Bienvenida a Belleza & Estilo! Estamos para ayudarte a lucir tu mejor versión. ¿Quieres ver nuestros servicios o agendar tu cita?",
      ],
      away_message: "Hola, gracias por escribirnos. En este momento estamos atendiendo clientes. Nuestro horario es lunes a sábado de 9:00 a 19:00. Te respondemos pronto para agendar tu cita 💕",
      quick_replies: [
        { title: "/servicios",  message: "Ofrecemos: ✂️ Cortes, 🎨 Coloración, ✨ Mechas/Balayage, 💆 Tratamientos, 💅 Manicure/Pedicure, 👰 Peinados para eventos. ¿Por cuál te interesa cotizar?" },
        { title: "/precios",    message: "Los precios varían según el largo del cabello y el servicio. ¿Cuál servicio te interesa? Te doy un precio más preciso." },
        { title: "/cita",       message: "¡Con gusto! Para agendar necesito: nombre, servicio que deseas, día y hora preferida. ¿Me das esos datos?" },
        { title: "/horarios",   message: "Atendemos lunes a sábado de 9:00 a 19:00. Te recomendamos agendar con anticipación porque los cupos se llenan rápido. 📅" },
        { title: "/coloracion", message: "Hacemos todo tipo de coloración: tinte completo, mechas, balayage, decoloración, matizado. ¿Qué efecto tienes en mente?" },
        { title: "/tratamiento",message: "Tenemos tratamientos para cabello dañado, liso definitivo, hidratación profunda y más. ¿Cuál es la condición actual de tu cabello?" },
        { title: "/novia",      message: "¡Tenemos paquetes para novias! Prueba de peinado + maquillaje + día del evento. Te recomendamos reservar con mínimo 2 meses de anticipación. 👰" },
        { title: "/productos",  message: "Usamos productos de marcas premium como [marcas]. También vendemos productos para el cuidado en casa. ¿Quieres info de alguno?" },
        { title: "/ubicacion",  message: "Estamos en [dirección]. Fácil acceso con [referencia de ubicación]. ¿Necesitas más indicaciones?" },
        { title: "/cancelar",   message: "Si necesitas cancelar o reprogramar tu cita, avísanos con mínimo 24 horas de anticipación. ¿Cuál es tu nombre y la fecha de tu cita?" },
      ],
      status_texts: [
        { type: "promocion",    text: "💇‍♀️ PROMO DE LA SEMANA — [Servicio] con 20% de descuento solo hasta el viernes. Cupos limitados. Escríbenos para agendar ahora." },
        { type: "antes_despues",text: "✨ TRANSFORMACIÓN DEL DÍA — De [estado inicial] a [resultado final]. Mira el cambio increíble de nuestra clienta de hoy. ¿Quieres el tuyo?" },
        { type: "testimonio",   text: "💬 '\"Quedé encantada con mi cambio. El equipo es muy profesional y el resultado superó mis expectativas.\"' — Laura M." },
        { type: "dato",         text: "💡 ¿Sabías que un buen tratamiento cada mes puede restaurar hasta un 80% del daño en tu cabello? Pregúntanos por nuestro plan de recuperación." },
        { type: "cta",         text: "📅 ¿Tienes un evento especial próximo? ¡Agenda tu cita ahora! Cupos limitados para este fin de semana. Escríbenos." },
        { type: "producto",     text: "⭐ Conoce nuestro servicio de [servicio destacado]. Ideal para [beneficio principal]. Pregunta por disponibilidad esta semana." },
        { type: "motivacional", text: "🌟 Porque cuidarte no es un lujo, es una necesidad. Esta semana regálate tiempo para ti. Tu cita te está esperando. ✂️" },
      ],
    },
    catalog_items: [
      { name: "Corte de Cabello",         description: "Corte personalizado según tu tipo de rostro y cabello. Incluye lavado y secado básico.",                                    category: "Cabello", cta: "Agenda tu cita" },
      { name: "Coloración Completa",      description: "Tinte de raíz a puntas con productos premium. Incluye tono de tu elección y tratamiento post-color.",                      category: "Color",   cta: "Consulta tu tono ideal" },
      { name: "Balayage / Mechas",        description: "Técnica de aclarado natural para un efecto degradé sin marcas. Resultado duradero de hasta 4 meses.",                      category: "Color",   cta: "¿Es para ti? Consúltanos" },
      { name: "Tratamiento Hidratante",   description: "Hidratación profunda para cabello seco, quebradizo o dañado. Resultados visibles desde la primera sesión.",                category: "Tratamientos", cta: "Recupera tu cabello" },
      { name: "Liso Definitivo",          description: "Alisado profesional de larga duración. Sin formol. Cabello liso, suave y manejable por meses.",                           category: "Tratamientos", cta: "Solicita tu diagnóstico" },
      { name: "Manicure + Pedicure",      description: "Servicio completo de uñas manos y pies. Incluye corte, forma, cutícula y esmalte a elección.",                            category: "Uñas",    cta: "Reserva tu sesión completa" },
      { name: "Peinado para Evento",      description: "Peinado profesional para bodas, graduaciones, quinceañeras y toda ocasión especial. Prueba disponible.",                   category: "Eventos", cta: "¿Tienes un evento próximo?" },
    ],
    strategy: "Los salones de belleza convierten mejor cuando muestran resultados visuales constantemente. Publica fotos de antes/después en los estados cada vez que sea posible. El catálogo debe tener foto de cada servicio con el resultado final, no solo el nombre. Las citas agendadas por WhatsApp reducen las ausencias cuando se envía un recordatorio 24h antes.",
    common_mistakes: [
      "No especificar que los precios varían por largo de cabello — genera conflictos en el momento del servicio",
      "No pedir nombre y servicio al responder el primer mensaje — dificulta la gestión de la agenda",
      "Catálogo sin fotos de resultados reales — las clientas necesitan ver para creer",
      "No tener una respuesta rápida para cancelaciones — los no-shows son el mayor problema del sector",
      "No publicar promociones con urgencia real (cupos limitados, fecha de vencimiento) — sin urgencia no hay acción inmediata",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // BARBERÍA
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "barbershop",
    sector:      "barbershop",
    name:        "Barbería",
    description: "Para barberías, peluquerías masculinas y locales de arreglo personal para hombres.",
    icon:        "Scissors",
    profile: {
      example_name:      "The Barber Shop",
      short_description: "Cortes premium, barba perfecta y estilo sin igual. Agenda tu turno ahora — sin esperas, solo estilo.",
      long_description:  "The Barber Shop es el lugar donde el estilo no es negociable. Cortes clásicos y modernos, arreglo de barba, afeitado con navaja y tratamientos para hombre. Barberos certificados. Turno por WhatsApp.",
      keywords:          ["barbería", "corte de cabello hombre", "barba", "afeitado", "degradado", "fade", "estilo masculino", "turno", "agenda", "cuidado personal", "hombre", "peluquería"],
    },
    messages: {
      welcome_messages: [
        "¡Qué tal! 💈 Bienvenido a The Barber Shop. ¿Quieres agendar tu turno o tienes alguna consulta?",
        "¡Buenas! Gracias por escribirnos ✂️ En The Barber Shop hacemos que cada corte sea perfecto. ¿Cuándo quieres tu turno?",
        "¡Hola! 💈 Somos The Barber Shop — cortes premium y barba a otro nivel. ¿En qué te podemos ayudar?",
      ],
      away_message: "¡Buenas! En este momento estamos con clientes. Atendemos de martes a sábado de 9:00 a 20:00. En cuanto podamos, te agendamos el turno 💈",
      quick_replies: [
        { title: "/servicios",  message: "Nuestros servicios: ✂️ Corte clásico/moderno, 💈 Degradado (fade), 🧔 Arreglo de barba, 🪒 Afeitado con navaja, 💆 Tratamientos. ¿Cuál te interesa?" },
        { title: "/turno",      message: "¡Con gusto! Para tu turno necesito: nombre, servicio y día/hora que prefieres. Los turnos se llenan rápido, ¿tienes disponibilidad flexible?" },
        { title: "/precios",    message: "Corte desde $X | Degradado desde $X | Barba desde $X | Combo corte + barba desde $X. ¿Algún servicio en particular?" },
        { title: "/horarios",   message: "Abrimos martes a sábado de 9:00 a 20:00. Los viernes y sábados se ocupan rápido — te recomendamos reservar con anticipación. 📅" },
        { title: "/barba",      message: "Para la barba ofrecemos: perfilado, delineado, relleno con cera y afeitado con navaja. ¿Qué efecto buscas en tu barba?" },
        { title: "/fade",       message: "Hacemos todos los tipos de fade: low, mid, high, skin fade y burst fade. ¿Tienes alguna referencia o foto del corte que quieres?" },
        { title: "/ubicacion",  message: "Estamos en [dirección], cerca de [referencia]. Fácil estacionamiento. ¿Necesitas más indicaciones para llegar?" },
        { title: "/espera",     message: "Si no tienes turno, puedes venir a consultar si hay disponibilidad. Sin embargo, con turno garantizas tu hora y evitas esperas. 🕒" },
        { title: "/pagos",      message: "Aceptamos efectivo y tarjeta. Para reservar el turno no pedimos anticipo, pero si cancelan con menos de 2h, se pierde el cupo." },
        { title: "/regalo",     message: "¡Tenemos gift cards! Perfectas para regalo. El beneficiado elige el servicio y la fecha. ¿Te interesa una?" },
      ],
      status_texts: [
        { type: "promocion",   text: "💈 COMBO DEL MES — Corte + Barba por solo $X. Ahorra $X. Disponible hasta fin de mes. Cupos limitados. Escríbenos para tu turno." },
        { type: "trabajo",     text: "✂️ TRABAJO DEL DÍA — Este fue el resultado de hoy. [Tipo de corte]. ¿Quieres el tuyo? Agenda tu turno por WhatsApp." },
        { type: "testimonio",  text: "⭐⭐⭐⭐⭐ '\"El mejor barbero de la zona. Siempre sale perfecto y el ambiente es genial.\"' — Carlos R." },
        { type: "dato",        text: "💡 Un buen corte no solo te hace ver mejor, te hace sentir más seguro. ¿Cuándo fue tu último corte? Agenda el siguiente hoy." },
        { type: "cta",         text: "🗓️ ¿Tienes evento este fin de semana? Agenda tu turno ahora. Los sábados se agotan. Solo por WhatsApp. ¡Escríbenos!" },
        { type: "horario",     text: "🕘 Abrimos hoy a las 9:00. Hay turnos disponibles para esta mañana. Escríbenos ahora y asegura el tuyo. 💈" },
        { type: "motivacional", text: "👑 Porque los detalles importan. Un buen corte, una barba impecable. Eso es lo que ofrecemos. ¿Vienes esta semana?" },
      ],
    },
    catalog_items: [
      { name: "Corte Clásico",        description: "Corte tradicional con tijera y máquina. Incluye lavado, secado y peinado final.",                              category: "Cortes",     cta: "Agenda tu turno" },
      { name: "Degradado (Fade)",     description: "Corte con degradado preciso. Low, mid o high fade según tu estilo. Resultado limpio y moderno.",              category: "Cortes",     cta: "¿Qué tipo de fade buscas?" },
      { name: "Arreglo de Barba",     description: "Perfilado, delineado y arreglo completo de la barba. Queda definida, limpia y con la forma perfecta.",       category: "Barba",      cta: "Define tu estilo" },
      { name: "Afeitado con Navaja",  description: "Afeitado clásico con navaja, crema de afeitar y toalla caliente. La experiencia barbería al máximo nivel.", category: "Barba",      cta: "Vive la experiencia clásica" },
      { name: "Combo Corte + Barba",  description: "El pack completo: tu mejor corte más barba perfecta. El favorito de nuestros clientes frecuentes.",          category: "Combos",     cta: "El más elegido — reserva ya" },
      { name: "Tratamiento Capilar",  description: "Hidratación y nutrición para el cuero cabelludo. Ideal para cabello reseco, con caspa o sin brillo.",        category: "Tratamientos", cta: "Consulta qué necesitas" },
    ],
    strategy: "Las barberías tienen alta fidelización cuando se construye relación personal. Usa el nombre de los clientes en los mensajes cuando sea posible. Los estados con fotos de trabajos reales del día son el contenido de mayor conversión para este sector. El sistema de turnos por WhatsApp reduce esperas y aumenta la satisfacción.",
    common_mistakes: [
      "No tener sistema de turnos — la espera sin saber cuánto falta genera abandono y mala experiencia",
      "No publicar fotos de trabajos reales — los hombres deciden con la vista antes de ir a una barbería",
      "Precios sin contexto (sin especificar qué incluye) — genera expectativas incorrectas",
      "No tener política clara de cancelaciones — los no-shows generan pérdidas y desorden en el horario",
      "Responder mensajes tarde — en barberías, el cliente que no recibe respuesta rápida va a la competencia",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // GIMNASIO / FITNESS
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "gym",
    sector:      "gym",
    name:        "Gimnasio / Fitness",
    description: "Para gimnasios, centros de fitness, cross training, yoga y actividad física en general.",
    icon:        "Dumbbell",
    profile: {
      example_name:      "FitZone Gym",
      short_description: "Tu gym con entrenadores certificados, equipos modernos y ambiente motivador. Primer mes con 30% OFF. Inscríbete hoy.",
      long_description:  "FitZone es el espacio donde alcanzas tus metas fitness. Equipamiento de última generación, entrenadores certificados, clases grupales y planes personalizados. Membresías mensuales y anuales. Inscripción por WhatsApp.",
      keywords:          ["gimnasio", "gym", "fitness", "entrenamiento", "ejercicio", "membresía", "entrenador personal", "clases grupales", "musculación", "cardio", "pérdida de peso", "crossfit"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 💪 Bienvenido a FitZone. Estamos para ayudarte a alcanzar tus metas. ¿Buscas información sobre membresías, clases o entrenamiento personal?",
        "¡Qué tal! Gracias por escribirnos 🏋️ En FitZone tenemos todo para que logres el cuerpo y la salud que quieres. ¿En qué te ayudamos?",
        "¡Hola! Nos alegra que te intereses en FitZone. El primer paso ya lo diste. ¿Quieres una membresía, conocer nuestros horarios o agendar una visita?",
      ],
      away_message: "¡Hola! Gracias por escribirnos. En este momento no podemos responder. Nuestro horario de atención es lunes a viernes de 6:00 a 22:00 y sábados de 8:00 a 18:00. ¡Te respondemos pronto! 💪",
      quick_replies: [
        { title: "/membresias",  message: "Tenemos membresías: 📅 Mensual ($X) | 📆 Trimestral ($X — ahorra 15%) | 🗓️ Anual ($X — ahorra 30%). Todas incluyen acceso completo al gym. ¿Cuál se adapta mejor a ti?" },
        { title: "/clases",      message: "Ofrecemos clases de: 🧘 Yoga | 🥊 Box/Kickboxing | 🏃 Spinning | 💃 Zumba | 🏋️ CrossFit. Horarios de mañana, tarde y noche. ¿Cuál te interesa?" },
        { title: "/horarios",    message: "Abrimos lunes a viernes de 6:00 a 22:00 y sábados de 8:00 a 18:00. Las clases grupales tienen horario fijo — ¿quieres el horario completo?" },
        { title: "/personal",    message: "El entrenamiento personal incluye: evaluación física inicial, plan de entrenamiento personalizado y seguimiento semanal. ¿Te interesa una sesión de prueba?" },
        { title: "/precio",      message: "La membresía mensual está en $X e incluye acceso ilimitado, vestuarios y casilleros. ¿Quieres ver los planes con más beneficios?" },
        { title: "/visita",      message: "¡Te invitamos a conocer nuestras instalaciones! Ven cualquier día en horario de apertura y pregunta por el área de ventas. Primera visita gratis. 🏋️" },
        { title: "/nutricion",   message: "Trabajamos con nutricionistas aliados. Si te inscribes en plan trimestral o anual, incluye una consulta nutricional. ¿Te interesa?" },
        { title: "/equipos",     message: "Contamos con zona de pesas libres, máquinas Technogym, área cardiovascular, sala de clases y vestuarios completos. ¿Quieres ver fotos?" },
        { title: "/congelar",    message: "Puedes congelar tu membresía por hasta 30 días al año sin costo adicional. Para solicitar el congelamiento, envíanos tu nombre y número de socio." },
        { title: "/referido",    message: "¡Trae a un amigo y ambos ganan! Por cada referido que se inscriba, tú recibes [beneficio]. Pregúntanos por los detalles de nuestro programa." },
      ],
      status_texts: [
        { type: "promocion",    text: "🔥 OFERTA LIMITADA — Membresía mensual con 30% de descuento solo esta semana. De $X a solo $X. Inscríbete hoy por WhatsApp." },
        { type: "motivacion",   text: "💪 '\"El único mal entrenamiento es el que no hiciste.\"' Hoy es un buen día para empezar. Escríbenos y agenda tu visita gratuita." },
        { type: "clase",        text: "🧘 CLASE DE HOY — [Nombre de la clase] a las [hora]. ¡Quedan [X] cupos disponibles! Escríbenos para reservar el tuyo. ¡Ven!" },
        { type: "testimonio",   text: "⭐ '\"En 3 meses bajé 8 kilos y me siento increíble. Los entrenadores son lo mejor.\"' — Diego M., socio desde 2025." },
        { type: "dato",         text: "🧬 ¿Sabías que solo 3 sesiones por semana de 45 minutos son suficientes para ver resultados en menos de un mes? Te ayudamos a empezar." },
        { type: "cta",          text: "🏋️ Empieza hoy. No mañana, no el lunes. HOY. Escríbenos y te damos una visita guiada sin compromiso. Tu mejor versión te está esperando." },
        { type: "horario",      text: "⏰ Abrimos en [X] minutos. Mañanas de semana son el mejor momento para entrenar — menos gente, más equipos disponibles. ¿Nos vemos?" },
      ],
    },
    catalog_items: [
      { name: "Membresía Mensual",     description: "Acceso ilimitado al gym durante 30 días. Incluye todas las áreas, vestuarios y casilleros.",                               category: "Membresías",    price: 35, cta: "Inscríbete ahora" },
      { name: "Membresía Trimestral",  description: "Acceso por 3 meses con 15% de ahorro. Incluye consulta nutricional gratis y seguimiento de progreso.",                    category: "Membresías",    price: 90, cta: "Mejor valor por mes" },
      { name: "Membresía Anual",       description: "Acceso por 12 meses al precio más económico. Incluye evaluación física, plan personalizado y 2 meses gratis.",           category: "Membresías",   price: 300, cta: "La mejor inversión en tu salud" },
      { name: "Entrenamiento Personal",description: "Sesiones 1 a 1 con entrenador certificado. Plan a medida según tus objetivos: pérdida de peso, masa muscular, tonificación.", category: "Servicios",  cta: "Agenda tu sesión de prueba" },
      { name: "Clases Grupales",       description: "Yoga, spinning, box, zumba y más. Incluidas en la membresía. Ambiente motivador y entrenadores especializados.",          category: "Clases",        cta: "Ver horario de clases" },
      { name: "Day Pass",              description: "Acceso de un día completo a todas las instalaciones. Ideal para probar antes de inscribirte.",                            category: "Acceso",        price: 8,  cta: "Ven a conocernos" },
    ],
    strategy: "Los gimnasios tienen el mayor desafío de conversión en el primer contacto — la persona está motivada pero procrastina la inscripción. Usa urgencia real (ofertas con fecha límite) y facilita el proceso al máximo. Los testimonios de transformación son el contenido más poderoso para este sector. Ofrece siempre una primera visita gratuita sin compromiso.",
    common_mistakes: [
      "No mencionar precio en el primer mensaje — el cliente lo pregunta de todas formas, no comunicarlo genera fricción innecesaria",
      "No ofrecer visita gratuita — la barrera de entrada baja enormemente con una invitación sin compromiso",
      "Mensajes de motivación genéricos sin CTA claro — la motivación sin acción no convierte",
      "No tener respuesta rápida para congelamiento de membresía — es una queja frecuente que se vuelve cancelación",
      "Ignorar preguntas sobre nutrición — es el complemento que más buscan los nuevos socios y puede ser un upsell",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CONSULTOR DE NEGOCIOS
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "consultant",
    sector:      "consultant",
    name:        "Consultor de Negocios",
    description: "Para consultores, asesores, coaches de negocios y profesionales de servicios B2B.",
    icon:        "Briefcase",
    profile: {
      example_name:      "Estrategia & Negocios",
      short_description: "Consultoría estratégica para PYME. Más ventas, procesos optimizados y crecimiento sostenible. Primera sesión gratuita.",
      long_description:  "Ayudamos a pequeñas y medianas empresas a crecer de forma ordenada. Diagnóstico de negocio, estrategia comercial, optimización de procesos y acompañamiento mensual. Resultados medibles desde el primer mes.",
      keywords:          ["consultor de negocios", "consultoría", "estrategia", "PYME", "asesoría empresarial", "ventas", "crecimiento", "procesos", "coaching", "diagnóstico", "rentabilidad", "emprendimiento"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! Gracias por contactarme. Soy [nombre], consultor de negocios. ¿En qué etapa está tu negocio y cómo puedo ayudarte a llevarlo al siguiente nivel?",
        "¡Bienvenido! Me alegra que hayas dado este paso. 📊 Soy especialista en crecimiento para PYME. Cuéntame brevemente sobre tu negocio, ¿cuál es tu mayor desafío hoy?",
        "¡Hola! Gracias por escribirme. Trabajo con negocios que quieren crecer de forma ordenada y rentable. ¿Quieres que conversemos sobre tu situación?",
      ],
      away_message: "Hola, gracias por tu mensaje. Estoy en reunión o fuera del horario de atención. Mi horario es lunes a viernes de 9:00 a 18:00. Te respondo en cuanto pueda — generalmente antes de las 24 horas. 🤝",
      quick_replies: [
        { title: "/servicios",  message: "Trabajo en 3 áreas principales: 📈 Estrategia comercial y ventas | ⚙️ Optimización de procesos | 💰 Rentabilidad y control financiero. ¿Cuál es tu prioridad ahora mismo?" },
        { title: "/sesion",     message: "Ofrezco una primera sesión estratégica gratuita de 45 minutos. Sin compromiso. Analizamos tu situación y te doy recomendaciones concretas. ¿Te interesa agendar?" },
        { title: "/honorarios", message: "Los honorarios dependen del alcance y duración del proyecto. ¿Me cuentas brevemente tu situación y te preparo una propuesta personalizada?" },
        { title: "/proceso",    message: "Mi proceso es: 1️⃣ Diagnóstico inicial | 2️⃣ Plan de acción con objetivos medibles | 3️⃣ Implementación acompañada | 4️⃣ Medición de resultados. ¿Te cuento más?" },
        { title: "/resultados", message: "He trabajado con más de [X] empresas en [sectores]. Los resultados promedio incluyen: +30% en ventas en 6 meses y -20% en costos operativos. ¿Quieres ver casos específicos?" },
        { title: "/modalidad",  message: "Trabajo de forma presencial y online. Los proyectos pueden ser puntuales (diagnóstico + plan) o de acompañamiento mensual. ¿Qué se adapta mejor a tu necesidad?" },
        { title: "/diagnostico",message: "El diagnóstico de negocio incluye análisis de ventas, procesos, equipo y posicionamiento. El resultado es un informe con las 5 acciones de mayor impacto para tu empresa." },
        { title: "/sector",     message: "Tengo experiencia en [sectores principales]. Sin embargo, mis metodologías aplican a cualquier negocio orientado a crecimiento. ¿De qué sector es tu empresa?" },
        { title: "/agenda",     message: "Para agendar la sesión gratuita necesito: tu nombre, nombre de la empresa, sector y el mayor desafío que enfrentas ahora. ¿Me los pasas?" },
        { title: "/referencias", message: "Puedo compartirte referencias de clientes anteriores con gusto. ¿Preferirías referencias de un sector similar al tuyo?" },
      ],
      status_texts: [
        { type: "reflexion",   text: "📊 El 80% de los negocios que fracasan tenían buenas ideas pero mala ejecución. ¿Cuál es el mayor obstáculo en la ejecución de tu negocio hoy?" },
        { type: "dato",        text: "💡 Un negocio sin métricas claras es como manejar con los ojos cerrados. ¿Sabes exactamente cuánto cuesta conseguir un cliente nuevo? Conversemos." },
        { type: "servicio",    text: "🎯 SESIÓN ESTRATÉGICA GRATUITA — 45 minutos para analizar tu negocio y definir las 3 acciones que más impacto tendrán este trimestre. Escríbeme." },
        { type: "testimonio",  text: "💬 '\"En 4 meses aumentamos las ventas un 40% y por primera vez tengo claridad de a dónde va cada peso.\"' — Roberto A., dueño de empresa de distribución." },
        { type: "reflexion2",  text: "🏆 El negocio más rentable no es el que vende más, sino el que gestiona mejor. ¿Cuánto margen real te está dejando cada venta? Hablemos." },
        { type: "cta",         text: "📅 Esta semana tengo 2 espacios disponibles para la sesión estratégica gratuita. Si estás listo para llevar tu negocio al siguiente nivel, escríbeme hoy." },
        { type: "proceso",     text: "⚙️ Optimizar procesos no es complicar — es simplificar. Menos pasos, menos errores, más resultados. ¿Tu negocio opera de forma ordenada y predecible?" },
      ],
    },
    catalog_items: [
      { name: "Sesión Estratégica",     description: "Primera consulta gratuita de 45 minutos. Diagnóstico rápido y 3 recomendaciones concretas para tu negocio. Sin compromiso.",     category: "Diagnóstico",     cta: "Agenda tu sesión gratuita" },
      { name: "Diagnóstico de Negocio", description: "Análisis profundo de ventas, procesos, equipo y posicionamiento. Entregable: informe con plan de acción priorizado.",             category: "Diagnóstico",     cta: "Solicitar propuesta" },
      { name: "Estrategia Comercial",   description: "Definición o rediseño de la estrategia de ventas. Incluye análisis de mercado, propuesta de valor y plan de acción trimestral.", category: "Estrategia",      cta: "¿Es lo que necesitas?" },
      { name: "Acompañamiento Mensual", description: "Seguimiento continuo del negocio: reuniones semanales, métricas, ajustes y soporte para la implementación del plan.",             category: "Acompañamiento",  cta: "Consulta disponibilidad" },
      { name: "Taller de Ventas",       description: "Taller práctico para el equipo comercial. Técnicas de cierre, manejo de objeciones y proceso de ventas efectivo.",               category: "Formación",       cta: "¿Tu equipo lo necesita?" },
      { name: "Consultoría de Procesos",description: "Mapeo y optimización de los procesos críticos del negocio. Resultado: más eficiencia, menos costos y mayor calidad.",            category: "Operaciones",     cta: "Solicitar información" },
    ],
    strategy: "Los consultores B2B convierten a través de la credibilidad y la confianza, no de la urgencia. Cada mensaje debe demostrar conocimiento real y pensamiento estratégico. El contenido de los estados debe provocar reflexión, no solo vender servicios. La primera sesión gratuita es el gancho más efectivo — minimiza la barrera de entrada y demuestra valor antes de cobrar.",
    common_mistakes: [
      "Hablar de servicios sin preguntar primero cuál es el problema del cliente — los consultores que escuchan primero cierran más",
      "No tener testimonios con resultados específicos y medibles — las promesas vagas no generan credibilidad",
      "Compartir honorarios sin contexto — siempre mencionar el valor antes del precio",
      "Responder mensajes con mucho texto en el primer contacto — abruma al cliente potencial",
      "No ofrecer sesión gratuita de diagnóstico — es el paso que más reduce la fricción de compra en servicios de consultoría",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // PASTELERÍA / PANADERÍA
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "bakery",
    sector:      "bakery",
    name:        "Pastelería / Panadería",
    description: "Para panaderías, pastelerías, repostería artesanal y negocios de dulces y postres.",
    icon:        "Cake",
    profile: {
      example_name:      "Dulce Arte Pastelería",
      short_description: "Pasteles artesanales hechos con amor. Tortas para eventos, cupcakes y postres del día. Pedidos con 48h de anticipo.",
      long_description:  "En Dulce Arte cada pieza es única. Pasteles personalizados para bodas, cumpleaños y eventos especiales. También postres del día, cupcakes y pan artesanal. Todo hecho con ingredientes naturales y sin conservantes.",
      keywords:          ["pastelería", "panadería", "torta personalizada", "pasteles", "cupcakes", "repostería", "bodas", "cumpleaños", "postres", "artesanal", "sin conservantes", "pedidos"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 🎂 Bienvenido a Dulce Arte. ¿Buscas un pastel especial para un evento, quieres ver nuestros postres del día o tienes alguna otra consulta?",
        "¡Qué dulce que nos escribas! 🍰 Somos Dulce Arte — pasteles artesanales para cada ocasión. ¿En qué te podemos ayudar?",
        "¡Hola! Gracias por contactarnos. En Dulce Arte hacemos tus ideas realidad en pasteles y postres. ¿Para qué ocasión o evento estás buscando?",
      ],
      away_message: "¡Hola! Gracias por escribirnos. Atendemos lunes a sábado de 8:00 a 18:00. Recuerda que los pedidos especiales necesitan mínimo 48 horas de anticipación. Te respondemos a la brevedad 🎂",
      quick_replies: [
        { title: "/pasteles",    message: "Hacemos pasteles para: 🎂 Cumpleaños | 💒 Bodas | 🎓 Graduaciones | 🍼 Baby shower | 🎉 Todo tipo de eventos. ¿Para qué ocasión buscas?" },
        { title: "/pedido",      message: "Para tomar tu pedido necesito: ocasión, fecha del evento, número de porciones, sabor preferido y si tienes algún diseño en mente. ¿Me das esos datos?" },
        { title: "/precios",     message: "Los precios dependen del tamaño, diseño y sabor. ¿Para cuántas personas es? Te preparo un presupuesto personalizado." },
        { title: "/sabores",     message: "Sabores disponibles: 🍫 Chocolate | 🍦 Vainilla | 🍓 Fresas con crema | 🍋 Limón | 🥕 Zanahoria | ☕ Café | 🍌 Banana. ¿Alguno favorito?" },
        { title: "/anticipacion",message: "Los pasteles personalizados necesitan mínimo 48 horas de anticipación. Para bodas o eventos grandes, recomendamos reservar con al menos 2 semanas." },
        { title: "/diseño",      message: "Puedes enviarnos una foto de referencia del diseño que buscas. Intentamos recrearlo con nuestro estilo artesanal. ¿Tienes alguna imagen de referencia?" },
        { title: "/delivery",    message: "Hacemos entrega a domicilio en [zona de cobertura]. El costo del envío depende de la distancia. ¿Nos dices tu dirección?" },
        { title: "/postres",     message: "Tenemos postres del día disponibles: cupcakes, brownies, alfajores, cheesecake y más. ¿Quieres la lista de lo disponible hoy?" },
        { title: "/alergias",    message: "Importante: trabajamos con gluten, lácteos y frutos secos. Si tienes alguna alergia, avísanos — podemos adaptar algunas recetas. ¿Tienes alguna restricción?" },
        { title: "/pago",        message: "Para pedidos especiales pedimos un anticipo del 50% al confirmar. El saldo restante se paga al retirar o al momento de la entrega." },
      ],
      status_texts: [
        { type: "producto",    text: "🎂 TORTA DEL DÍA — [Descripción del pastel]. Disponible para pedidos con 48h de anticipación. ¿La quieres para tu próximo evento? Escríbenos." },
        { type: "promo",       text: "🍰 ESPECIAL DE LA SEMANA — [Producto en promoción] con [descuento o beneficio]. Solo hasta el domingo. Pedidos por WhatsApp." },
        { type: "trabajo",     text: "✨ PEDIDO ENTREGADO HOY — Esta preciosura fue creada para [ocasión]. ¿Quieres tu pastel único? Escríbenos y hacemos tu idea realidad." },
        { type: "testimonio",  text: "💬 '\"El pastel de cumpleaños de mi hija quedó increíble. Todos lo felicitaron y el sabor era delicioso.\"' — Ana P." },
        { type: "dato",        text: "🧁 ¿Sabías que nuestros pasteles no llevan conservantes ni colorantes artificiales? Solo ingredientes naturales y mucho amor en cada preparación." },
        { type: "recordatorio",text: "📅 ¿Tienes un evento próximo? Recuerda que los pedidos especiales necesitan mínimo 48 horas de anticipación. ¡No te quedes sin tu pastel! Escríbenos hoy." },
        { type: "motivacional", text: "🎉 Porque cada celebración merece un pastel especial. ¿Qué evento se viene próximo en tu vida? Nosotros lo hacemos dulce. 🎂" },
      ],
    },
    catalog_items: [
      { name: "Torta Personalizada (10-15 porciones)", description: "Pastel artesanal con diseño personalizado. Elige sabor, relleno y decoración. Ideal para cumpleaños y eventos.",    category: "Pasteles",  cta: "Pide tu presupuesto" },
      { name: "Torta de Bodas",                        description: "Pastel elegante de varios pisos para bodas y aniversarios. Diseño exclusivo, sabores gourmet. Consulta disponibilidad.", category: "Eventos",  cta: "Reserva con anticipación" },
      { name: "Cupcakes (docena)",                     description: "12 cupcakes artesanales. Elige sabor y decoración temática. Sin conservantes, con crema de mantequilla natural.",   category: "Porciones",price: 25, cta: "Pide tu docena" },
      { name: "Cheesecake Artesanal",                  description: "Cheesecake de queso crema con base de galleta y topping a elección: frutos rojos, caramelo o maracuyá.",          category: "Postres",   price: 18, cta: "Pide el tuyo" },
      { name: "Brownies (caja de 6)",                  description: "Brownies de chocolate intenso, húmedos y densos. Con nueces opcionales. Perfectos como regalo o postre.",         category: "Postres",   price: 12, cta: "¿Con o sin nueces?" },
      { name: "Pan Artesanal",                         description: "Pan de masa madre, integral, de centeno y baguettes. Horneado fresco cada mañana. Disponible de 8:00 a 12:00.",  category: "Panadería", price: 5,  cta: "Ven temprano — se acaba" },
    ],
    strategy: "Las pastelerías viven de las fotos. El impacto visual es el motor de conversión número 1. Cada pedido entregado debe fotografiarse y publicarse en los estados con el tipo de ocasión (sin datos del cliente). El catálogo con fotos reales de tus trabajos es el principal activo de ventas. Construye urgencia con disponibilidad limitada y anticipación requerida.",
    common_mistakes: [
      "No especificar el tiempo mínimo de anticipación desde el primer mensaje — genera pedidos de último minuto imposibles de cumplir",
      "Catálogo sin fotos reales — las pastelerías venden con los ojos, no con los textos",
      "No preguntar cantidad de porciones antes de dar precio — el presupuesto sin esta info es siempre incorrecto",
      "No pedir anticipo al confirmar el pedido — aumenta las cancelaciones de último momento",
      "No tener respuesta rápida sobre alergias — es un tema de seguridad que los clientes preguntan siempre",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // TIENDA DE ROPA / MODA
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "clothing",
    sector:      "clothing",
    name:        "Tienda de Ropa / Moda",
    description: "Para tiendas de ropa, boutiques, moda femenina, masculina o unisex.",
    icon:        "ShoppingBag",
    profile: {
      example_name:      "Moda & Estilo Boutique",
      short_description: "Moda actual para toda ocasión. Nuevas colecciones cada semana. Envíos nacionales. ¡Tu estilo, tu identidad!",
      long_description:  "En Moda & Estilo encontrarás ropa y accesorios para cada ocasión. Colecciones actualizadas semanalmente, tallas S a XXL y envíos a todo el país. Atendemos por WhatsApp con catálogo completo disponible.",
      keywords:          ["tienda de ropa", "moda", "boutique", "ropa femenina", "colección", "tendencias", "envíos", "tallas", "accesorios", "outfit", "estilo", "moda actual"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 👗 Bienvenida a Moda & Estilo. Tenemos las últimas tendencias disponibles. ¿Buscas algo en particular o quieres que te enviemos el catálogo de novedades?",
        "¡Hola, bienvenida! ✨ En Moda & Estilo tenemos ropa para cada ocasión y estilo. ¿Qué tipo de prenda buscas hoy?",
        "¡Qué bueno que nos escribes! 👠 Somos Moda & Estilo — moda actualizada cada semana. ¿Tienes alguna ocasión especial o buscas algo en particular?",
      ],
      away_message: "¡Hola! Gracias por escribirnos. En este momento estamos fuera de horario. Atendemos lunes a sábado de 10:00 a 20:00. Mañana te respondemos con todo el catálogo disponible 👗",
      quick_replies: [
        { title: "/catalogo",   message: "¡Con gusto! ¿Qué tipo de prenda buscas? 👗 Vestidos | 👖 Pantalones | 👚 Blusas | 🧥 Chaquetas | 👠 Accesorios. Así te envío las opciones más relevantes." },
        { title: "/tallas",     message: "Manejamos tallas S, M, L, XL y XXL en la mayoría de prendas. ¿Cuál es tu talla habitual? Te digo si hay disponibilidad en lo que te interesa." },
        { title: "/precios",    message: "Los precios van desde $X hasta $X según la prenda y el diseño. ¿Me dices qué tipo de ropa buscas y el presupuesto que tienes en mente?" },
        { title: "/envios",     message: "Hacemos envíos a todo el país. El costo varía según tu ciudad. ¿Nos dices dónde estás y te cotizamos el envío?" },
        { title: "/novedades",  message: "¡Acabamos de recibir nueva colección! Tenemos [descripción de novedades]. ¿Quieres que te enviemos fotos de las piezas nuevas?" },
        { title: "/pagos",      message: "Aceptamos: transferencia bancaria, tarjeta de crédito/débito y efectivo (si es retiro en tienda). Para envíos pedimos pago previo al despacho." },
        { title: "/devolucion", message: "Aceptamos cambios dentro de los 7 días con la prenda sin usar y con etiqueta. Para cambios de talla, sin costo adicional. ¿Tienes algún inconveniente?" },
        { title: "/outfit",     message: "¡Podemos ayudarte a armar un outfit completo! Cuéntanos: ¿para qué ocasión es, cuál es tu estilo y qué colores prefieres?" },
        { title: "/retiro",     message: "Si prefieres retirar en tienda, estamos en [dirección]. Horario de lunes a sábado de 10:00 a 20:00. ¿Cuándo pasarías?" },
        { title: "/mayoreo",    message: "Tenemos precios especiales para compras al por mayor (mínimo [X] prendas). Si eres revendedora o tienes un negocio, escríbenos para darte más info." },
      ],
      status_texts: [
        { type: "novedad",      text: "👗 NUEVA COLECCIÓN — Recién llegada. [Descripción]. Tallas S a XL. Envíos en 24-48h. Escríbenos antes de que se agote. ¡Son piezas únicas!" },
        { type: "promo",        text: "🏷️ DESCUENTO DEL DÍA — [Prenda] con [X]% OFF solo hoy. De $X a $X. Stock limitado. Escríbenos ahora para apartar la tuya." },
        { type: "outfit",       text: "✨ LOOK DEL DÍA — Así combinamos [prenda 1] con [prenda 2]. Disponible ahora. ¿Te lo enviamos? Dinos tu talla y te hacemos llegar el outfit completo." },
        { type: "testimonio",   text: "💬 '\"La calidad es excelente y el envío llegó super rápido. Ya compré 3 veces y siempre feliz.\"' — Valentina M." },
        { type: "restock",      text: "🔁 REPUSIMOS STOCK — [Prenda] que se había agotado está de vuelta. Tallas S, M y L disponibles. Escríbenos antes de que vuele de nuevo. 👗" },
        { type: "talla",        text: "📐 Ahora tenemos hasta talla XXL en toda la colección. Moda para todas las figuras. ¿Quieres ver las opciones disponibles en tu talla?" },
        { type: "envio",        text: "📦 ¿Sabes que enviamos a todo el país? Empacamos con cuidado y te enviamos tu pedido en 24-48h. Solo escríbenos. ¡Tu estilo te espera!" },
      ],
    },
    catalog_items: [
      { name: "Vestido de Noche",     description: "Vestido elegante para eventos formales y ocasiones especiales. Telas premium, corte a medida y diseños actuales.",               category: "Vestidos",    price: 45, cta: "Consulta tallas disponibles" },
      { name: "Blusa Casual",         description: "Blusa cómoda y versátil para el día a día. Disponible en múltiples colores y estampados. Tallas S a XXL.",                     category: "Blusas",      price: 20, cta: "Ver colores disponibles" },
      { name: "Pantalón de Vestir",   description: "Pantalón recto, corte cómodo y elegante. Ideal para trabajo o salidas. Tela de calidad, fácil de lavar.",                     category: "Pantalones",  price: 30, cta: "¿Qué talla necesitas?" },
      { name: "Chaqueta / Blazer",    description: "Chaqueta estructurada que eleva cualquier outfit. Para trabajo, reuniones y salidas especiales. Varios colores disponibles.",  category: "Chaquetas",   price: 55, cta: "Disponible en 3 colores" },
      { name: "Set / Conjunto",       description: "Conjunto coordinado de 2 piezas. Blusa + pantalón o blusa + falda. El look completo resuelto en una sola compra.",            category: "Conjuntos",   price: 50, cta: "El favorito de la semana" },
      { name: "Accesorios",           description: "Bolsos, cinturones, aretes y collares para completar tu look. Actualizamos la colección cada semana.",                        category: "Accesorios",  price: 15, cta: "Ver lo disponible hoy" },
    ],
    strategy: "Las tiendas de ropa convierten mejor cuando responden rápido con fotos reales. El cliente de moda no espera — si no respondes en 10 minutos, busca en otra tienda. Los estados son tu mejor vidriera digital: publica outfits completos, no prendas aisladas. El catálogo debe incluir fotos con modelo (o en maniquí mínimo) para dar dimensión real de la prenda.",
    common_mistakes: [
      "Publicar fotos de ropa sin modelo o maniquí — el cliente no puede imaginar cómo cae la prenda",
      "No especificar tallas disponibles en el primer mensaje — es la primera pregunta siempre",
      "No preguntar el presupuesto antes de mostrar el catálogo completo — pierde tiempo del cliente y tuyo",
      "Responder lento en horario comercial — en moda online, la competencia está a un clic de distancia",
      "No tener política de cambios clara desde el principio — la duda sobre cambios es la mayor barrera para comprar online",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CLASES PARTICULARES
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "tutoring",
    sector:      "tutoring",
    name:        "Clases Particulares",
    description: "Para tutores, profesores particulares y academias de refuerzo escolar o universitario.",
    icon:        "GraduationCap",
    profile: {
      example_name:      "ProfeOnline Clases",
      short_description: "Clases particulares online y presenciales. Matemáticas, ciencias y más. Primera clase gratis. Resultados garantizados.",
      long_description:  "En ProfeOnline ayudamos a estudiantes a mejorar sus calificaciones y comprender de verdad las materias. Clases individuales y grupales, online y presenciales. Profesores certificados con experiencia comprobada.",
      keywords:          ["clases particulares", "tutor", "refuerzo escolar", "matemáticas", "física", "química", "clases online", "nivelación", "estudiantes", "profesores", "academia", "primera clase gratis"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 📚 Bienvenido a ProfeOnline. Estamos para ayudar a tu hijo/a (o a ti) a mejorar en las materias que más cuesta. ¿En qué materia necesitan ayuda?",
        "¡Hola! Gracias por contactarnos 🎓 En ProfeOnline hacemos que cada estudiante entienda de verdad, no solo memorice. ¿Para qué materia o nivel buscas clases?",
        "¡Bienvenido/a! La primera clase siempre es la más difícil — la de pedir ayuda. Ya la diste 💪 Cuéntame: ¿para quién son las clases y en qué materia?",
      ],
      away_message: "Hola, gracias por escribirnos. En este momento estamos en clase. Nuestro horario de atención es de 8:00 a 20:00. Te respondemos en cuanto podamos para coordinar las clases 📚",
      quick_replies: [
        { title: "/materias",    message: "Damos clases de: ➗ Matemáticas | 🔬 Física | ⚗️ Química | 🧬 Biología | 📝 Lengua/Redacción | 🌐 Inglés | 💻 Programación. ¿Cuál necesitas?" },
        { title: "/niveles",     message: "Trabajamos con: 📗 Primaria | 📘 Secundaria/Bachillerato | 🎓 Universidad | 📋 Preparación para exámenes (ICFES, PAA, etc.). ¿Cuál es el nivel?" },
        { title: "/precios",     message: "Las clases van desde $X/hora para clases individuales. Tenemos descuentos para paquetes de 4 y 8 clases. ¿Cuántas horas semanales necesitas?" },
        { title: "/modalidad",   message: "Ofrecemos clases: 💻 Online (Zoom/Meet) | 🏫 Presencial en nuestra sede | 🏠 A domicilio (disponibilidad limitada). ¿Cuál prefieres?" },
        { title: "/primera",     message: "¡La primera clase es gratis! Sin compromiso. Evaluamos al estudiante, detectamos los puntos débiles y definimos el plan de trabajo. ¿Agendamos?" },
        { title: "/horarios",    message: "Tenemos disponibilidad de lunes a sábado de 7:00 a 21:00. ¿Qué días y horarios le quedan mejor al estudiante?" },
        { title: "/resultados",  message: "Nuestros estudiantes mejoran en promedio [X] puntos en su calificación en el primer mes. ¿Cuál es la nota actual en la materia y cuál es el objetivo?" },
        { title: "/grupo",       message: "Tenemos clases grupales (máx. 4 alumnos) a un precio más accesible. Son ideales para estudiantes del mismo nivel. ¿Les interesa esta modalidad?" },
        { title: "/agenda",      message: "Para agendar la clase de prueba necesito: nombre del estudiante, materia, nivel/grado, día y hora preferidos. ¿Me los pasas?" },
        { title: "/pagos",       message: "Aceptamos efectivo, transferencia y tarjeta. Las clases se pagan por paquete semanal o mensual. ¿Cuál se adapta mejor a tu situación?" },
      ],
      status_texts: [
        { type: "cta",          text: "📚 ¿Las notas no están donde deberían estar? Tenemos la solución. Primera clase GRATIS, sin compromiso. Escríbenos y empezamos esta semana." },
        { type: "testimonio",   text: "🎓 '\"Mi hijo subió de 4.5 a 8.0 en matemáticas en solo 2 meses. Ahora le gusta la materia.\"' — Mamá de Andrés, estudiante de 9° grado." },
        { type: "dato",         text: "🧠 ¿Sabías que la mejor manera de entender matemáticas no es memorizar fórmulas sino practicar el razonamiento? Así es como lo enseñamos." },
        { type: "promo",        text: "📅 PAQUETE DE 8 CLASES con 20% de descuento si te inscribes antes del [fecha]. Incluye material de estudio y seguimiento de progreso." },
        { type: "resultado",    text: "📈 ÉXITO DEL MES — [Nombre del estudiante] pasó de reprobar a sacar [X] en el examen final de [materia]. ¡El esfuerzo y el método dan frutos!" },
        { type: "materia",      text: "🔬 ¿Química parece imposible? Con el método correcto y práctica guiada, cualquier estudiante puede entenderla. Primera clase gratis esta semana." },
        { type: "reflexion",    text: "💡 Las malas notas rara vez son por falta de capacidad — casi siempre es el método de enseñanza. Nuestros profesores adaptan la explicación a cada estudiante." },
      ],
    },
    catalog_items: [
      { name: "Clase Individual (1h)",   description: "Sesión de una hora 1 a 1 con el profesor. Atención personalizada y avance según el ritmo del estudiante.",         category: "Clases",   price: 25, cta: "Primera clase gratis" },
      { name: "Paquete 4 Clases",        description: "4 sesiones individuales de 1 hora. Ahorra 10% vs precio por clase. Ideal para repasos puntuales o exámenes.",     category: "Paquetes", price: 90, cta: "El más elegido" },
      { name: "Paquete 8 Clases",        description: "8 sesiones individuales. Ahorra 20%. Incluye seguimiento de progreso y material de práctica. Avance real y medible.", category: "Paquetes", price: 160, cta: "Mejor inversión" },
      { name: "Clase Grupal (máx. 4)",   description: "Sesión grupal con máximo 4 estudiantes del mismo nivel. Precio accesible y dinámica colaborativa. Consulta disponibilidad.", category: "Grupos", price: 15, cta: "¿Hay grupo en tu nivel?" },
      { name: "Preparación para Examen", description: "Plan intensivo de 4-8 clases para preparar exámenes de admisión, finales o recuperatorios. Enfoque en puntos clave.", category: "Especial", cta: "¿Cuándo es tu examen?" },
      { name: "Clase Online (Zoom)",     description: "Misma calidad que la clase presencial, desde cualquier lugar. Grabación disponible para repasar. Tablero digital incluido.", category: "Online",  price: 20, cta: "Flexible y efectivo" },
    ],
    strategy: "La primera clase gratis es el activo más poderoso de este sector — elimina el riesgo percibido y permite que el estudiante y el tutor se conozcan antes de comprometerse. Los testimonios con mejoras de notas específicas (no genéricas) son los más convincentes. Comunica siempre el método, no solo la materia — los padres quieren saber cómo enseñas, no solo qué enseñas.",
    common_mistakes: [
      "No ofrecer clase de prueba gratuita — es la barrera más fácil de eliminar y la que más conversiones genera",
      "Hablar solo de la materia sin mencionar el método y los resultados — los padres contratan al profesor, no a la materia",
      "No preguntar el nivel y nota actual desde el primer mensaje — sin eso es imposible dar información relevante",
      "Mensajes muy largos al primer contacto — simplifica y pregunta solo lo esencial para empezar",
      "No publicar testimonios con resultados específicos (mejora de nota, aprobación de examen) — los resultados genéricos no convencen",
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // AGENCIA DE MARKETING
  // ─────────────────────────────────────────────────────────────────
  {
    id:          "marketing",
    sector:      "marketing",
    name:        "Agencia de Marketing",
    description: "Para agencias de marketing digital, community management, publicidad y branding.",
    icon:        "Megaphone",
    profile: {
      example_name:      "Digital Boost Agency",
      short_description: "Más clientes, más ventas, más presencia digital. Especialistas en redes sociales, pauta y posicionamiento. Consulta gratuita.",
      long_description:  "Digital Boost es la agencia que convierte tu presencia digital en resultados reales. Gestión de redes, campañas de publicidad, contenido estratégico y branding para negocios que quieren crecer. Resultados medibles desde el primer mes.",
      keywords:          ["agencia de marketing", "marketing digital", "redes sociales", "community manager", "publicidad", "Google Ads", "Facebook Ads", "contenido", "branding", "posicionamiento", "SEO", "resultados"],
    },
    messages: {
      welcome_messages: [
        "¡Hola! 🚀 Bienvenido a Digital Boost. Ayudamos a negocios a crecer en digital de forma estratégica. ¿Cuál es el mayor desafío de tu negocio en redes sociales o publicidad?",
        "¡Hola! Gracias por escribirnos 📱 En Digital Boost convertimos presencia digital en ventas reales. ¿Qué servicio necesitas o en qué redes quieres mejorar?",
        "¡Bienvenido/a! Somos Digital Boost — la agencia que hace que tu negocio se destaque online. ¿Cuéntanos de qué trata tu negocio y qué resultados buscas?",
      ],
      away_message: "¡Hola! Gracias por contactarnos. Estamos fuera de horario o en reunión con clientes. Atendemos lunes a viernes de 9:00 a 18:00. Te respondemos pronto con toda la info 🚀",
      quick_replies: [
        { title: "/servicios",   message: "Ofrecemos: 📱 Gestión de redes sociales | 🎯 Publicidad (Meta Ads, Google Ads) | 🎨 Diseño de contenido | 🌐 SEO y posicionamiento web | 💡 Estrategia digital. ¿Cuál necesitas?" },
        { title: "/precios",     message: "Los planes empiezan desde $X/mes e incluyen [descripción del plan base]. ¿Me dices qué servicio te interesa y el tamaño de tu negocio para prepararte una propuesta?" },
        { title: "/consulta",    message: "¡Ofrecemos una auditoría digital gratuita de 30 minutos! Analizamos tu presencia actual y te decimos qué mejorar. Sin compromiso. ¿Agendamos?" },
        { title: "/redes",       message: "Manejamos: Instagram, Facebook, TikTok, LinkedIn y Twitter/X. También Google Business Profile. ¿En cuáles redes quieres enfocarte?" },
        { title: "/resultados",  message: "Nuestros clientes logran en promedio +40% de alcance y +25% de interacción en los primeros 2 meses. ¿Quieres ver casos de éxito de tu sector?" },
        { title: "/contenido",   message: "El servicio de contenido incluye: planificación mensual, diseño de piezas, redacción de textos y programación de publicaciones. ¿Cuántas publicaciones semanales necesitas?" },
        { title: "/pauta",       message: "Manejamos campañas en Meta Ads, Google Ads y TikTok Ads. Optimizamos para que cada peso invertido genere el mayor retorno posible. ¿Tienes presupuesto definido para pauta?" },
        { title: "/contrato",    message: "Trabajamos con contratos mensuales renovables. No pedimos permanencia mínima en el primer mes para que compruebes los resultados sin riesgo." },
        { title: "/proceso",     message: "Nuestro proceso: 1️⃣ Auditoría y diagnóstico | 2️⃣ Estrategia a medida | 3️⃣ Implementación | 4️⃣ Reporte mensual de resultados. ¿Te cuento más?" },
        { title: "/referencias", message: "Tenemos clientes en [sectores]. Puedo compartirte casos de éxito relevantes para tu rubro. ¿De qué sector es tu negocio?" },
      ],
      status_texts: [
        { type: "resultado",    text: "📈 CASO DE ÉXITO — [Cliente del sector] pasó de [X] seguidores a [Y] y triplicó sus ventas por redes en 3 meses. ¿Quieres el mismo resultado?" },
        { type: "servicio",     text: "🎯 ¿Estás invirtiendo en pauta sin saber si funciona? Te auditamos las campañas GRATIS y te decimos exactamente dónde se pierde el dinero." },
        { type: "dato",         text: "📊 El 78% de los consumidores investiga en redes sociales antes de comprar. ¿Qué encuentran cuando buscan tu negocio? Hablemos." },
        { type: "promo",        text: "🚀 PRIMER MES ESPECIAL — Gestión completa de 2 redes sociales con 20% de descuento para nuevos clientes. Solo [X] cupos disponibles este mes." },
        { type: "reflexion",    text: "💡 No es cuántas veces publicas — es qué publicas y cuándo. Una estrategia bien hecha supera a 10 publicaciones sin dirección. ¿Tienes estrategia?" },
        { type: "testimonio",   text: "💬 '\"En 2 meses duplicamos las consultas de clientes nuevos desde Instagram. El ROI superó lo que esperábamos.\"' — María T., dueña de [tipo de negocio]." },
        { type: "cta",          text: "📱 Tu competencia ya está en digital. ¿Cuándo empiezas tú? Agenda una auditoría gratuita esta semana y define el plan de crecimiento. Escríbenos." },
      ],
    },
    catalog_items: [
      { name: "Plan Starter — Redes Sociales", description: "Gestión de 2 redes sociales: 12 publicaciones/mes + 4 stories semanales + reporte mensual. Ideal para empezar.",      category: "Planes",   price: 350, cta: "El más popular para comenzar" },
      { name: "Plan Pro — Redes + Pauta",      description: "Gestión de 3 redes + campañas en Meta Ads + reporte semanal de resultados. Crecimiento acelerado garantizado.",       category: "Planes",   price: 700, cta: "Más alcance, más ventas" },
      { name: "Gestión de Pauta (Ads)",        description: "Creación y optimización de campañas en Meta Ads o Google Ads. Fee de gestión sobre la inversión en pauta.",           category: "Publicidad", cta: "¿Cuál es tu presupuesto de pauta?" },
      { name: "Auditoría Digital",             description: "Análisis completo de tu presencia digital: redes, web, Google Business. Informe con recomendaciones de mejora.",      category: "Diagnóstico", cta: "Primera auditoría gratuita" },
      { name: "Producción de Contenido",       description: "Diseño de piezas gráficas, videos cortos y textos para redes sociales. Pack mensual de contenido listo para publicar.", category: "Contenido", cta: "¿Cuántas piezas necesitas?" },
      { name: "Estrategia Digital",            description: "Definición de estrategia de presencia digital: audiencia, canales, mensajes, contenido y KPIs. Entregable completo.", category: "Consultoría", cta: "El primer paso correcto" },
    ],
    strategy: "Las agencias de marketing deben demostrar que saben de marketing con su propio perfil. La calidad del contenido de tus propios estados es tu principal carta de presentación. Los casos de éxito con números reales son el contenido de mayor conversión. La auditoría gratuita reduce el riesgo percibido y permite mostrar valor antes de vender.",
    common_mistakes: [
      "Hablar de 'visibilidad' y 'engagement' sin mencionar ventas — los clientes contratan marketing para vender más, no para tener más likes",
      "No tener casos de éxito con métricas reales — las promesas genéricas no diferencian a una agencia de otra",
      "Dar precios sin diagnosticar primero — el precio sin contexto siempre parece caro",
      "Perfil de WhatsApp con poca presencia o mal diseñado — es la peor publicidad para una agencia de marketing",
      "No demostrar consistencia en los propios estados — si no publicas regularmente en tu propio WhatsApp, el cliente duda de tu capacidad de publicar por ellos",
    ],
  },
]

export function getTemplateById(id: string): SectorTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesBySector(sector: string): SectorTemplate[] {
  return SYSTEM_TEMPLATES.filter((t) => t.sector === sector)
}

export const TEMPLATE_SECTORS = [
  ...new Set(SYSTEM_TEMPLATES.map((t) => t.sector)),
]
