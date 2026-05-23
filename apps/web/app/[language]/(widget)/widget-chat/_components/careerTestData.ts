// careerTestData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Научная основа: Теория профессиональных типов Джона Холланда (RIASEC, 1959)
// Holland, J. L. (1985). Making Vocational Choices: A Theory of Vocational
// Personalities and Work Environments. Prentice-Hall.
//
// RIASEC — 6 типов личности:
//   R – Realistic      (Практический)   — работа руками, техника, природа
//   I – Investigative  (Исследовательский) — анализ, наука, решение задач
//   A – Artistic       (Творческий)     — искусство, выражение, интуиция
//   S – Social         (Социальный)     — помощь, обучение, общение
//   E – Enterprising   (Предпринимательский) — лидерство, продажи, влияние
//   C – Conventional   (Конвенциональный) — порядок, данные, системы
//
// Итог: трёхбуквенный Holland Code (например "ISA") — 3 ведущих типа.
// ─────────────────────────────────────────────────────────────────────────────

type Lang = "ru" | "kk" | "en";

export interface Direction {
    id: string;
    label: Record<Lang, string>;
    description: Record<Lang, string>;
    traits: Record<Lang, string[]>;
    careers: Record<Lang, string[]>;
    emoji: string;
    color: string;
}

export interface TestResult {
    scores: Array<{
        id: string;
        label: Record<Lang, string>;
        score: number;
        max: number;
        color: string;
        percent: number;
    }>;
    hollandCode: string; // e.g. "IAS"
    topDirection: Direction & { score: number };
    secondDirection: Direction & { score: number };
    thirdDirection: Direction & { score: number };
}

export const DIRECTIONS: Direction[] = [
    {
        id: "R",
        label:       { ru: "Практический",       kk: "Практикалық",       en: "Realistic" },
        description: { ru: "Техника, природа, работа руками", kk: "Техника, табиғат, қолмен жұмыс", en: "Technical, hands-on, nature" },
        traits: {
            ru: ["Люблю работать руками", "Разбираюсь в технике", "Предпочитаю конкретные задачи", "Ценю практический результат"],
            kk: ["Қолмен жұмыс жасауды ұнатамын", "Техниканы түсінемін", "Нақты тапсырмаларды қалаймын"],
            en: ["Hands-on work", "Technical aptitude", "Practical problem solver", "Values tangible results"],
        },
        careers: {
            ru: ["Инженер", "Архитектор", "Агроном", "Механик", "Строитель", "Пилот", "Хирург"],
            kk: ["Инженер", "Сәулетші", "Агроном", "Механик", "Ұшқыш"],
            en: ["Engineer", "Architect", "Agronomist", "Mechanic", "Surgeon", "Pilot"],
        },
        emoji: "🔧",
        color: "#f97316",
    },
    {
        id: "I",
        label:       { ru: "Исследовательский",  kk: "Зерттеушілік",      en: "Investigative" },
        description: { ru: "Наука, анализ, решение сложных задач", kk: "Ғылым, талдау, күрделі мәселелерді шешу", en: "Science, analysis, complex problems" },
        traits: {
            ru: ["Люблю анализировать", "Интересует наука", "Мыслю логически", "Ищу причины явлений"],
            kk: ["Талдауды ұнатамын", "Ғылым қызықтырады", "Логикалық ойлаймын"],
            en: ["Analytical thinking", "Scientific curiosity", "Logical reasoning", "Seeks to understand"],
        },
        careers: {
            ru: ["Учёный", "Программист", "Врач", "Аналитик данных", "Математик", "Биолог", "Психолог-исследователь"],
            kk: ["Ғалым", "Бағдарламашы", "Дәрігер", "Математик", "Биолог"],
            en: ["Scientist", "Programmer", "Physician", "Data Analyst", "Mathematician", "Biologist"],
        },
        emoji: "🔬",
        color: "#6366f1",
    },
    {
        id: "A",
        label:       { ru: "Творческий",         kk: "Шығармашылық",      en: "Artistic" },
        description: { ru: "Искусство, дизайн, самовыражение", kk: "Өнер, дизайн, өзін-өзі білдіру", en: "Art, design, self-expression" },
        traits: {
            ru: ["Мыслю образно", "Ценю красоту", "Люблю создавать", "Не терплю жёстких правил"],
            kk: ["Бейнелі ойлаймын", "Сұлулықты бағалаймын", "Жасауды ұнатамын"],
            en: ["Creative thinking", "Values aesthetics", "Original expression", "Dislikes rigid rules"],
        },
        careers: {
            ru: ["Дизайнер", "Архитектор", "Режиссёр", "Музыкант", "Писатель", "UX/UI дизайнер", "Маркетолог"],
            kk: ["Дизайнер", "Режиссер", "Музыкант", "Жазушы", "UX дизайнері"],
            en: ["Designer", "Director", "Musician", "Writer", "UX/UI Designer", "Marketing Creative"],
        },
        emoji: "🎨",
        color: "#ec4899",
    },
    {
        id: "S",
        label:       { ru: "Социальный",         kk: "Әлеуметтік",        en: "Social" },
        description: { ru: "Помощь людям, обучение, взаимодействие", kk: "Адамдарға көмек, оқыту, өзара әрекет", en: "Helping, teaching, connecting" },
        traits: {
            ru: ["Легко нахожу общий язык", "Хочу помогать людям", "Терпелив и эмпатичен", "Умею слушать"],
            kk: ["Тіл табысуды оңай табамын", "Адамдарға көмектескім келеді", "Шыдамды және эмпатиялымын"],
            en: ["Empathetic", "Communicative", "Wants to help others", "Good listener"],
        },
        careers: {
            ru: ["Врач", "Психолог", "Педагог", "Социальный работник", "HR-специалист", "Юрист", "Логопед"],
            kk: ["Дәрігер", "Психолог", "Педагог", "Әлеуметтік қызметкер", "Заңгер"],
            en: ["Physician", "Psychologist", "Teacher", "Social Worker", "HR Specialist", "Lawyer"],
        },
        emoji: "🤝",
        color: "#10b981",
    },
    {
        id: "E",
        label:       { ru: "Предпринимательский", kk: "Кәсіпкерлік",      en: "Enterprising" },
        description: { ru: "Лидерство, бизнес, влияние и убеждение", kk: "Көшбасшылық, бизнес, ықпал ету", en: "Leadership, business, persuasion" },
        traits: {
            ru: ["Люблю брать инициативу", "Умею убеждать", "Стремлюсь к лидерству", "Мыслю стратегически"],
            kk: ["Бастама алуды ұнатамын", "Сендіре аламын", "Көшбасшылыққа ұмтыламын"],
            en: ["Takes initiative", "Persuasive", "Seeks leadership", "Strategic thinking"],
        },
        careers: {
            ru: ["Менеджер", "Предприниматель", "Юрист", "Политик", "Маркетолог", "Продюсер", "Финансист"],
            kk: ["Менеджер", "Кәсіпкер", "Заңгер", "Маркетолог", "Продюсер"],
            en: ["Manager", "Entrepreneur", "Lawyer", "Politician", "Marketer", "Producer"],
        },
        emoji: "📈",
        color: "#f59e0b",
    },
    {
        id: "C",
        label:       { ru: "Конвенциональный",   kk: "Конвенционалды",    en: "Conventional" },
        description: { ru: "Порядок, системность, работа с данными", kk: "Тәртіп, жүйелілік, деректермен жұмыс", en: "Order, systems, data management" },
        traits: {
            ru: ["Люблю порядок и системность", "Внимателен к деталям", "Надёжен и точен", "Хорошо работаю по инструкции"],
            kk: ["Тәртіп пен жүйелілікті ұнатамын", "Бөлшектерге назар аударамын"],
            en: ["Organized", "Detail-oriented", "Reliable and precise", "Follows procedures well"],
        },
        careers: {
            ru: ["Бухгалтер", "Аудитор", "Финансовый аналитик", "Юрист", "Администратор", "Логист", "Актуарий"],
            kk: ["Бухгалтер", "Аудитор", "Қаржылық талдаушы", "Заңгер", "Логист"],
            en: ["Accountant", "Auditor", "Financial Analyst", "Lawyer", "Administrator", "Actuary"],
        },
        emoji: "📋",
        color: "#06b6d4",
    },
];

interface QuestionOption {
    text: Record<Lang, string>;
    scores: Record<string, number>;
}

export interface CareerQuestion {
    id: string;
    text: Record<Lang, string>;
    options: QuestionOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 36 вопросов по методу Холланда (Self-Directed Search, SDS).
// Каждый из 6 типов охватывается равномерно (по 6 вопросов-якорей).
// Вопросы сгруппированы по блокам: деятельность, способности, интересы,
// ценности, рабочая среда, жизненные ситуации.
// ─────────────────────────────────────────────────────────────────────────────

export const CAREER_QUESTIONS: CareerQuestion[] = [

    // ── БЛОК 1: ЧТО ТЫ ЛЮБИШЬ ДЕЛАТЬ ──────────────────────────────────────

    {
        id: "q01",
        text: {
            ru: "В свободное время тебе больше всего нравится...",
            kk: "Бос уақытыңда саған ең ұнайтын...",
            en: "In your free time, you most enjoy...",
        },
        options: [
            { text: { ru: "Чинить, собирать или разбирать технику, механизмы", kk: "Техника мен механизмдерді жөндеу, жинау, бөлшектеу", en: "Fixing, building, or taking apart machines and devices" }, scores: { R: 3 } },
            { text: { ru: "Читать, решать головоломки или изучать что-то новое", kk: "Оқу, жұмбақ шешу немесе жаңа нәрсе үйрену", en: "Reading, solving puzzles, or learning something new" }, scores: { I: 3 } },
            { text: { ru: "Рисовать, писать, играть на музыкальных инструментах", kk: "Сурет салу, жазу, аспапта ойнау", en: "Drawing, writing, or playing a musical instrument" }, scores: { A: 3 } },
            { text: { ru: "Проводить время с друзьями, помогать им или организовывать что-то вместе", kk: "Достармен уақыт өткізу, оларға көмектесу немесе бірге ұйымдастыру", en: "Spending time with friends, helping them, or organizing group activities" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q02",
        text: {
            ru: "Что тебе даётся легче и приносит удовольствие?",
            kk: "Саған не оңайырақ беріледі және рахат әкеледі?",
            en: "What comes naturally to you and brings you satisfaction?",
        },
        options: [
            { text: { ru: "Убеждать людей, вести переговоры, продавать идеи", kk: "Адамдарды сендіру, келіссөздер жүргізу, идеяларды \"сату\"", en: "Persuading people, negotiating, selling ideas" }, scores: { E: 3 } },
            { text: { ru: "Вести таблицы, составлять планы, систематизировать информацию", kk: "Кестелер жүргізу, жоспар жасау, ақпаратты жүйелеу", en: "Managing spreadsheets, making plans, organizing information" }, scores: { C: 3 } },
            { text: { ru: "Мастерить, строить, работать с инструментами", kk: "Қолөнермен айналысу, құру, аспаптармен жұмыс", en: "Crafting, building, working with tools" }, scores: { R: 3 } },
            { text: { ru: "Проводить опыты, задавать вопросы и искать ответы", kk: "Тәжірибелер жүргізу, сұрақтар қою және жауап іздеу", en: "Running experiments, asking questions and finding answers" }, scores: { I: 3 } },
        ],
    },
    {
        id: "q03",
        text: {
            ru: "Если бы можно было провести идеальный день, ты бы...",
            kk: "Мінсіз күн өткізу мүмкіндігі болса, сен...",
            en: "If you could spend a perfect day, you would...",
        },
        options: [
            { text: { ru: "Работал бы над собственным творческим проектом — фильмом, книгой, дизайном", kk: "Өз шығармашылық жобаңда жұмыс істер едің — фильм, кітап, дизайн", en: "Work on a personal creative project — film, book, or design" }, scores: { A: 3 } },
            { text: { ru: "Организовал бы мероприятие или помогал кому-то решить проблему", kk: "Іс-шара ұйымдастырар немесе біреуге мәселесін шешуге көмектесер едің", en: "Organize an event or help someone solve a meaningful problem" }, scores: { S: 2, E: 1 } },
            { text: { ru: "Запустил бы собственный проект или придумал бизнес-идею", kk: "Өз жобаңды іске қосар немесе бизнес идея ойластырар едің", en: "Launch a personal project or brainstorm a business idea" }, scores: { E: 3 } },
            { text: { ru: "Разобрался бы в сложной теме, читал статьи или смотрел лекции", kk: "Күрделі тақырыпты зерттер едің, мақалалар оқып немесе дәрістер тыңдар едің", en: "Deep-dive into a complex topic, reading articles or watching lectures" }, scores: { I: 3 } },
        ],
    },

    // ── БЛОК 2: ШКОЛЬНЫЕ ПРЕДМЕТЫ И СПОСОБНОСТИ ────────────────────────────

    {
        id: "q04",
        text: {
            ru: "Какие предметы в школе давались тебе лучше всего?",
            kk: "Мектепте қандай пәндер саған жақсырақ берілді?",
            en: "Which school subjects came most naturally to you?",
        },
        options: [
            { text: { ru: "Физика, труд, технология — всё, где нужно что-то делать руками", kk: "Физика, еңбек, технология — қолмен бірдеңе жасау керек болса", en: "Physics, shop class, technology — anything hands-on" }, scores: { R: 3, I: 1 } },
            { text: { ru: "Математика, биология, химия, информатика", kk: "Математика, биология, химия, информатика", en: "Math, biology, chemistry, computer science" }, scores: { I: 3 } },
            { text: { ru: "Литература, МХК, история, иностранные языки", kk: "Әдебиет, ДШТ, тарих, шет тілдері", en: "Literature, arts, history, foreign languages" }, scores: { A: 2, S: 1 } },
            { text: { ru: "Обществознание, психология, экономика, право", kk: "Қоғамтану, психология, экономика, құқық", en: "Social studies, psychology, economics, law" }, scores: { S: 1, E: 2, C: 1 } },
        ],
    },
    {
        id: "q05",
        text: {
            ru: "Как бы ты описал свои сильные стороны?",
            kk: "Өзіңнің күшті жақтарыңды қалай сипаттар едің?",
            en: "How would you describe your strongest abilities?",
        },
        options: [
            { text: { ru: "Я хорошо понимаю, как работают механизмы и системы", kk: "Мен механизмдер мен жүйелердің қалай жұмыс істейтінін жақсы түсінемін", en: "I understand well how mechanisms and systems work" }, scores: { R: 3 } },
            { text: { ru: "У меня острый аналитический ум и логическое мышление", kk: "Менде өткір аналитикалық ақыл және логикалық ойлау бар", en: "I have strong analytical and logical thinking skills" }, scores: { I: 3 } },
            { text: { ru: "Я хорошо чувствую эмоции и потребности других людей", kk: "Мен басқа адамдардың эмоциялары мен қажеттіліктерін жақсы сеземін", en: "I have strong empathy and sense people's emotions and needs" }, scores: { S: 3 } },
            { text: { ru: "Я умею организовывать, планировать и держать всё под контролем", kk: "Мен ұйымдастыра, жоспарлай және бәрін бақылауда ұстай аламын", en: "I'm skilled at organizing, planning and keeping things under control" }, scores: { C: 2, E: 1 } },
        ],
    },
    {
        id: "q06",
        text: {
            ru: "Что ты обычно делаешь лучше других в групповой работе?",
            kk: "Топтық жұмыста сен әдетте басқалардан не жақсырақ жасайсың?",
            en: "What do you usually do better than others in group work?",
        },
        options: [
            { text: { ru: "Реализую задуманное — делаю, строю, воплощаю", kk: "Жоспарланғанды жүзеге асырамын — жасаймын, саламын, іске асырамын", en: "Execute the plan — build, make, implement" }, scores: { R: 3 } },
            { text: { ru: "Генерирую нестандартные идеи и нахожу творческие решения", kk: "Стандартты емес идеялар ұсынамын және шығармашылық шешімдер табамын", en: "Generate original ideas and find creative solutions" }, scores: { A: 3 } },
            { text: { ru: "Веду команду, мотивирую и распределяю роли", kk: "Командаға басшылық жасаймын, ынталандырамын және рөлдерді бөлемін", en: "Lead the team, motivate and assign roles" }, scores: { E: 3 } },
            { text: { ru: "Веду документацию, слежу за дедлайнами и деталями", kk: "Құжаттаманы жүргіземін, дедлайндар мен бөлшектерді қадағалаймын", en: "Handle documentation, track deadlines and details" }, scores: { C: 3 } },
        ],
    },

    // ── БЛОК 3: РАБОЧАЯ СРЕДА И УСЛОВИЯ ───────────────────────────────────

    {
        id: "q07",
        text: {
            ru: "Какая рабочая среда тебе ближе всего?",
            kk: "Қандай жұмыс ортасы саған жақынырақ?",
            en: "Which work environment suits you best?",
        },
        options: [
            { text: { ru: "На природе, в поле, на строительстве или в мастерской", kk: "Табиғатта, далада, құрылыста немесе шеберханада", en: "Outdoors, in the field, at a construction site or workshop" }, scores: { R: 3 } },
            { text: { ru: "В лаборатории, библиотеке или тихом офисе за исследованиями", kk: "Зертханада, кітапханада немесе тыныш кеңседе зерттеу жүргізу", en: "In a lab, library, or quiet office doing research" }, scores: { I: 3 } },
            { text: { ru: "В творческом пространстве — студии, агентстве, редакции", kk: "Шығармашылық кеңістікте — студияда, агенттікте, редакцияда", en: "In a creative space — studio, agency, editorial office" }, scores: { A: 3 } },
            { text: { ru: "Там, где я постоянно общаюсь с людьми — школа, больница, офис", kk: "Адамдармен үнемі қарым-қатынасым бар жерде — мектеп, аурухана, кеңсе", en: "Where I'm constantly with people — school, hospital, office" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q08",
        text: {
            ru: "Какой рабочий стиль тебе подходит больше?",
            kk: "Қандай жұмыс стилі саған көбірек сәйкес келеді?",
            en: "Which work style fits you best?",
        },
        options: [
            { text: { ru: "Динамичная работа, переговоры, активное взаимодействие", kk: "Динамикалық жұмыс, келіссөздер, белсенді өзара әрекет", en: "Dynamic work, negotiations, active interaction" }, scores: { E: 3 } },
            { text: { ru: "Чёткая структура, инструкции, предсказуемость", kk: "Нақты құрылым, нұсқаулар, болжамдылық", en: "Clear structure, instructions, predictability" }, scores: { C: 3 } },
            { text: { ru: "Самостоятельность и возможность работать в своём темпе", kk: "Дербестік және өз қарқынымда жұмыс жасау мүмкіндігі", en: "Autonomy and the ability to work at my own pace" }, scores: { I: 2, A: 1 } },
            { text: { ru: "Командная работа, где важен вклад каждого", kk: "Командалық жұмыс, онда әркімнің үлесі маңызды", en: "Team work where everyone's contribution matters" }, scores: { S: 2, E: 1 } },
        ],
    },
    {
        id: "q09",
        text: {
            ru: "Что для тебя важнее всего в будущей работе?",
            kk: "Болашақ жұмыста сен үшін ең маңыздысы не?",
            en: "What matters most to you in future work?",
        },
        options: [
            { text: { ru: "Видеть физический результат своего труда — построил, создал, отремонтировал", kk: "Еңбегімнің физикалық нәтижесін көру — салдым, жасадым, жөндедім", en: "See the physical result of my work — built, created, repaired" }, scores: { R: 3 } },
            { text: { ru: "Постоянно узнавать новое и решать нестандартные задачи", kk: "Үнемі жаңа нәрсе білу және стандартты емес тапсырмаларды шешу", en: "Keep learning and solving non-standard challenges" }, scores: { I: 3 } },
            { text: { ru: "Иметь творческую свободу и оставлять след в культуре", kk: "Шығармашылық еркіндік болу және мәдениетте із қалдыру", en: "Have creative freedom and leave a mark in culture" }, scores: { A: 3 } },
            { text: { ru: "Реально помогать людям и видеть их прогресс", kk: "Адамдарға шынымен көмектесу және олардың ілгерілеуін көру", en: "Genuinely help people and see their progress" }, scores: { S: 3 } },
        ],
    },

    // ── БЛОК 4: ЖИЗНЕННЫЕ СИТУАЦИИ ─────────────────────────────────────────

    {
        id: "q10",
        text: {
            ru: "Ты приехал на новое место с друзьями. Твои действия?",
            kk: "Сен достарыңмен жаңа жерге келдің. Сенің әрекеттерің?",
            en: "You've arrived somewhere new with friends. What do you do?",
        },
        options: [
            { text: { ru: "Предлагаю активный отдых — поход, велосипед, экскурсия по природным местам", kk: "Белсенді демалыс ұсынамын — серуен, велосипед, табиғи жерлерге саяхат", en: "Suggest active activities — hiking, cycling, nature exploration" }, scores: { R: 3 } },
            { text: { ru: "Исследую местную историю, музеи или уникальные места", kk: "Жергілікті тарихты, мұражайларды немесе бірегей жерлерді зерттеймін", en: "Explore local history, museums, or unique spots" }, scores: { I: 2, A: 1 } },
            { text: { ru: "Беру инициативу — составляю план, бронирую, координирую", kk: "Бастама аламын — жоспар жасаймын, брондаймын, үйлестіремін", en: "Take charge — make a plan, book things, coordinate" }, scores: { E: 3 } },
            { text: { ru: "Следую за большинством и забочусь, чтобы всем было комфортно", kk: "Көпшілікке ілесемін және барлығына жайлы болуын қадағалаймын", en: "Follow the group and make sure everyone is comfortable" }, scores: { S: 2, C: 1 } },
        ],
    },
    {
        id: "q11",
        text: {
            ru: "В школьном проекте тебе поручили выбрать роль. Ты берёшь...",
            kk: "Мектеп жобасында саған рөл таңдау тапсырылды. Сен аласың...",
            en: "In a school project, you're asked to choose a role. You pick...",
        },
        options: [
            { text: { ru: "Макетчик или технический исполнитель — создаю реальный объект", kk: "Макет жасаушы немесе техникалық орындаушы — нақты объект жасаймын", en: "Model builder or technical maker — I create the physical object" }, scores: { R: 3 } },
            { text: { ru: "Аналитик или исследователь — собираю факты и пишу выводы", kk: "Аналитик немесе зерттеуші — фактілер жинап, қорытынды жазамын", en: "Analyst or researcher — gather facts and write conclusions" }, scores: { I: 3 } },
            { text: { ru: "Дизайнер или визуализатор — делаю презентацию красивой", kk: "Дизайнер немесе визуализатор — презентацияны әдемі жасаймын", en: "Designer or visualizer — make the presentation beautiful" }, scores: { A: 3 } },
            { text: { ru: "Спикер или модератор — представляю проект и отвечаю на вопросы", kk: "Спикер немесе модератор — жобаны таныстырып, сұрақтарға жауап беремін", en: "Speaker or moderator — present the project and answer questions" }, scores: { E: 2, S: 1 } },
        ],
    },
    {
        id: "q12",
        text: {
            ru: "Ты видишь проблему в своём районе/городе. Как ты реагируешь?",
            kk: "Өз аулаңда/қалаңда мәселе байқадың. Қалай әрекет етесің?",
            en: "You notice a problem in your neighborhood or city. What do you do?",
        },
        options: [
            { text: { ru: "Лично берусь за дело — чиню, строю, организую субботник", kk: "Жеке өзім іске кірісемін — жөндеймін, саламын, сенбілік ұйымдастырамын", en: "Take personal action — fix, build, organize a cleanup" }, scores: { R: 3 } },
            { text: { ru: "Изучаю причины проблемы и думаю над системным решением", kk: "Мәселенің себептерін зерттеп, жүйелік шешімді ойластырамын", en: "Study the root causes and think about a systemic solution" }, scores: { I: 3 } },
            { text: { ru: "Создаю контент, плакат или флешмоб, чтобы привлечь внимание", kk: "Назар аудару үшін контент, плакат немесе флешмоб жасаймын", en: "Create content, a poster, or a flash mob to raise awareness" }, scores: { A: 3 } },
            { text: { ru: "Собираю людей, обсуждаю и вместе ищем решение", kk: "Адамдарды жинаймын, талқылаймын және бірге шешім іздейміз", en: "Gather people, discuss and find a solution together" }, scores: { S: 2, E: 1 } },
        ],
    },

    // ── БЛОК 5: ИНТЕРЕСЫ И ЦЕННОСТИ ───────────────────────────────────────

    {
        id: "q13",
        text: {
            ru: "Что тебя вдохновляет больше всего?",
            kk: "Сені ең көп не шабыттандырады?",
            en: "What inspires you the most?",
        },
        options: [
            { text: { ru: "Как работают машины, технологии и инженерные системы", kk: "Машиналар, технологиялар және инженерлік жүйелер қалай жұмыс жасайды", en: "How machines, technologies, and engineering systems work" }, scores: { R: 3 } },
            { text: { ru: "Научные открытия и тайны природы и вселенной", kk: "Ғылыми жаңалықтар және табиғат пен ғаламның сырлары", en: "Scientific discoveries and mysteries of nature and the universe" }, scores: { I: 3 } },
            { text: { ru: "Произведения искусства, музыка, кино, литература", kk: "Өнер туындылары, музыка, кино, әдебиет", en: "Works of art, music, cinema, literature" }, scores: { A: 3 } },
            { text: { ru: "Истории людей, их судьбы и то, как они меняются", kk: "Адамдардың тарихтары, олардың тағдырлары және олардың қалай өзгеретіні", en: "People's stories, their lives and how they transform" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q14",
        text: {
            ru: "Что тебя раздражает или разочаровывает в работе?",
            kk: "Жұмыста сені не ашуландырады немесе көңілін қалдырады?",
            en: "What bothers or frustrates you most about work?",
        },
        options: [
            { text: { ru: "Когда нужно только говорить, а не делать что-то реальное", kk: "Тек сөйлеу керек болса, нақты бірдеңе жасамасаң", en: "When I can only talk and not do something real" }, scores: { R: 3 } },
            { text: { ru: "Когда запрещают задавать вопросы и экспериментировать", kk: "Сұрақ қою мен тәжірибе жасауға тыйым салынса", en: "When questioning and experimenting are discouraged" }, scores: { I: 3 } },
            { text: { ru: "Когда нет места для творчества, всё жёстко по шаблону", kk: "Шығармашылыққа орын болмаса, бәрі қатаң үлгі бойынша болса", en: "When there's no room for creativity, everything is rigidly templated" }, scores: { A: 3 } },
            { text: { ru: "Когда нужно работать в одиночестве без взаимодействия с людьми", kk: "Адамдармен өзара әрекетсіз жалғыз жұмыс жасау керек болса", en: "When I have to work alone with no people interaction" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q15",
        text: {
            ru: "Когда ты чувствуешь, что потратил день с пользой?",
            kk: "Күнді тиімді өткізгенімді қашан сеземін?",
            en: "When do you feel you've spent the day productively?",
        },
        options: [
            { text: { ru: "Что-то построил, починил, собрал или настроил", kk: "Бірдеңе салдым, жөндедім, жинадым немесе реттедім", en: "I built, fixed, assembled, or configured something" }, scores: { R: 3 } },
            { text: { ru: "Разобрался в сложной теме или нашёл решение задачи", kk: "Күрделі тақырыпты түсіндім немесе тапсырмаға шешім таптым", en: "I figured out a complex topic or found a solution to a problem" }, scores: { I: 3 } },
            { text: { ru: "Создал что-то — текст, дизайн, музыку, видео", kk: "Бірдеңе жасадым — мәтін, дизайн, музыка, бейне", en: "I created something — text, design, music, video" }, scores: { A: 3 } },
            { text: { ru: "Помог кому-то или улучшил чью-то ситуацию", kk: "Біреуге көмектестім немесе біреудің жағдайын жақсарттым", en: "I helped someone or improved someone's situation" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q16",
        text: {
            ru: "Что тебе кажется самым важным в жизни?",
            kk: "Өмірде ең маңызды деп санайтыным не?",
            en: "What do you consider most important in life?",
        },
        options: [
            { text: { ru: "Достигать конкретных целей и видеть плоды своего труда", kk: "Нақты мақсаттарға жету және еңбегімнің жемісін көру", en: "Achieve concrete goals and see the fruits of your labor" }, scores: { R: 2, C: 1 } },
            { text: { ru: "Понимать мир глубже и расширять границы знаний", kk: "Әлемді тереңірек түсіну және білім шекараларын кеңейту", en: "Understand the world more deeply and expand knowledge" }, scores: { I: 3 } },
            { text: { ru: "Самовыражение и оставить после себя что-то значимое", kk: "Өзін-өзі көрсету және артымнан маңызды бірдеңе қалдыру", en: "Self-expression and leaving something meaningful behind" }, scores: { A: 3 } },
            { text: { ru: "Финансовая независимость и свобода принимать решения", kk: "Қаржылық тәуелсіздік және шешім қабылдау еркіндігі", en: "Financial independence and freedom to make decisions" }, scores: { E: 3 } },
        ],
    },

    // ── БЛОК 6: СЦЕНАРИИ ВЫБОРА ────────────────────────────────────────────

    {
        id: "q17",
        text: {
            ru: "Тебе предложили летнюю подработку. Что выберешь?",
            kk: "Саған жазғы жұмыс ұсынылды. Нені таңдайсың?",
            en: "You're offered a summer job. Which do you choose?",
        },
        options: [
            { text: { ru: "Помощник на стройке, в мастерской или в саду", kk: "Құрылыста, шеберханада немесе бақта көмекші", en: "Assistant at a construction site, workshop, or garden" }, scores: { R: 3 } },
            { text: { ru: "Стажёр в лаборатории или исследовательском отделе", kk: "Зертханада немесе зерттеу бөлімінде тағылымдамашы", en: "Intern in a laboratory or research department" }, scores: { I: 3 } },
            { text: { ru: "Ассистент в дизайн-студии, редакции или на киносъёмках", kk: "Дизайн-студияда, редакцияда немесе кино түсірілімінде ассистент", en: "Assistant at a design studio, editorial office, or film set" }, scores: { A: 3 } },
            { text: { ru: "Вожатый в лагере или волонтёр в социальном проекте", kk: "Лагерьдегі жетекші немесе әлеуметтік жобадағы еріктілі", en: "Camp counselor or volunteer in a social project" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q18",
        text: {
            ru: "Тебе предложили ещё две подработки. Что выберешь?",
            kk: "Саған тағы екі жұмыс ұсынылды. Нені таңдайсың?",
            en: "You're offered two more jobs. Which do you choose?",
        },
        options: [
            { text: { ru: "Помощник менеджера по продажам в стартапе", kk: "Стартапта сату менеджерінің көмекшісі", en: "Sales manager assistant at a startup" }, scores: { E: 3 } },
            { text: { ru: "Ассистент бухгалтера или делопроизводителя", kk: "Бухгалтердің немесе іс жүргізушінің көмекшісі", en: "Bookkeeper or records management assistant" }, scores: { C: 3 } },
            { text: { ru: "Фриланс-программирование или IT-поддержка", kk: "Фриланс бағдарламалау немесе IT-қолдау", en: "Freelance programming or IT support" }, scores: { I: 2, R: 1 } },
            { text: { ru: "Разработка и ведение контента для социальных сетей", kk: "Әлеуметтік желілер үшін контент жасау және жүргізу", en: "Content creation and management for social media" }, scores: { A: 2, E: 1 } },
        ],
    },
    {
        id: "q19",
        text: {
            ru: "Ты смотришь документальный фильм. Какая тема тебя захватит?",
            kk: "Сен деректі фильм көріп отырсың. Қандай тақырып сені қызықтырады?",
            en: "You're watching a documentary. Which topic would captivate you?",
        },
        options: [
            { text: { ru: "Как строят небоскрёбы, мосты или космические ракеты", kk: "Аспан тіреулер, көпірлер немесе ғарыш зымырандарын қалай салады", en: "How skyscrapers, bridges, or rockets are built" }, scores: { R: 3 } },
            { text: { ru: "Тайны мозга, генетика или квантовая физика", kk: "Мидың сырлары, генетика немесе кванттық физика", en: "Mysteries of the brain, genetics, or quantum physics" }, scores: { I: 3 } },
            { text: { ru: "История великих художников, музыкантов или кинорежиссёров", kk: "Ұлы суретшілер, музыканттар немесе режиссерлердің тарихы", en: "Stories of great artists, musicians, or film directors" }, scores: { A: 3 } },
            { text: { ru: "Как работают крупнейшие бизнес-империи и их основатели", kk: "Ірі бизнес-империялар мен олардың негізін қалаушылар қалай жұмыс жасайды", en: "How the world's largest business empires and their founders operate" }, scores: { E: 3 } },
        ],
    },
    {
        id: "q20",
        text: {
            ru: "Тебе дали задание сделать доклад на свободную тему. Ты берёшь...",
            kk: "Саған еркін тақырыпта баяндама жасау тапсырмасы берілді. Сен аласың...",
            en: "You're given a free-topic assignment for a report. You choose...",
        },
        options: [
            { text: { ru: "Как работает тот или иной механизм или технология", kk: "Бұл немесе басқа механизм немесе технология қалай жұмыс жасайды", en: "How a specific mechanism or technology works" }, scores: { R: 2, I: 1 } },
            { text: { ru: "Психологический феномен или социальная проблема", kk: "Психологиялық феномен немесе әлеуметтік мәселе", en: "A psychological phenomenon or social issue" }, scores: { S: 2, I: 1 } },
            { text: { ru: "Жизнь и творчество выдающегося деятеля культуры", kk: "Көрнекті мәдениет қайраткерінің өмірі мен шығармашылығы", en: "The life and work of a prominent cultural figure" }, scores: { A: 3 } },
            { text: { ru: "Успешный бизнес-кейс или история стартапа", kk: "Табысты бизнес-кейс немесе стартап тарихы", en: "A successful business case or startup story" }, scores: { E: 3 } },
        ],
    },

    // ── БЛОК 7: РЕШЕНИЕ ЗАДАЧ ──────────────────────────────────────────────

    {
        id: "q21",
        text: {
            ru: "Как ты обычно принимаешь сложные решения?",
            kk: "Күрделі шешімдерді қалай қабылдайсың?",
            en: "How do you usually make difficult decisions?",
        },
        options: [
            { text: { ru: "Полагаюсь на практический опыт и здравый смысл", kk: "Практикалық тәжірибеге және денсаулық ойлауға сүйенемін", en: "Rely on practical experience and common sense" }, scores: { R: 3 } },
            { text: { ru: "Собираю данные, анализирую и выстраиваю логическую цепочку", kk: "Деректер жинаймын, талдаймын және логикалық тізбек құрамын", en: "Collect data, analyze it, and build a logical chain" }, scores: { I: 3 } },
            { text: { ru: "Доверяю интуиции и внутреннему ощущению правильности", kk: "Интуицияға және ішкі дұрыстық сезіміне сенемін", en: "Trust intuition and inner sense of what's right" }, scores: { A: 2, S: 1 } },
            { text: { ru: "Просчитываю риски и финансовые последствия каждого варианта", kk: "Әрбір нұсқаның тәуекелдері мен қаржылық салдарын есептеймін", en: "Calculate risks and financial consequences of each option" }, scores: { E: 2, C: 2 } },
        ],
    },
    {
        id: "q22",
        text: {
            ru: "Ты сталкиваешься с трудной проблемой. Что делаешь?",
            kk: "Күрделі мәселеге тап болдың. Не жасайсың?",
            en: "You face a difficult problem. What do you do?",
        },
        options: [
            { text: { ru: "Разбираю всё на части и пробую решения методом проб и ошибок", kk: "Бәрін бөліктерге бөліп, сынақ және қате әдісімен шешімдер іздеймін", en: "Break it down and try solutions through trial and error" }, scores: { R: 2, I: 1 } },
            { text: { ru: "Нахожу похожие случаи в книгах, интернете или у специалистов", kk: "Кітаптардан, интернеттен немесе мамандардан ұқсас жағдайларды табамын", en: "Find similar cases in books, online, or from specialists" }, scores: { I: 3 } },
            { text: { ru: "Подхожу нестандартно — ищу неочевидное, оригинальное решение", kk: "Стандартты емес жолмен келемін — айқын емес, бірегей шешім іздеймін", en: "Approach it unconventionally — look for a non-obvious, original solution" }, scores: { A: 2, I: 1 } },
            { text: { ru: "Собираю команду и решаем проблему вместе", kk: "Команда жинаймын және мәселені бірге шешеміз", en: "Gather a team and solve the problem together" }, scores: { S: 2, E: 1 } },
        ],
    },
    {
        id: "q23",
        text: {
            ru: "Тебе нужно выучить что-то новое. Как ты это делаешь?",
            kk: "Жаңа бірдеңе үйрену керек. Қалай жасайсың?",
            en: "You need to learn something new. How do you do it?",
        },
        options: [
            { text: { ru: "Беру в руки и пробую — лучше всего учусь на практике", kk: "Қолыма аламын және сынап көремін — тәжірибеде үйрену маған жақсырақ", en: "Take it in my hands and try — I learn best by doing" }, scores: { R: 3 } },
            { text: { ru: "Читаю теорию, смотрю лекции, потом практикую", kk: "Теория оқимын, дәрістер тыңдаймын, содан кейін жаттығамын", en: "Read theory, watch lectures, then practice" }, scores: { I: 3 } },
            { text: { ru: "Ищу вдохновляющие примеры и нахожу свой творческий подход", kk: "Шабыттандыратын мысалдарды іздеймін және өзімнің шығармашылық тәсілімді табамын", en: "Find inspiring examples and discover my own creative approach" }, scores: { A: 3 } },
            { text: { ru: "Нахожу ментора или друга, кто уже умеет, и учусь у него", kk: "Бұрыннан білетін тәлімгер немесе дос табамын және одан үйренемін", en: "Find a mentor or a friend who already knows it and learn from them" }, scores: { S: 2, E: 1 } },
        ],
    },

    // ── БЛОК 8: МЕЧТЫ И БУДУЩЕЕ ────────────────────────────────────────────

    {
        id: "q24",
        text: {
            ru: "Твоя мечта через 15 лет — это...",
            kk: "15 жылдан кейінгі арманың — бұл...",
            en: "Your dream 15 years from now is...",
        },
        options: [
            { text: { ru: "Руководить крупным строительным или инженерным проектом", kk: "Ірі құрылыс немесе инженерлік жобаны басқару", en: "Lead a major construction or engineering project" }, scores: { R: 2, E: 1 } },
            { text: { ru: "Быть признанным учёным или специалистом в своей области", kk: "Өз саласында танылған ғалым немесе маман болу", en: "Be a recognized scientist or specialist in your field" }, scores: { I: 3 } },
            { text: { ru: "Создать культовое произведение или собственный творческий бренд", kk: "Культтік туынды немесе өз шығармашылық брендін жасау", en: "Create an iconic work or your own creative brand" }, scores: { A: 3 } },
            { text: { ru: "Основать организацию, которая реально меняет жизни людей", kk: "Адамдардың өмірін шынымен өзгертетін ұйым құру", en: "Found an organization that genuinely changes people's lives" }, scores: { S: 2, E: 1 } },
        ],
    },
    {
        id: "q25",
        text: {
            ru: "Ещё о мечтах: через 15 лет ты хочешь...",
            kk: "Арман туралы тағы: 15 жылдан кейін сен қалайсың...",
            en: "More about dreams: in 15 years you want to...",
        },
        options: [
            { text: { ru: "Построить собственный бизнес-империю или стать топ-менеджером", kk: "Өз бизнес-империяңды немесе топ-менеджер болуды қалаймын", en: "Build your own business empire or become a top manager" }, scores: { E: 3 } },
            { text: { ru: "Занимать значимую должность в государственной структуре или финансах", kk: "Мемлекеттік құрылымда немесе қаржыда маңызды лауазымды иелену", en: "Hold a significant position in government or finance" }, scores: { C: 2, E: 1 } },
            { text: { ru: "Жить за счёт любимого дела, не зависеть от офиса", kk: "Сүйікті ісіңмен күнелту, кеңсеге тәуелді болмау", en: "Live off your passion, independent of any office" }, scores: { A: 2, I: 1 } },
            { text: { ru: "Быть известным врачом, педагогом или психологом", kk: "Белгілі дәрігер, педагог немесе психолог болу", en: "Be a well-known physician, teacher, or psychologist" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q26",
        text: {
            ru: "Если бы деньги не были важны, ты бы занимался...",
            kk: "Егер ақша маңызды болмаса, сен...",
            en: "If money didn't matter, you would spend your time...",
        },
        options: [
            { text: { ru: "Созданием и ремонтом всего подряд — своими руками", kk: "Барлық нәрсені жасау және жөндеу — өз қолыңмен", en: "Building and fixing things — with your own hands" }, scores: { R: 3 } },
            { text: { ru: "Чистой наукой — исследованиями без давления публикаций", kk: "Таза ғылыммен — жариялым қысымынсыз зерттеулер", en: "Pure science — research free from publication pressure" }, scores: { I: 3 } },
            { text: { ru: "Творчеством — рисовал, сочинял, снимал, ставил спектакли", kk: "Шығармашылықпен — сурет салу, шығару, түсіру, қойылымдар қою", en: "Creative work — painting, composing, filming, staging" }, scores: { A: 3 } },
            { text: { ru: "Волонтёрством или обучением тех, кто нуждается в помощи", kk: "Волонтерлікпен немесе көмекке мұқтаждарды оқытумен", en: "Volunteering or teaching those who need help" }, scores: { S: 3 } },
        ],
    },

    // ── БЛОК 9: ПРЕДПОЧТЕНИЯ В ДЕТАЛЯХ ────────────────────────────────────

    {
        id: "q27",
        text: {
            ru: "Если бы ты вёл YouTube-канал, о чём бы он был?",
            kk: "Егер YouTube арнасы жүргізсең, ол не туралы болар еді?",
            en: "If you ran a YouTube channel, what would it be about?",
        },
        options: [
            { text: { ru: "DIY, технологии, сборка компьютеров или автомобилей", kk: "DIY, технологиялар, компьютерлер немесе көліктерді жинау", en: "DIY, tech, building computers or cars" }, scores: { R: 3 } },
            { text: { ru: "Наука, разбор сложных тем, образовательный контент", kk: "Ғылым, күрделі тақырыптарды талдау, білім беру контенті", en: "Science, breaking down complex topics, educational content" }, scores: { I: 3 } },
            { text: { ru: "Искусство, музыка, кино, дизайн или творческий влог", kk: "Өнер, музыка, кино, дизайн немесе шығармашылық влог", en: "Art, music, film, design, or creative vlogging" }, scores: { A: 3 } },
            { text: { ru: "Психология, саморазвитие, советы по отношениям и общению", kk: "Психология, өзін-өзі дамыту, қарым-қатынас бойынша кеңес", en: "Psychology, self-development, tips on relationships and communication" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q28",
        text: {
            ru: "И ещё один вариант канала: он мог бы быть о...",
            kk: "Тағы бір арна нұсқасы: ол туралы болуы мүмкін...",
            en: "One more channel option: it could be about...",
        },
        options: [
            { text: { ru: "Бизнесе, стартапах, инвестициях и карьерном росте", kk: "Бизнес, стартаптар, инвестициялар және мансаптық өсу туралы", en: "Business, startups, investments, and career growth" }, scores: { E: 3 } },
            { text: { ru: "Финансовой грамотности, налогах, бухгалтерии и праве", kk: "Қаржылық сауаттылық, салықтар, бухгалтерия және заң туралы", en: "Financial literacy, taxes, accounting, and law" }, scores: { C: 3 } },
            { text: { ru: "Путешествиях, природе, экологии и жизни в разных культурах", kk: "Саяхат, табиғат, экология және әртүрлі мәдениеттерде өмір туралы", en: "Travel, nature, ecology, and life in different cultures" }, scores: { R: 1, S: 1, A: 1 } },
            { text: { ru: "Медицине, здоровому образу жизни или психическому здоровью", kk: "Медицина, денсаулықты сақтау немесе психикалық денсаулық туралы", en: "Medicine, healthy lifestyle, or mental health" }, scores: { S: 2, I: 1 } },
        ],
    },
    {
        id: "q29",
        text: {
            ru: "Ты читаешь книгу. Какой жанр ты выбрал?",
            kk: "Кітап оқып отырсың. Қандай жанр таңдадың?",
            en: "You're reading a book. Which genre did you choose?",
        },
        options: [
            { text: { ru: "Научно-популярная книга о технологиях или природе", kk: "Технологиялар немесе табиғат туралы танымал ғылым кітабы", en: "A popular science book about technology or nature" }, scores: { R: 1, I: 2 } },
            { text: { ru: "Роман или художественная литература с глубокими персонажами", kk: "Терең кейіпкерлері бар роман немесе көркем әдебиет", en: "A novel or literary fiction with deep characters" }, scores: { A: 2, S: 1 } },
            { text: { ru: "Биография успешного предпринимателя или политика", kk: "Табысты кәсіпкердің немесе саясаткердің өмірбаяны", en: "Biography of a successful entrepreneur or politician" }, scores: { E: 3 } },
            { text: { ru: "Нон-фикшн о психологии, социологии или педагогике", kk: "Психология, социология немесе педагогика туралы нон-фикшн", en: "Non-fiction about psychology, sociology, or education" }, scores: { S: 2, I: 1 } },
        ],
    },
    {
        id: "q30",
        text: {
            ru: "Ты листаешь ленту новостей. На что обратишь внимание?",
            kk: "Жаңалықтар лентасын ашасың. Неге назар аударасың?",
            en: "You're scrolling the news feed. What catches your eye?",
        },
        options: [
            { text: { ru: "Новость о новом инженерном рекорде или технологическом открытии", kk: "Жаңа инженерлік рекорд немесе технологиялық жаңалық туралы хабар", en: "News of a new engineering record or technological breakthrough" }, scores: { R: 2, I: 1 } },
            { text: { ru: "Статья о научном исследовании или медицинском прорыве", kk: "Ғылыми зерттеу немесе медициналық жаңалық туралы мақала", en: "Article about a scientific study or medical breakthrough" }, scores: { I: 3 } },
            { text: { ru: "Репортаж о культурном событии, фестивале или выставке", kk: "Мәдени іс-шара, фестиваль немесе көрме туралы репортаж", en: "Report on a cultural event, festival, or exhibition" }, scores: { A: 3 } },
            { text: { ru: "Аналитика о рынке, стартапах или крупных сделках", kk: "Нарық, стартаптар немесе ірі мәмілелер туралы аналитика", en: "Analysis of the market, startups, or major deals" }, scores: { E: 2, C: 1 } },
        ],
    },

    // ── БЛОК 10: ЦЕННОСТИ И СОЦИАЛЬНЫЙ ВКЛАД ─────────────────────────────

    {
        id: "q31",
        text: {
            ru: "Каким ты хочешь быть известен через 20 лет?",
            kk: "20 жылдан кейін қалай танымал болғың келеді?",
            en: "How do you want to be known in 20 years?",
        },
        options: [
            { text: { ru: "Как мастер своего дела — тот, кто умеет делать руками лучше всех", kk: "Шеберлігімен — қолмен ең жақсы жасай алатын адам ретінде", en: "As a master of your craft — the best at hands-on work" }, scores: { R: 3 } },
            { text: { ru: "Как эксперт, чьи исследования изменили понимание чего-то важного", kk: "Зерттеулері маңызды нәрсені түсінуді өзгерткен сарапшы ретінде", en: "As an expert whose research changed understanding of something important" }, scores: { I: 3 } },
            { text: { ru: "Как творец, чьи работы тронули и вдохновили тысячи людей", kk: "Жұмыстары мыңдаған адамды толқытып, шабыттандырған шығармашы ретінде", en: "As a creator whose work touched and inspired thousands" }, scores: { A: 3 } },
            { text: { ru: "Как наставник и лидер, воспитавший успешных учеников", kk: "Табысты шәкірттер тәрбиелеген ұстаз және жетекші ретінде", en: "As a mentor and leader who raised successful students" }, scores: { S: 2, E: 1 } },
        ],
    },
    {
        id: "q32",
        text: {
            ru: "Ещё о признании: ты хочешь быть известен как...",
            kk: "Танымал болу туралы тағы: сен ... ретінде танымал болғың келеді",
            en: "More about recognition: you want to be known as...",
        },
        options: [
            { text: { ru: "Успешный предприниматель, изменивший свою индустрию", kk: "Өз саласын өзгерткен табысты кәсіпкер", en: "A successful entrepreneur who transformed their industry" }, scores: { E: 3 } },
            { text: { ru: "Надёжный профессионал, которому доверяют сложные задачи", kk: "Күрделі тапсырмаларға сенетін сенімді кәсіпқой", en: "A reliable professional trusted with complex tasks" }, scores: { C: 3 } },
            { text: { ru: "Человек, посвятивший себя помощи уязвимым людям", kk: "Өзін осал адамдарға көмектесуге арнаған адам", en: "A person devoted to helping vulnerable people" }, scores: { S: 3 } },
            { text: { ru: "Учёный с мировым именем в своей области", kk: "Өз саласында әлемге танымал ғалым", en: "A world-renowned scientist in your field" }, scores: { I: 3 } },
        ],
    },
    {
        id: "q33",
        text: {
            ru: "Что тебя больше всего злит в современном мире?",
            kk: "Қазіргі әлемде сені ең көп не ашуландырады?",
            en: "What bothers you most about the modern world?",
        },
        options: [
            { text: { ru: "Плохое качество строительства, техники, инфраструктуры", kk: "Құрылыстың, техниканың, инфрақұрылымның нашар сапасы", en: "Poor quality of construction, equipment, infrastructure" }, scores: { R: 3 } },
            { text: { ru: "Распространение лженауки и нежелание думать критически", kk: "Жалған ғылымның таралуы және сыни ойлаудан бас тарту", en: "The spread of pseudoscience and unwillingness to think critically" }, scores: { I: 3 } },
            { text: { ru: "Коммерциализация культуры и кризис подлинного творчества", kk: "Мәдениеттің коммерцияландырылуы және шынайы шығармашылықтың дағдарысы", en: "Commercialization of culture and crisis of authentic creativity" }, scores: { A: 3 } },
            { text: { ru: "Равнодушие людей друг к другу и нехватка взаимопомощи", kk: "Адамдардың бір-біріне немқұрайлылығы және өзара көмектің жетіспеуі", en: "People's indifference to each other and lack of mutual support" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q34",
        text: {
            ru: "Ещё о том, что злит: тебя раздражает...",
            kk: "Ашуландыратын нәрселер туралы тағы: сені ... ашуландырады",
            en: "More pet peeves: you're frustrated by...",
        },
        options: [
            { text: { ru: "Бюрократия, которая мешает предпринимать и развиваться", kk: "Кәсіпкерлікке және дамуға кедергі болатын бюрократия", en: "Bureaucracy that prevents entrepreneurship and growth" }, scores: { E: 3 } },
            { text: { ru: "Хаос и беспорядок, когда никто не соблюдает правила", kk: "Ешкім ережелерді сақтамайтын кезде болатын хаос пен тәртіпсіздік", en: "Chaos and disorder when nobody follows the rules" }, scores: { C: 3 } },
            { text: { ru: "Несправедливость и ущемление прав уязвимых людей", kk: "Осал адамдардың құқықтарының бұзылуы мен әділетсіздік", en: "Injustice and violation of vulnerable people's rights" }, scores: { S: 2, I: 1 } },
            { text: { ru: "Медленный прогресс науки и технологий в решении ключевых проблем", kk: "Ғылым мен технологиялардың негізгі мәселелерді шешудегі баяу ілгерілеуі", en: "Slow scientific and technological progress on key problems" }, scores: { I: 2, R: 1 } },
        ],
    },

    // ── БЛОК 11: ФИНАЛЬНЫЕ ВОПРОСЫ ─────────────────────────────────────────

    {
        id: "q35",
        text: {
            ru: "Какой комплимент тебе было бы приятнее всего получить?",
            kk: "Қандай мақтауды алу саған ең жағымды болар еді?",
            en: "Which compliment would please you most?",
        },
        options: [
            { text: { ru: "«Ты умеешь делать то, что другие даже не представляют как»", kk: "«Сен басқалар елестете де алмайтын нәрсені жасай аласың»", en: "\"You can do things others can't even imagine how to do\"" }, scores: { R: 3 } },
            { text: { ru: "«Ты знаешь эту тему лучше, чем кто-либо»", kk: "«Сен бұл тақырыпты кімнен де жақсырақ білесің»", en: "\"You know this topic better than anyone\"" }, scores: { I: 3 } },
            { text: { ru: "«Твоя работа меня вдохновила — я не мог оторваться»", kk: "«Сенің жұмысың мені шабыттандырды — мен қала алмадым»", en: "\"Your work inspired me — I couldn't stop engaging with it\"" }, scores: { A: 3 } },
            { text: { ru: "«Ты изменил мою жизнь к лучшему»", kk: "«Сен менің өмірімді жақсы жаққа өзгерттің»", en: "\"You changed my life for the better\"" }, scores: { S: 3 } },
        ],
    },
    {
        id: "q36",
        text: {
            ru: "И последний комплимент — каким из них ты хочешь быть?",
            kk: "Соңғы мақтау — сен олардың қайсысы болғың келеді?",
            en: "Last one — which of these would you most want to be called?",
        },
        options: [
            { text: { ru: "«Самый результативный лидер, которого я знал»", kk: "«Мен танысқан ең нәтижелі жетекші»", en: "\"The most results-driven leader I've known\"" }, scores: { E: 3 } },
            { text: { ru: "«Самый надёжный и точный человек в команде»", kk: "«Командадағы ең сенімді және нақты адам»", en: "\"The most reliable and precise person on the team\"" }, scores: { C: 3 } },
            { text: { ru: "«Человек, который всегда помогал, когда было трудно»", kk: "«Қиын кезде әрдайым көмектесетін адам»", en: "\"The person who always helped when things were hard\"" }, scores: { S: 3 } },
            { text: { ru: "«Ты видишь мир иначе — это редкий дар»", kk: "«Сен әлемді басқаша көресің — бұл сирек дарын»", en: "\"You see the world differently — that's a rare gift\"" }, scores: { A: 2, I: 1 } },
        ],
    },
];

// ─── Score calculator ─────────────────────────────────────────────────────────

export function scoreAnswers(answers: number[]): TestResult {
    const totals: Record<string, number> = {};
    DIRECTIONS.forEach(d => { totals[d.id] = 0; });

    // Accumulate scores
    CAREER_QUESTIONS.forEach((q, qi) => {
        const ans = answers[qi];
        if (ans == null) return;
        const opt = q.options[ans];
        if (!opt) return;
        Object.entries(opt.scores).forEach(([id, pts]) => {
            totals[id] = (totals[id] ?? 0) + pts;
        });
    });

    // Calculate real max per direction (sum of best possible per question)
    const realMax: Record<string, number> = {};
    DIRECTIONS.forEach(d => { realMax[d.id] = 0; });
    CAREER_QUESTIONS.forEach(q => {
        const maxByDir: Record<string, number> = {};
        q.options.forEach(o => {
            Object.entries(o.scores).forEach(([id, pts]) => {
                maxByDir[id] = Math.max(maxByDir[id] ?? 0, pts);
            });
        });
        Object.entries(maxByDir).forEach(([id, pts]) => {
            realMax[id] = (realMax[id] ?? 0) + pts;
        });
    });

    const scores = DIRECTIONS.map(d => ({
        id: d.id,
        label: d.label,
        score: totals[d.id] ?? 0,
        max: realMax[d.id] || 10,
        color: d.color,
        percent: realMax[d.id] ? Math.round(((totals[d.id] ?? 0) / realMax[d.id]) * 100) : 0,
    })).sort((a, b) => b.score - a.score);

    // Build Holland Code from top 3 types
    const hollandCode = scores.slice(0, 3).map(s => s.id).join("");

    const getDir = (id: string): Direction & { score: number } => {
        const dir = DIRECTIONS.find(d => d.id === id)!;
        return { ...dir, score: totals[id] ?? 0 };
    };

    return {
        scores,
        hollandCode,
        topDirection:    getDir(scores[0]!.id),
        secondDirection: getDir(scores[1]!.id),
        thirdDirection:  getDir(scores[2]!.id),
    };
}