import { ACTIVE_DUTY, CS_MAPS } from "@/lib/data/maps";
import { PRO_PLAYERS } from "@/lib/data/pros";
import { TEAMS } from "@/lib/data/teams";
import type { GameEvent, PlayerState, StatEffects } from "@/lib/types/game";

/* -------------------------------------------------------------------------- */
/*                              hand-written events                            */
/* -------------------------------------------------------------------------- */

const MATCH_EVENTS: GameEvent[] = [
  {
    id: "mirage-1v3-window",
    title: "1v3 en A de Mirage",
    description:
      "Match point del rival. Quedás solo en A site con la bomba plantada, 12 segundos y tres CT vivos entre Palace, Jungle y CT. Tenés AK, media vida y una smoke.",
    category: "match",
    mapId: "mirage",
    scene: "map",
    options: [
      {
        id: "hold-angle",
        label: "Jugar el ángulo del default",
        description: "Esperar el retake y confiar en tu pre-aim.",
        effects: {},
        minigame: "reaction",
        successEffects: { clutch: 4, fame: 6, form: 2 },
        failEffects: { clutch: -1, tilt: 2, fame: -2 },
        successText:
          "Tres headshots en cuatro segundos. La arena explota y el clip da la vuelta al mundo.",
        failText:
          "Te agarran flasheado desde Jungle. El silencio del equipo dice todo.",
        outcomeText: "",
        grantsGraffiti: "gg-clutch",
      },
      {
        id: "smoke-off",
        label: "Smokear CT y jugar el tiempo",
        description: "Cortar la visión y forzar que entren por uno.",
        effects: { utility: 2, gameSense: 1 },
        outcomeText:
          "La smoke los parte. Matás a dos que entran en fila y el tercero no llega a defusear.",
      },
      {
        id: "rush-heaven",
        label: "Subir a Palace y jugar desde arriba",
        description: "Alto riesgo: si te leen, estás muerto sin disparar.",
        risk: true,
        effects: { movement: 2, tilt: 1 },
        outcomeText:
          "Te leen el timing. Morís en la escalera y el defuse llega tranquilo.",
      },
    ],
  },
  {
    id: "inferno-banana-awp",
    title: "Duelo de AWP en Banana",
    description:
      "Pistol round perdido, el rival tiene AWP en Banana y no deja pasar a nadie. Tu IGL te mira: ¿comprás la Scout o forzás con la tuya?",
    category: "match",
    mapId: "inferno",
    scene: "map",
    options: [
      {
        id: "flick-duel",
        label: "Comprar AWP y ganar el duelo",
        description: "Peek y flick. Uno de los dos vuelve al spawn.",
        effects: {},
        minigame: "flick",
        successEffects: { aim: 3, fame: 4, form: 1 },
        failEffects: { tilt: 2, fame: -1, form: -1 },
        successText:
          "Jiggle, peek, click. Le sacás la AWP y el mapa se te abre entero.",
        failText:
          "Te gana el duelo y encima recoge tu AWP. El half se te va de las manos.",
        outcomeText: "",
      },
      {
        id: "molly-flash",
        label: "Molotov + flash del support",
        description: "Sacarlo del ángulo con utilidad coordinada.",
        effects: { utility: 3, chemistry: 1 },
        outcomeText:
          "La molly lo saca, la flash lo ciega y entran los tres riflers. Banana es tuya.",
      },
      {
        id: "eco-save",
        label: "Guardar y jugar la economía",
        description: "Perder el round pero llegar con full buy.",
        effects: { gameSense: 2 },
        outcomeText:
          "Salvás dos armas. Al round siguiente entran con full buy y lo dan vuelta.",
      },
    ],
  },
  {
    id: "nuke-retake-ramp",
    title: "Retake en Nuke con 8 segundos",
    description:
      "Bomba plantada en A de Nuke. Bajás de Heaven con dos compañeros vivos y el reloj corriendo. El defuse tarda 5 segundos con kit.",
    category: "match",
    mapId: "nuke",
    scene: "map",
    options: [
      {
        id: "defuse-timing",
        label: "Bajar y defusear vos",
        description: "Cronómetro contra tu pulso.",
        effects: {},
        minigame: "defuse",
        successEffects: { clutch: 3, gameSense: 2, fame: 5 },
        failEffects: { tilt: 3, fame: -2 },
        successText:
          "Defuse con 0.4 segundos en el reloj. El caster se queda sin voz.",
        failText:
          "Un tick tarde. El mapa se te escapa por menos de medio segundo.",
        outcomeText: "",
      },
      {
        id: "clear-first",
        label: "Limpiar Squeaky antes de bajar",
        description: "Seguro pero lento.",
        effects: { gameSense: 2, clutch: -1 },
        outcomeText:
          "Limpiás bien, pero cuando llegás la bomba ya está en 2 segundos. Round perdido con la razón de tu lado.",
      },
      {
        id: "fake-defuse",
        label: "Fake defuse y esperar el peek",
        description: "Truco viejo, sigue funcionando.",
        effects: { gameSense: 3, fame: 2 },
        outcomeText:
          "Tocás la bomba, soltás, y el que estaba en Heaven se asoma. Headshot y defuse limpio.",
      },
    ],
  },
  {
    id: "anubis-spray-transfer",
    title: "Spray transfer en Connector",
    description:
      "Dos enemigos apilados en Connector de Anubis. Tenés M4A1-S con 20 balas y ellos no te vieron todavía.",
    category: "match",
    mapId: "anubis",
    scene: "map",
    options: [
      {
        id: "spray-control",
        label: "Ráfaga larga y transfer",
        description: "Controlar el retroceso y pasar al segundo cuerpo.",
        effects: {},
        minigame: "spray",
        successEffects: { aim: 4, fame: 3 },
        failEffects: { aim: -1, tilt: 2 },
        successText:
          "Doce balas, dos muertos. El patrón te salió como en el mapa de entrenamiento.",
        failText:
          "La cuarta bala se te va al techo. Te comen los dos al mismo tiempo.",
        outcomeText: "",
      },
      {
        id: "tap-safe",
        label: "Tapear al primero y reposicionar",
        description: "Seguro: uno seguro vale más que dos inciertos.",
        effects: { aim: 1, gameSense: 2 },
        outcomeText:
          "Un tap limpio, retrocedés y trade del compañero. Round ganado sin heroísmos.",
      },
      {
        id: "he-nade",
        label: "Tirar la HE sobre los dos",
        description: "50 de daño a cada uno y entran los tuyos.",
        effects: { utility: 3 },
        outcomeText:
          "La HE los deja en rojo. Tu entry los barre y el site queda libre.",
      },
    ],
  },
  {
    id: "ancient-eco-force",
    title: "Decisión económica en Ancient",
    description:
      "10-10 en Ancient. Quedan $2900 por jugador. Tu IGL pregunta al equipo: force buy con Galil y kevlar, o eco completo para asegurar el full del round siguiente.",
    category: "match",
    mapId: "ancient",
    scene: "map",
    options: [
      {
        id: "force",
        label: "Force buy: entramos ya",
        description: "Si sale, quebrás al rival. Si no, dos rounds regalados.",
        risk: true,
        effects: { gameSense: 1, form: 1 },
        outcomeText:
          "El force sale redondo. Ganan el round, roban tres AK y el rival queda en eco.",
      },
      {
        id: "full-eco",
        label: "Eco total, guardamos todo",
        description: "Disciplina de economía.",
        effects: { gameSense: 3 },
        outcomeText:
          "Pierden el round pero llegan con full buy y utilidad completa. El mapa se ordena.",
      },
      {
        id: "half-buy",
        label: "Medio buy con SMGs",
        description: "Cazar el bonus de las SMG.",
        effects: { gameSense: 1, utility: 1 },
        outcomeText:
          "Las MP9 hacen su trabajo en el site chico. Round robado y economía intacta.",
      },
    ],
  },
  {
    id: "dust2-pistol-round",
    title: "Pistol round en Dust II",
    description:
      "Primera ronda del mapa. Tu IGL propone rush B por túneles con las cinco Glocks. Vos venías practicando el spam de Long.",
    category: "match",
    mapId: "dust2",
    scene: "map",
    options: [
      {
        id: "follow-call",
        label: "Seguir el call del IGL",
        description: "El equipo primero.",
        effects: { chemistry: 2, gameSense: 1 },
        outcomeText:
          "Rush B ejecutado perfecto. Pistol ganado y el rival arranca 0-3 abajo.",
      },
      {
        id: "solo-long",
        label: "Irte solo a Long",
        description: "Si conseguís el pick, el equipo lo agradece. Si no, te lo cobran.",
        risk: true,
        effects: { chemistry: -2, aim: 1 },
        outcomeText:
          "Conseguís un pick pero el rush muere sin vos. El IGL te lo marca en el review.",
      },
      {
        id: "propose-split",
        label: "Proponer un split A",
        description: "Meter tu lectura en la mesa.",
        effects: { gameSense: 2, chemistry: 1, fame: 1 },
        outcomeText:
          "Proponés el split, sale, y el coach te empieza a pedir opiniones en los timeouts.",
      },
    ],
  },
  {
    id: "cache-ace-chance",
    title: "El equipo entero está en tus manos",
    description:
      "Cuatro compañeros muertos en Cache. Vos con AK full vida detrás de Checkers. Cinco enemigos vivos, sin bomba plantada. Nadie ha ganado un 1v5 en este torneo.",
    category: "match",
    mapId: "cache",
    scene: "map",
    minFame: 25,
    options: [
      {
        id: "go-for-it",
        label: "Ir por el ace",
        description: "Historia o clip de fail. No hay medias tintas.",
        risk: true,
        effects: {},
        minigame: "flick",
        successEffects: { aim: 4, clutch: 5, fame: 12, form: 3 },
        failEffects: { tilt: 2, fame: -1 },
        successText:
          "CINCO. Uno por uno. El equipo entra a la sala gritando y Valve toma nota.",
        failText:
          "Bajás a tres y el cuarto te agarra recargando. Igual la arena te aplaude.",
        outcomeText: "",
        grantsGraffiti: "gg-1v5",
      },
      {
        id: "save-awp",
        label: "Guardar el arma",
        description: "Round perdido, economía salvada.",
        effects: { gameSense: 2, fame: -1 },
        outcomeText:
          "Salvás el AK. El chat te putea, tu IGL te felicita. Ambos tienen razón.",
      },
    ],
  },
  {
    id: "knife-round-coinflip",
    title: "Round de cuchillos",
    description:
      "Ganaron el knife round. El equipo te deja elegir a vos: ¿arrancan de CT o de T? El mapa y la economía de la primera mitad dependen de esto.",
    category: "match",
    scene: "arena",
    options: [
      {
        id: "pick-side",
        label: "Elegir lado y jugarse",
        description: "Cara o ceca con los íconos de CT y T.",
        effects: {},
        minigame: "coinflip",
        successEffects: { form: 2, gameSense: 1, fame: 2 },
        failEffects: { form: -1, tilt: 1 },
        successText:
          "Elegiste bien. Arrancan 6-0 en el half y el rival nunca se acomoda.",
        failText:
          "Lado equivocado. El half se hace cuesta arriba desde el primer round.",
        outcomeText: "",
      },
      {
        id: "let-igl",
        label: "Dejar que decida el IGL",
        description: "Confiar en el cerebro del equipo.",
        effects: { chemistry: 2, gameSense: 1 },
        outcomeText:
          "El IGL elige CT. Cierran el half 8-4 y te agradece la confianza.",
      },
    ],
  },
];

const LOCKER_ROOM_EVENTS: GameEvent[] = [
  {
    id: "locker-igl-fight",
    title: "Discusión con el IGL",
    description:
      "Review de demos post-derrota. El IGL te muestra tres rounds donde te fuiste del default y dice, delante de todos, que jugás para tus stats y no para el equipo.",
    category: "lockerRoom",
    scene: "lockerRoom",
    options: [
      {
        id: "accept",
        label: "Bancar la crítica y ajustar",
        description: "Tragarte el orgullo delante del equipo.",
        effects: { chemistry: 4, gameSense: 2, fame: -1 },
        outcomeText:
          "Aceptás, corregís y en dos semanas el sistema fluye. El vestuario lo nota.",
      },
      {
        id: "push-back",
        label: "Discutir: tus números lo respaldan",
        description: "Defender tu juego con la data en la mano.",
        risk: true,
        effects: { chemistry: -4, benchRisk: 12, fame: 2, form: 1 },
        outcomeText:
          "Se arma. Tenés razón en los números, pero el coach empieza a mirar reemplazos.",
      },
      {
        id: "private-talk",
        label: "Pedir hablarlo en privado",
        description: "Bajar el tono y arreglarlo entre dos.",
        effects: { chemistry: 2, gameSense: 1, tilt: -1 },
        outcomeText:
          "Charla de 40 minutos a solas. Salen con un acuerdo y el equipo respira.",
      },
    ],
  },
  {
    id: "locker-bench-threat",
    title: "El coach te avisa",
    description:
      "Reunión a solas. El coach te dice que hay un jugador de la academia con rating 1.18 en tier 2 y que si no levantás en dos torneos, arrancás desde el banco.",
    category: "lockerRoom",
    scene: "lockerRoom",
    options: [
      {
        id: "grind",
        label: "Encerrarte a entrenar aim y demos",
        description: "Ocho horas por día, sin excusas.",
        effects: { aim: 4, reflexes: 3, form: 2, benchRisk: -20, tilt: 2 },
        outcomeText:
          "Volvés distinto. Tres torneos arriba de 1.15 y el tema del banco desaparece.",
      },
      {
        id: "ask-role-change",
        label: "Pedir un cambio de rol",
        description: "Quizás el problema es dónde te ponen, no cómo jugás.",
        effects: { gameSense: 3, chemistry: 2, benchRisk: -8 },
        outcomeText:
          "Te mueven de posición y tus números explotan. El coach admite que era el rol.",
      },
      {
        id: "ignore",
        label: "Ignorarlo, es presión de coach",
        description: "Ya escuchaste esto antes.",
        risk: true,
        effects: { benchRisk: 22, chemistry: -3, tilt: 1 },
        outcomeText:
          "No cambiás nada. El de la academia debuta el mes que viene y vos mirás desde atrás.",
      },
    ],
  },
  {
    id: "locker-benched",
    title: "Estás en el banco",
    description:
      "Anuncio oficial: pasás a la lista de transferibles. Seguís cobrando pero no jugás. El grupo de Discord del equipo sigue ahí, y duele.",
    category: "lockerRoom",
    scene: "lockerRoom",
    requiresBenched: true,
    options: [
      {
        id: "faceit-grind",
        label: "Grindear FACEIT y streamear",
        description: "Que te vean rendir aunque sea en pugs.",
        effects: { aim: 3, reflexes: 2, fame: 4, transferBoost: 12 },
        outcomeText:
          "Level 10 con 1.35 de rating y clips virales. Tres managers te escriben.",
      },
      {
        id: "stay-professional",
        label: "Entrenar con la academia y esperar",
        description: "Cero ruido, máxima profesionalidad.",
        effects: { gameSense: 3, chemistry: 3, transferBoost: 6 },
        outcomeText:
          "Tu actitud circula entre coaches. Nadie duda de que sos fácil de manejar.",
      },
      {
        id: "public-complaint",
        label: "Tuitear tu descargo",
        description: "Contar tu versión y ver qué pasa.",
        risk: true,
        effects: { fame: 8, chemistry: -6, transferBoost: -8, tilt: 2 },
        outcomeText:
          "El tuit explota. Ganás seguidores y perdés la mitad de tus pretendientes.",
      },
    ],
  },
  {
    id: "locker-roster-vote",
    title: "Votación de roster",
    description:
      "El equipo vota si echan al support histórico, que lleva tres años pero está en 0.88 de rating. Tu voto desempata.",
    category: "lockerRoom",
    scene: "lockerRoom",
    options: [
      {
        id: "keep-veteran",
        label: "Bancar al veterano",
        description: "Lealtad sobre planilla.",
        effects: { chemistry: 5, fame: 2, form: -1 },
        outcomeText:
          "Se queda, y te lo devuelve con dos temporadas de utilidad perfecta para vos.",
      },
      {
        id: "vote-out",
        label: "Votar por el cambio",
        description: "Frío pero probablemente correcto.",
        effects: { chemistry: -3, form: 2, gameSense: 1 },
        outcomeText:
          "Entra un joven de tier 2 y el rating colectivo sube. El vestuario queda raro un mes.",
      },
      {
        id: "abstain",
        label: "Abstenerte",
        description: "No es tu batalla.",
        effects: { chemistry: -1, gameSense: 1 },
        outcomeText:
          "Te abstenés. Nadie te lo reprocha, pero tampoco nadie te cuenta nada por un tiempo.",
      },
    ],
  },
  {
    id: "locker-bootcamp-tension",
    title: "Tensión en el bootcamp",
    description:
      "Tercera semana encerrados. El AWPer no habla con el entry desde el lunes, las scrims son un desastre y el Major arranca en 10 días.",
    category: "lockerRoom",
    scene: "bootcamp",
    options: [
      {
        id: "mediate",
        label: "Sentarlos y mediar vos",
        description: "Hacerte cargo del clima aunque no sea tu rol.",
        effects: { chemistry: 5, gameSense: 2, fame: 1 },
        outcomeText:
          "Lo arreglás en una cena. Las scrims vuelven y el equipo te empieza a ver como líder.",
      },
      {
        id: "call-psych",
        label: "Pedir al psicólogo deportivo",
        description: "Que lo resuelva alguien que sabe.",
        effects: { chemistry: 3, tilt: -2 },
        outcomeText:
          "Dos sesiones y el grupo se ordena. La organización toma nota de tu madurez.",
      },
      {
        id: "focus-own-game",
        label: "Encerrarte en tu propio juego",
        description: "Que se arreglen entre ellos.",
        effects: { aim: 3, chemistry: -3 },
        outcomeText:
          "Tu rating sube, el del equipo baja. Salen en fase de grupos con vos como MVP inútil.",
      },
    ],
  },
  {
    id: "locker-salary-gap",
    title: "Se filtró la planilla",
    description:
      "Un periodista publica los sueldos del roster. Descubrís que el quinto jugador, con peor rating que vos, cobra un 40% más porque llegó con contrato viejo.",
    category: "lockerRoom",
    scene: "lockerRoom",
    options: [
      {
        id: "renegotiate",
        label: "Pedir renegociación con datos",
        description: "Llevar tus números a la reunión.",
        effects: { salaryMonthly: 2_500, chemistry: -1, gameSense: 1 },
        outcomeText:
          "El manager acepta subirte. Te llevás el aumento y algo de resentimiento ajeno.",
      },
      {
        id: "let-it-go",
        label: "Dejarlo pasar",
        description: "El contrato se renueva igual en seis meses.",
        effects: { chemistry: 3, tilt: 1 },
        outcomeText:
          "No decís nada. El grupo se mantiene sano y el aumento llega igual, más tarde.",
      },
      {
        id: "leak-more",
        label: "Hablar con el periodista",
        description: "Contar tu lado off the record.",
        risk: true,
        effects: { fame: 6, chemistry: -7, benchRisk: 10 },
        outcomeText:
          "Sale una nota enorme sobre vos. La org averigua quién habló.",
      },
    ],
  },
];

const CAREER_EVENTS: GameEvent[] = [
  {
    id: "career-first-lan",
    title: "Tu primera LAN",
    description:
      "Cabina, monitor de 360Hz y 4000 personas gritando del otro lado del vidrio. Las manos te tiemblan durante el warmup.",
    category: "career",
    scene: "arena",
    maxTier: 2,
    once: true,
    options: [
      {
        id: "embrace",
        label: "Salir a comerte la cancha",
        description: "Usar los nervios como combustible.",
        effects: { fame: 6, form: 2, aim: 2 },
        outcomeText:
          "Terminás el mapa con 1.32 y un clip que da vueltas. Bienvenido al circuito.",
      },
      {
        id: "routine",
        label: "Aferrarte a tu rutina de siempre",
        description: "Misma sens, misma playlist, misma respiración.",
        effects: { gameSense: 3, tilt: -2, form: 1 },
        outcomeText:
          "Jugás como en casa. No brillás, pero no fallás nada. El coach lo valora más que un highlight.",
      },
    ],
  },
  {
    id: "career-valve-graffiti",
    title: "Valve te hace un graffiti",
    description:
      "Tu clutch del Major se convirtió en meme y Valve anunció un graffiti de firma con tu nombre. Cada vez que alguien lo spamea en Mirage, cobrás.",
    category: "career",
    scene: "presser",
    minFame: 55,
    once: true,
    options: [
      {
        id: "accept-graffiti",
        label: "Aceptar y agradecer",
        description: "Tu nombre en el juego para siempre.",
        effects: { fame: 8, earnings: 45_000 },
        outcomeText:
          "El graffiti sale en la próxima operación. Ver tu firma en un muro de Inferno no tiene precio.",
        grantsGraffiti: "gg-crowd",
      },
      {
        id: "negotiate-royalties",
        label: "Negociar el porcentaje",
        description: "Que tu manager pelee la letra chica.",
        effects: { fame: 5, earnings: 90_000, chemistry: -1 },
        outcomeText:
          "Sacás un mejor deal. Menos romántico, mucho más rentable.",
        grantsGraffiti: "gg-crowd",
      },
    ],
  },
  {
    id: "career-major-qualified",
    title: "Clasificaron al Major",
    description:
      "Ganaron la última serie del RMR. Es tu primer Major y el prize pool es de $1.250.000. La organización te ofrece extender contrato antes de viajar.",
    category: "career",
    scene: "arena",
    minFame: 30,
    options: [
      {
        id: "sign-before",
        label: "Firmar ahora, con seguridad",
        description: "Plata garantizada aunque el Major salga mal.",
        effects: { salaryMonthly: 1_800, chemistry: 2, transferBoost: -6 },
        outcomeText:
          "Firmás tranquilo. Jugás sin presión y la org te lo agradece.",
      },
      {
        id: "wait-major",
        label: "Esperar al Major para negociar",
        description: "Apostar a que vas a rendir en el escenario grande.",
        risk: true,
        effects: { transferBoost: 14, tilt: 1 },
        outcomeText:
          "Te la jugás. Si rendís, tu valor se dispara; si no, perdiste la oferta segura.",
      },
    ],
  },
  {
    id: "career-case-drop",
    title: "Sponsor te regala cajas",
    description:
      "Un sitio de skins te firma como embajador y te manda un lote de cajas para abrir en stream. La comunidad va a estar mirando.",
    category: "career",
    scene: "case",
    minFame: 20,
    options: [
      {
        id: "open-live",
        label: "Abrir una caja en vivo",
        description: "La ruleta, el sonido y todo el chat conteniendo la respiración.",
        effects: { fame: 3 },
        grantsCase: true,
        outcomeText: "",
      },
      {
        id: "sell-unopened",
        label: "Venderlas cerradas",
        description: "Plata segura, cero adrenalina.",
        effects: { earnings: 3_500, fame: -1 },
        outcomeText:
          "Las vendés al mercado. Aburrido pero rentable, como todo buen inversor.",
      },
    ],
  },
  {
    id: "career-top20",
    title: "Ranking HLTV Top 20",
    description:
      "Diciembre. HLTV publica su Top 20 del año y tu nombre aparece. El equipo lo festeja, tu rival lo ve y aprieta los dientes.",
    category: "career",
    scene: "presser",
    minFame: 65,
    once: true,
    options: [
      {
        id: "humble",
        label: "Dedicárselo al equipo",
        description: "El clásico movimiento de vestuario.",
        effects: { chemistry: 4, fame: 4 },
        outcomeText:
          "El equipo se rompe por vos el resto del año. Ganaste algo más valioso que el puesto.",
        grantsGraffiti: "gg-top20",
      },
      {
        id: "call-out",
        label: "Decir que merecías estar más arriba",
        description: "Encender el debate en Twitter.",
        risk: true,
        effects: { fame: 9, chemistry: -3, transferBoost: 8 },
        outcomeText:
          "Se arma un debate de tres días. Tu nombre en todos lados, tu vestuario incómodo.",
        grantsGraffiti: "gg-top20",
      },
    ],
  },
];

const PERSONAL_EVENTS: GameEvent[] = [
  {
    id: "personal-wrist",
    title: "Te duele la muñeca",
    description:
      "Doce horas diarias entre scrims, FACEIT y aim trainers. El fisio te dice que si seguís así, en dos años no jugás más.",
    category: "personal",
    scene: "bootcamp",
    options: [
      {
        id: "rest",
        label: "Parar dos semanas",
        description: "Perdés un torneo, ganás una carrera.",
        effects: { reflexes: -1, gameSense: 3, tilt: -3, form: -1 },
        outcomeText:
          "Volvés fresco. Perdiste ritmo de aim pero tu cabeza está diez veces mejor.",
      },
      {
        id: "play-through",
        label: "Jugar con antiinflamatorios",
        description: "El Major es en tres semanas.",
        risk: true,
        effects: { aim: -3, reflexes: -3, fame: 3, tilt: 2 },
        outcomeText:
          "Jugás el Major a medias. Épico para la prensa, caro para tu cuerpo.",
      },
      {
        id: "change-setup",
        label: "Cambiar setup y bajar sensibilidad",
        description: "Ergonomía y técnica en lugar de fuerza bruta.",
        effects: { aim: 1, movement: 2, tilt: -1 },
        outcomeText:
          "Nuevo mousepad, nueva postura, nueva sens. Tardás un mes en adaptarte y después volás.",
      },
    ],
  },
  {
    id: "personal-stream-offer",
    title: "Oferta de streaming",
    description:
      "Una plataforma te ofrece un contrato de streaming por cuatro horas diarias. Es plata real, pero son cuatro horas menos de scrim.",
    category: "personal",
    scene: "stream",
    minFame: 25,
    options: [
      {
        id: "sign-stream",
        label: "Firmar el contrato",
        description: "Diversificar ingresos mientras podés.",
        effects: { earnings: 60_000, fame: 8, aim: -2, form: -1 },
        outcomeText:
          "Tu audiencia explota y tu cuenta bancaria también. El coach te mira de reojo.",
      },
      {
        id: "part-time",
        label: "Streamear solo en offseason",
        description: "El equilibrio aburrido pero correcto.",
        effects: { earnings: 18_000, fame: 4 },
        outcomeText:
          "Ganás algo, mantenés el nivel. Nadie se queja.",
      },
      {
        id: "reject",
        label: "Rechazar y enfocarte en competir",
        description: "Todo al CS.",
        effects: { aim: 3, gameSense: 2, form: 2, fame: -2 },
        outcomeText:
          "Tu rating sube medio punto en tres meses. La plata puede esperar.",
      },
    ],
  },
  {
    id: "personal-visa",
    title: "Problema de visa",
    description:
      "El torneo es en Estados Unidos y tu visa está trabada. El equipo puede jugar con stand-in o esperar y arriesgarse a llegar sin práctica.",
    category: "personal",
    scene: "presser",
    options: [
      {
        id: "standin",
        label: "Que jueguen con stand-in",
        description: "El equipo primero, aunque te duela.",
        effects: { chemistry: 4, fame: -3, form: -1 },
        outcomeText:
          "Van con stand-in y salen top 8. Vos mirás desde casa, pero el vestuario te respeta.",
      },
      {
        id: "fight-visa",
        label: "Mover cielo y tierra por la visa",
        description: "Abogados, cartas de la org, todo.",
        effects: { earnings: -8_000, fame: 2, tilt: 2 },
        outcomeText:
          "Llegás dos días tarde y sin dormir. Jugás y rendís, pero pagaste el precio.",
      },
    ],
  },
  {
    id: "personal-burnout",
    title: "No querés abrir el juego",
    description:
      "Cuarto año seguido sin offseason real. Abrís CS2, mirás el menú y lo cerrás. Tres veces seguidas.",
    category: "personal",
    scene: "bootcamp",
    minAge: 23,
    options: [
      {
        id: "break",
        label: "Pedir un mes de licencia",
        description: "Aceptar que estás quemado.",
        effects: { tilt: -5, form: -2, gameSense: 2, fame: -2 },
        outcomeText:
          "Volvés con ganas por primera vez en dos años. El equipo te esperó.",
      },
      {
        id: "push",
        label: "Empujar hasta el próximo Major",
        description: "Después ves.",
        risk: true,
        effects: { tilt: 4, form: -2, aim: -2 },
        outcomeText:
          "Llegás vacío al Major. Tus números lo muestran y el coach también lo ve.",
      },
      {
        id: "therapy",
        label: "Empezar terapia deportiva",
        description: "Trabajar la cabeza como trabajás el aim.",
        effects: { tilt: -4, gameSense: 3, clutch: 2 },
        outcomeText:
          "Seis sesiones después clutcheás distinto. La cabeza también se entrena.",
      },
    ],
  },
];

const META_EVENTS: GameEvent[] = [
  {
    id: "meta-map-pool",
    title: "Valve cambia el map pool",
    description:
      "Sale Overpass, entra Cache. Tu mejor mapa era Overpass y el equipo tiene tres semanas para armar un book nuevo desde cero.",
    category: "meta",
    mapId: "cache",
    scene: "map",
    options: [
      {
        id: "lead-prep",
        label: "Liderar la preparación del mapa",
        description: "Ver 40 demos y armar el book vos mismo.",
        effects: { gameSense: 4, utility: 3, chemistry: 2, tilt: 1 },
        outcomeText:
          "Tu book es el mejor del tier. Ganan cinco Caches seguidas y el coach te da crédito público.",
      },
      {
        id: "ban-it",
        label: "Proponer banearlo siempre",
        description: "Evitarlo hasta que no quede otra.",
        effects: { gameSense: 1, form: 1 },
        outcomeText:
          "Lo esquivan tres meses. Después les toca en un elimination match y se nota.",
      },
      {
        id: "copy-pros",
        label: "Copiar el book de Vitality",
        description: "Ver sus demos y replicar todo.",
        effects: { utility: 4, gameSense: 1 },
        outcomeText:
          "Copian las ejecuciones tal cual. Funciona hasta que alguien las estudia.",
      },
    ],
  },
  {
    id: "meta-patch-nerf",
    title: "Patch de Valve",
    description:
      "Nuevo update: cambian el spray pattern del M4A1-S y el precio de la Deagle. Todo tu músculo de memoria queda a medio calibrar.",
    category: "meta",
    scene: "stream",
    options: [
      {
        id: "adapt-fast",
        label: "Encerrarte a recalibrar el spray",
        description: "Mil balas en el mapa de recoil.",
        effects: {},
        minigame: "spray",
        successEffects: { aim: 4, form: 2 },
        failEffects: { aim: -1, tilt: 1 },
        successText:
          "Dominás el patrón nuevo en cuatro días. Sos el primero del tier en hacerlo.",
        failText:
          "No termina de salirte. Dos semanas de rating bajo hasta que se acomoda solo.",
        outcomeText: "",
      },
      {
        id: "switch-m4a4",
        label: "Cambiar a M4A4",
        description: "Más balas, otro patrón, otra escuela.",
        effects: { aim: 1, gameSense: 2 },
        outcomeText:
          "El cambio te sienta bien. Más spam, más control de sites grandes.",
      },
    ],
  },
  {
    id: "meta-cheating-accusation",
    title: "Te acusan de cheater",
    description:
      "Un clip tuyo de un pre-fire en Inferno tiene 2 millones de views con el título 'wallhack?'. El subreddit está en llamas.",
    category: "meta",
    scene: "stream",
    minFame: 40,
    options: [
      {
        id: "explain-demo",
        label: "Publicar la demo con tu POV y audio",
        description: "Mostrar el call del IGL que justifica el pre-fire.",
        effects: { fame: 7, gameSense: 2, chemistry: 2 },
        outcomeText:
          "El audio muestra el call exacto. El video de defensa tiene más views que la acusación.",
      },
      {
        id: "ignore-drama",
        label: "Ignorarlo completamente",
        description: "El circo se apaga solo.",
        effects: { tilt: 2, fame: 1 },
        outcomeText:
          "Se apaga en cinco días, pero el clip vuelve cada vez que tenés un mal torneo.",
      },
      {
        id: "lawyer-up",
        label: "Amenazar con acciones legales",
        description: "Que lo maneje la org.",
        risk: true,
        effects: { fame: 4, earnings: -5_000, chemistry: -1 },
        outcomeText:
          "El Streisand effect en su máxima expresión. Ahora lo conoce todo el mundo.",
      },
    ],
  },
];

const TRANSFER_EVENTS: GameEvent[] = [
  {
    id: "transfer-agent-call",
    title: "Llamada del agente",
    description:
      "Tu manager te avisa que hay interés real de arriba. Quiere saber cómo querés jugar el mercado antes de sentarse a negociar.",
    category: "transfer",
    scene: "market",
    options: [
      {
        id: "aggressive",
        label: "Jugarla agresivo: pedir el techo",
        description: "Máximo salario, máximo riesgo de quedarte sin nada.",
        risk: true,
        effects: { transferBoost: 16, chemistry: -2 },
        outcomeText:
          "Se corre la voz de que sos caro. Menos ofertas, pero las que llegan son grandes.",
      },
      {
        id: "loyal",
        label: "Priorizar el proyecto por sobre la plata",
        description: "Buscar el equipo correcto, no el cheque más grande.",
        effects: { chemistry: 3, gameSense: 2, transferBoost: 4 },
        outcomeText:
          "Tu reputación de jugador fácil de manejar te abre puertas que la plata no abre.",
      },
      {
        id: "quiet",
        label: "Quedarte quieto y rendir",
        description: "Que hablen los números.",
        effects: { form: 2, transferBoost: 8 },
        outcomeText:
          "Dos torneos arriba de 1.15 y el teléfono no para de sonar.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                            templated event pool                             */
/* -------------------------------------------------------------------------- */

const CLUTCH_SITUATIONS = [
  { size: 2, label: "1v2", reward: 3 },
  { size: 3, label: "1v3", reward: 5 },
  { size: 4, label: "1v4", reward: 8 },
];

const SCRIM_TOPICS = [
  {
    topic: "el timing del default",
    fix: "gameSense" as const,
  },
  {
    topic: "las ejecuciones de B",
    fix: "utility" as const,
  },
  {
    topic: "los trades en el site",
    fix: "chemistry" as const,
  },
  {
    topic: "el control de mid",
    fix: "gameSense" as const,
  },
];

function buildMapClutchEvents(): GameEvent[] {
  const events: GameEvent[] = [];
  for (const map of CS_MAPS) {
    for (const situation of CLUTCH_SITUATIONS) {
      for (const site of map.sites) {
        events.push({
          id: `clutch-${map.id}-${situation.label}-${site}`,
          title: `${situation.label} en ${site} de ${map.name}`,
          description: `Round decisivo en ${map.name}. Quedás solo contra ${situation.size} en ${site}, con el reloj corriendo y ${map.callouts[0]} sin controlar.`,
          category: "match",
          mapId: map.id,
          scene: "map",
          options: [
            {
              id: "take-duel",
              label: "Buscar los duelos uno por uno",
              description: "Aislar el 1v1 y confiar en tu aim.",
              effects: {},
              minigame: situation.size >= 3 ? "flick" : "reaction",
              successEffects: {
                clutch: situation.reward,
                fame: situation.reward,
                form: 1,
              },
              failEffects: { tilt: 1, form: -1 },
              successText: `Ganás el ${situation.label} en ${map.name}. El clip se viraliza antes de que termine el mapa.`,
              failText: `Caés en el ${situation.label}. Faltó un duelo para la historia.`,
              outcomeText: "",
              grantsGraffiti: situation.size >= 4 ? "gg-clutch" : undefined,
            },
            {
              id: "play-time",
              label: "Jugar el reloj y el post-plant",
              description: "Que la bomba trabaje por vos.",
              effects: { gameSense: 2, clutch: 1 },
              outcomeText: `Usás el tiempo a favor desde ${map.callouts[1] ?? "el fondo del site"}. El defuse nunca llega.`,
            },
            {
              id: "save",
              label: "Salvar el arma",
              description: "Round perdido, economía viva.",
              effects: { gameSense: 1, fame: -1 },
              outcomeText: `Salvás desde ${map.callouts[2] ?? "spawn"}. Nadie aplaude, pero el próximo round compran full.`,
            },
          ],
        });
      }
    }
  }
  return events;
}

function topicEffect(
  key: "gameSense" | "utility" | "chemistry",
  amount: number,
): StatEffects {
  if (key === "utility") return { utility: amount };
  if (key === "chemistry") return { chemistry: amount };
  return { gameSense: amount };
}

function buildScrimEvents(): GameEvent[] {
  const events: GameEvent[] = [];
  for (const map of ACTIVE_DUTY) {
    for (const topic of SCRIM_TOPICS) {
      events.push({
        id: `scrim-${map.id}-${topic.fix}`,
        title: `Bloque de scrims en ${map.name}`,
        description: `Cinco scrims seguidas en ${map.name} y el equipo no se pone de acuerdo con ${topic.topic}. El coach abre la discusión.`,
        category: "team",
        mapId: map.id,
        scene: "map",
        options: [
          {
            id: "propose-system",
            label: "Proponer un sistema propio",
            description: "Poner tu lectura sobre la mesa.",
            effects: { ...topicEffect(topic.fix, 3), gameSense: 1, fame: 1 },
            outcomeText: `Tu propuesta sobre ${topic.topic} se adopta. En dos semanas ${map.name} pasa a ser mapa de pick.`,
          },
          {
            id: "follow-coach",
            label: "Ejecutar lo que pide el coach",
            description: "Disciplina antes que ego.",
            effects: { chemistry: 3, utility: 1 },
            outcomeText: `Ejecutan el plan del coach al pie de la letra. ${map.name} deja de ser un problema.`,
          },
          {
            id: "grind-aim",
            label: "Saltarte la charla y entrenar aim",
            description: "Tus duelos, tu responsabilidad.",
            risk: true,
            effects: { aim: 3, chemistry: -2 },
            outcomeText: `Tus duelos en ${map.callouts[0]} mejoran, pero el equipo sigue perdiendo el mapa igual.`,
          },
        ],
      });
    }
  }
  return events;
}

function buildRivalEvents(): GameEvent[] {
  return PRO_PLAYERS.slice(0, 26).map((pro) => ({
    id: `rival-${pro.nickname.toLowerCase()}`,
    title: `Cruce con ${pro.nickname}`,
    description: `Te toca enfrentar a ${pro.nickname} (${pro.realName}, ${pro.country}). Los casters ya armaron el gráfico comparando sus ratings y la prensa quiere declaraciones.`,
    category: "match" as const,
    scene: "presser" as const,
    options: [
      {
        id: "hype",
        label: "Calentar la previa",
        description: `Decir que le vas a ganar el duelo a ${pro.nickname}.`,
        risk: true,
        effects: { fame: 6, tilt: 1, form: 1 },
        outcomeText: `La previa explota. Le ganás el duelo directo y ${pro.nickname} te da la mano al final.`,
      },
      {
        id: "respect",
        label: "Mostrar respeto y enfocarte",
        description: "Elogiar al rival y hablar del equipo.",
        effects: { chemistry: 2, gameSense: 2, fame: 2 },
        outcomeText: `Declaraciones prolijas y un mapa sólido. ${pro.nickname} te menciona como el que más le costó.`,
      },
      {
        id: "study",
        label: `Estudiar 20 demos de ${pro.nickname}`,
        description: "Aprender sus tendencias antes del cruce.",
        effects: { gameSense: 3, utility: 2 },
        outcomeText: `Le leés tres timings seguidos. La preparación gana partidos que el aim no gana.`,
      },
    ],
  }));
}

function buildOrgEvents(): GameEvent[] {
  return TEAMS.filter((team) => team.tier <= 2).map((team) => ({
    id: `org-interest-${team.id}`,
    title: `${team.name} pregunta por vos`,
    description: `El manager de ${team.name} contactó a tu agente. ${team.blurb} Su presupuesto de roster ronda los $${Math.round(team.budgetMonthly / 1000)}k mensuales.`,
    category: "transfer" as const,
    scene: "market" as const,
    options: [
      {
        id: "listen",
        label: "Escuchar la propuesta",
        description: "Sin compromiso, solo información.",
        effects: { transferBoost: 8, chemistry: -1 },
        outcomeText: `Te sentás con ${team.name}. La charla no cierra nada pero te deja claro tu precio real.`,
      },
      {
        id: "commit-now",
        label: "Decir que sí a la primera",
        description: "Cerrar rápido antes de que cambien de idea.",
        effects: { transferBoost: 4, salaryMonthly: 1_200, fame: 2 },
        outcomeText: `Se corre que estás listo para salir. ${team.name} vuelve con una oferta formal en el mercado.`,
      },
      {
        id: "stay-focused",
        label: "Cortar la charla y competir",
        description: "Nada de ruido en plena temporada.",
        effects: { chemistry: 3, form: 2 },
        outcomeText: `Le pedís a tu agente que espere al offseason. El vestuario nota que no te distraés.`,
      },
    ],
  }));
}

function buildBenchEvents(): GameEvent[] {
  return TEAMS.filter((team) => team.tier === 3).map((team) => ({
    id: `bench-offer-${team.id}`,
    title: `${team.shortName} te ofrece minutos`,
    description: `Estás sin jugar. ${team.name} te ofrece un puesto titular inmediato para recuperar ritmo, con sueldo bajo pero cámara encendida todos los fines de semana.`,
    category: "transfer" as const,
    scene: "market" as const,
    requiresBenched: true,
    options: [
      {
        id: "take-minutes",
        label: "Aceptar y volver a jugar",
        description: "Rating por encima de cheque.",
        effects: { form: 3, aim: 2, fame: 2, transferBoost: 10, salaryMonthly: -1_500 },
        outcomeText: `Volvés a competir con ${team.name}. Tres meses después tu rating vuelve a hablar por vos.`,
      },
      {
        id: "hold-out",
        label: "Aguantar el contrato en el banco",
        description: "Cobrar y esperar algo mejor.",
        risk: true,
        effects: { form: -2, transferBoost: -6, earnings: 12_000 },
        outcomeText: `Cobrás sin jugar. La plata entra, el ritmo se va y el mercado se enfría.`,
      },
    ],
  }));
}

const TEMPLATED_EVENTS: GameEvent[] = [
  ...buildMapClutchEvents(),
  ...buildScrimEvents(),
  ...buildRivalEvents(),
  ...buildOrgEvents(),
  ...buildBenchEvents(),
];

export const ALL_EVENTS: GameEvent[] = [
  ...MATCH_EVENTS,
  ...LOCKER_ROOM_EVENTS,
  ...CAREER_EVENTS,
  ...PERSONAL_EVENTS,
  ...META_EVENTS,
  ...TRANSFER_EVENTS,
  ...TEMPLATED_EVENTS,
];

/* -------------------------------------------------------------------------- */
/*                                event picking                                */
/* -------------------------------------------------------------------------- */

function matchesPlayer(event: GameEvent, player: PlayerState): boolean {
  if (player.usedEventIds.includes(event.id)) return false;
  if (event.requiresBenched && !player.benched) return false;
  if (!event.requiresBenched && player.benched && event.category === "match") {
    return false;
  }
  if (event.minTier !== undefined && player.team.tier > event.minTier) return false;
  if (event.maxTier !== undefined && player.team.tier < event.maxTier) return false;
  if (event.minAge !== undefined && player.age < event.minAge) return false;
  if (event.maxAge !== undefined && player.age > event.maxAge) return false;
  if (event.minFame !== undefined && player.fame < event.minFame) return false;
  if (event.maxFame !== undefined && player.fame > event.maxFame) return false;
  if (event.roles && !event.roles.includes(player.role)) return false;
  if (event.regions && !event.regions.includes(player.region)) return false;
  return true;
}

/** Weighted so the player always gets a mix of match, team and life events. */
export function pickEvent(player: PlayerState): GameEvent {
  const eligible = ALL_EVENTS.filter((event) => matchesPlayer(event, player));

  if (eligible.length === 0) {
    return ALL_EVENTS[Math.floor(Math.random() * ALL_EVENTS.length)];
  }

  const handWritten = eligible.filter(
    (event) => !event.id.startsWith("clutch-") && !event.id.startsWith("scrim-"),
  );

  // 55% chance of a bespoke event so the narrative stays fresh.
  const pool =
    handWritten.length > 0 && Math.random() < 0.55 ? handWritten : eligible;

  return pool[Math.floor(Math.random() * pool.length)];
}

export const EVENT_COUNT = ALL_EVENTS.length;
