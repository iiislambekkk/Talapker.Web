"use client";

import React, { useState, useTransition } from "react";
import {useSearchParams, useRouter, redirect} from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { useLang } from "@/hooks/useLang";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";

import {
    Eye, EyeOff, ChevronRight, ChevronLeft,
    Check, X, Shield, Sparkles, GraduationCap,
    Heart, User, Loader2,
} from "lucide-react";
import {ThemeToggle} from "@workspace/ui/components/ThemeToggle";
import {ChangeLangButton} from "@/components/ChangeLangButton";

// ─── i18n ───────────────────────────────────────────────────────────────────────

type Lang = "ru" | "kk" | "en";

const t = {
    hero: {
        badge:    { ru: "Программа амбассадоров", kk: "Амбассадор бағдарламасы",  en: "Ambassador Program"         },
        title1:   { ru: "Вас",                    kk: "Сіз",                       en: "You've been"                },
        title2:   { ru: "выбрали.",               kk: "таңдалдыңыз.",              en: "chosen."                    },
        subtitle: { ru: "Войдите в избранную группу студентов, представляющих свой университет. Делитесь историей, помогайте абитуриентам и оставьте след.", kk: "Университетіңізді таныстыратын таңдаулы студенттер тобына қосылыңыз.", en: "Join a select group of students representing their institution. Share your story, connect with prospective students, make an impact." },
    },
    steps: {
        account:   { ru: "Аккаунт",    kk: "Аккаунт",    en: "Account"   },
        profile:   { ru: "Профиль",    kk: "Профиль",     en: "Profile"   },
        academic:  { ru: "Учёба",      kk: "Оқу",         en: "Academic"  },
        languages: { ru: "Языки",      kk: "Тілдер",      en: "Languages" },
        interests: { ru: "Интересы",   kk: "Қызығушылық", en: "Interests" },
    },
    heading: {
        1: { ru: "Создайте аккаунт",       kk: "Аккаунт жасаңыз",          en: "Create your account"    },
        2: { ru: "Расскажите о себе",      kk: "Өзіңіз туралы айтыңыз",    en: "Tell your story"        },
        3: { ru: "Ваша учёба",             kk: "Оқу деректеріңіз",          en: "Your academics"         },
        4: { ru: "Языки общения",          kk: "Тілдеріңіз",                en: "Languages you speak"    },
        5: { ru: "Что вас вдохновляет",    kk: "Сізді не шабыттандырады",   en: "What drives you"        },
    } as Record<number, Record<Lang, string>>,
    subheading: {
        1: { ru: "Данные для входа",                        kk: "Кіру деректері",                     en: "Set up your login credentials"   },
        2: { ru: "Помогите студентам познакомиться с вами", kk: "Студенттерге өзіңізді таныстырыңыз",  en: "Help students get to know you"   },
        3: { ru: "Укажите детали об учёбе",                 kk: "Оқу туралы мәліметтерді енгізіңіз",  en: "Your study details"              },
        4: { ru: "Выберите все подходящие",                 kk: "Барлық қолайлыларды таңдаңыз",       en: "Select all that apply"           },
        5: { ru: "Выберите интересы и увлечения",           kk: "Қызығушылықтарыңызды таңдаңыз",      en: "Choose your interests"           },
    } as Record<number, Record<Lang, string>>,
    fields: {
        firstName:       { ru: "Имя",               kk: "Аты",                  en: "First Name"         },
        lastName:        { ru: "Фамилия",            kk: "Тегі",                 en: "Last Name"          },
        password:        { ru: "Пароль",             kk: "Құпия сөз",            en: "Password"           },
        confirmPassword: { ru: "Подтвердите пароль", kk: "Құпия сөзді растаңыз", en: "Confirm Password"   },
        tagline:         { ru: "Теглайн",            kk: "Тегтайн",              en: "Tagline"            },
        bio:             { ru: "О себе",             kk: "Өзім туралы",          en: "Bio"                },
        degree:          { ru: "Степень",            kk: "Дәрежесі",             en: "Degree"             },
        studyYear:       { ru: "Год обучения",       kk: "Оқу жылы",             en: "Study Year"         },
        optional:        { ru: "(необязательно)",    kk: "(міндетті емес)",      en: "(optional)"         },
    },
    placeholders: {
        firstName:       { ru: "Айбек",                               kk: "Айбек",                         en: "John"                          },
        lastName:        { ru: "Сейткали",                            kk: "Сейткали",                      en: "Doe"                           },
        password:        { ru: "Минимум 8 символов",                  kk: "Кемінде 8 таңба",               en: "At least 8 characters"         },
        confirmPassword: { ru: "Повторите пароль",                    kk: "Құпия сөзді қайталаңыз",        en: "Repeat password"               },
        tagline:         { ru: "Напр., Будущий инженер и кофеман",    kk: "Мысалы, Болашақ инженер",       en: "e.g. Future engineer & coffee addict" },
        bio:             { ru: "Расскажите о себе, своём пути...",    kk: "Өзіңіз туралы, жолыңыз туралы...", en: "Tell your story, journey..." },
    },
    validation: {
        required:        { ru: "Обязательное поле",          kk: "Міндетті өріс",            en: "Required"                  },
        minPassword:     { ru: "Минимум 8 символов",         kk: "Кемінде 8 таңба",          en: "Minimum 8 characters"      },
        passwordMatch:   { ru: "Пароли не совпадают",        kk: "Құпия сөздер сәйкес емес", en: "Passwords don't match"     },
        selectLanguage:  { ru: "Выберите хотя бы один",      kk: "Кемінде бірін таңдаңыз",   en: "Select at least one"       },
        selectInterest:  { ru: "Выберите хотя бы один",      kk: "Кемінде бірін таңдаңыз",   en: "Select at least one"       },
    },
    nav: {
        back:     { ru: "Назад",       kk: "Артқа",       en: "Back"     },
        continue: { ru: "Продолжить",  kk: "Жалғастыру",  en: "Continue" },
        submit:   { ru: "Завершить",   kk: "Аяқтау",      en: "Complete" },
        saving:   { ru: "Сохранение…", kk: "Сақталуда…",  en: "Saving…"  },
    },
    decline: {
        trigger: { ru: "Отклонить приглашение",      kk: "Шақыруды қабылдамау",          en: "Decline invitation"     },
        title:   { ru: "Отклонить приглашение?",     kk: "Шақыруды қабылдамайсыз ба?",   en: "Decline Invitation?"    },
        desc:    { ru: "Это действие нельзя отменить. Вы потеряете место в программе.", kk: "Бұл әрекетті болдырмау мүмкін емес. Бағдарламадағы орныңызды жоғалтасыз.", en: "This cannot be undone. You will forfeit your spot in the Ambassador Program." },
        cancel:  { ru: "Отмена",      kk: "Болдырмау",   en: "Cancel"     },
        confirm: { ru: "Отклонить",   kk: "Қабылдамау",  en: "Decline"    },
        doing:   { ru: "Отклонение…", kk: "Өңделуде…",   en: "Declining…" },
    },
    success: {
        title:    { ru: "Добро пожаловать.",  kk: "Қош келдіңіз.",  en: "Welcome aboard."  },
        subtitle: { ru: "Ваш профиль амбассадора создан. Письмо с подтверждением отправлено.", kk: "Амбассадор профиліңіз дайын. Растау хаты жіберілді.", en: "Your ambassador profile is live. A confirmation email is on its way." },
    },
    toast: {
        declined: { ru: "Приглашение отклонено.",   kk: "Шақыру қабылданбады.",   en: "Invitation declined."    },
        error:    { ru: "Что-то пошло не так.",     kk: "Бірдеңе дұрыс болмады.", en: "Something went wrong."  },
    },
    chars: { ru: "символов", kk: "таңба", en: "characters" },
} as const;

// ─── Static data ─────────────────────────────────────────────────────────────────

const DEGREE_TYPES = [
    { value: "bachelor", label: { ru: "Бакалавр",  kk: "Бакалавр",  en: "Bachelor's" }, icon: "🎓" },
    { value: "master",   label: { ru: "Магистр",   kk: "Магистр",   en: "Master's"   }, icon: "📚" },
    { value: "phd",      label: { ru: "Докторант", kk: "Докторант", en: "PhD"        }, icon: "🔬" },
];

const LANGUAGES = [
    { value: "english",  label: { ru: "Английский",  kk: "Ағылшын",  en: "English"  }, flag: "🇬🇧" },
    { value: "kazakh",   label: { ru: "Казахский",   kk: "Қазақша",  en: "Kazakh"   }, flag: "🇰🇿" },
    { value: "russian",  label: { ru: "Русский",     kk: "Орысша",   en: "Russian"  }, flag: "🇷🇺" },
    { value: "turkish",  label: { ru: "Турецкий",    kk: "Түрікше",  en: "Turkish"  }, flag: "🇹🇷" },
    { value: "chinese",  label: { ru: "Китайский",   kk: "Қытайша",  en: "Chinese"  }, flag: "🇨🇳" },
    { value: "german",   label: { ru: "Немецкий",    kk: "Немісше",  en: "German"   }, flag: "🇩🇪" },
    { value: "french",   label: { ru: "Французский", kk: "Француз",  en: "French"   }, flag: "🇫🇷" },
    { value: "spanish",  label: { ru: "Испанский",   kk: "Испанша",  en: "Spanish"  }, flag: "🇪🇸" },
    { value: "korean",   label: { ru: "Корейский",   kk: "Кәрейше",  en: "Korean"   }, flag: "🇰🇷" },
    { value: "japanese", label: { ru: "Японский",    kk: "Жапонша",  en: "Japanese" }, flag: "🇯🇵" },
];

const INTERESTS = [
    { value: "technology",   label: { ru: "Технологии",      kk: "Технология",    en: "Technology"    }, icon: "💻" },
    { value: "programming",  label: { ru: "Программирование", kk: "Бағдарлама",    en: "Programming"   }, icon: "👨‍💻" },
    { value: "gaming",       label: { ru: "Игры",             kk: "Ойындар",       en: "Gaming"        }, icon: "🎮" },
    { value: "music",        label: { ru: "Музыка",           kk: "Музыка",        en: "Music"         }, icon: "🎵" },
    { value: "movies",       label: { ru: "Кино",             kk: "Кино",          en: "Movies"        }, icon: "🎬" },
    { value: "sports",       label: { ru: "Спорт",            kk: "Спорт",         en: "Sports"        }, icon: "⚽" },
    { value: "fitness",      label: { ru: "Фитнес",           kk: "Фитнес",        en: "Fitness"       }, icon: "💪" },
    { value: "reading",      label: { ru: "Чтение",           kk: "Оқу",           en: "Reading"       }, icon: "📚" },
    { value: "photography",  label: { ru: "Фотография",       kk: "Фотография",    en: "Photography"   }, icon: "📸" },
    { value: "travel",       label: { ru: "Путешествия",      kk: "Саяхат",        en: "Travel"        }, icon: "✈️" },
    { value: "cooking",      label: { ru: "Кулинария",        kk: "Аспаздық",      en: "Cooking"       }, icon: "🍳" },
    { value: "art",          label: { ru: "Искусство",        kk: "Өнер",          en: "Art"           }, icon: "🎨" },
    { value: "business",     label: { ru: "Бизнес",           kk: "Бизнес",        en: "Business"      }, icon: "💼" },
    { value: "science",      label: { ru: "Наука",            kk: "Ғылым",         en: "Science"       }, icon: "🔬" },
    { value: "volunteering", label: { ru: "Волонтёрство",     kk: "Волонтерлік",   en: "Volunteering"  }, icon: "🤝" },
];

// ─── Schema ──────────────────────────────────────────────────────────────────────

const buildSchema = (l: Lang) =>
    z.object({
        firstName:       z.string().min(1, t.validation.required[l]),
        lastName:        z.string().min(1, t.validation.required[l]),
        password:        z.string().min(8, t.validation.minPassword[l]),
        confirmPassword: z.string(),
        tagline:         z.string().optional(),
        bio:             z.string().optional(),
        studyYear:       z.number().min(1).max(6),
        degreeType:      z.string().min(1, t.validation.required[l]),
        languages:       z.array(z.string()).min(1, t.validation.selectLanguage[l]),
        interests:       z.array(z.string()).min(1, t.validation.selectInterest[l]),
    }).refine((d) => d.password === d.confirmPassword, {
        message: t.validation.passwordMatch[l],
        path: ["confirmPassword"],
    });

type FormData = z.infer<ReturnType<typeof buildSchema>>;

// ─── Config ──────────────────────────────────────────────────────────────────────

const STEP_FIELDS: Record<number, string[]> = {
    1: ["firstName", "lastName", "password", "confirmPassword"],
    2: ["tagline", "bio"],
    3: ["studyYear", "degreeType"],
    4: ["languages"],
    5: ["interests"],
};

const STEP_ICONS = [Shield, User, GraduationCap, Sparkles, Heart];
const STEP_KEYS  = Object.keys(t.steps) as Array<keyof typeof t.steps>;
const TOTAL      = 5;

// ─── Animations ──────────────────────────────────────────────────────────────────

const slide = {
    enter: (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -36 : 36, opacity: 0 }),
};
const tr = { duration: 0.2, ease: "easeInOut" as const };

// ─── Success ─────────────────────────────────────────────────────────────────────

function SuccessScreen({ l }: { l: Lang }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-background"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-8"
            >
                <Check className="w-10 h-10 text-primary" strokeWidth={2.5} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                       className="text-4xl font-bold tracking-tight mb-3">
                {t.success.title[l]}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                      className="text-muted-foreground max-w-xs leading-relaxed">
                {t.success.subtitle[l]}
            </motion.p>
        </motion.div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function AcceptInvitePage() {
    const searchParams = useSearchParams();
    const router       = useRouter();
    const [rawLang]    = useLang();
    const l: Lang      = (["ru","kk","en"] as Lang[]).includes(rawLang as Lang) ? (rawLang as Lang) : "en";

    if (searchParams == null) return null

    const code         = searchParams.get("code")         ?? "";
    const invitationId = searchParams.get("invitationId") ?? "";

    const [step, setStep]     = useState(1);
    const [dir,  setDir]      = useState(1);
    const [done, setDone]     = useState(false);
    const [showPw,  setShowPw]  = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    const [isDeclining,  startDeclining]  = useTransition();
    const [isSubmitting, startSubmitting] = useTransition();

    const form = useForm<FormData>({
        resolver: zodResolver(buildSchema(l)),
        defaultValues: {
            firstName: "", lastName: "", password: "", confirmPassword: "",
            tagline: "", bio: "", studyYear: 1, degreeType: "",
            languages: [], interests: [],
        },
    });

    const languages = form.watch("languages");
    const interests  = form.watch("interests");

    const toggle = (field: "languages" | "interests", value: string) => {
        const cur = form.getValues(field) as string[];
        form.setValue(field,
            cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value],
            { shouldValidate: true }
        );
    };

    const goNext = async () => {
        const valid = await form.trigger(STEP_FIELDS[step] as any);
        if (!valid) return;
        setDir(1);
        setStep(s => Math.min(s + 1, TOTAL));
    };

    const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

    const handleDecline = () => {
        startDeclining(async () => {
            try {
                const api = createApi();
                await api.post("/api/users/invite/decline", { invitationId, secretCode: code });
                logger.log("[AcceptInvitePage] declined");
                toast.success(t.toast.declined[l]);
                router.push("/");
            } catch (err: any) {
                logger.error("[AcceptInvitePage] decline error", err);
                toast.error(t.toast.error[l]);
            }
        });
    };

    const onSubmit = (values: FormData) => {
        startSubmitting(async () => {
            try {
                const payload = {
                    invitationId, secretCode: code,
                    password: values.password, firstName: values.firstName, lastName: values.lastName,
                    tagline: values.tagline || null, bio: values.bio || null,
                    studyYear: values.studyYear, degreeType: values.degreeType,
                    languages: values.languages, interests: values.interests,
                };
                logger.log("[AcceptInvitePage] submitting", payload);
                const api = createApi();
                await api.post("/api/ambassadors/invite/accept", payload);
                setDone(true);

                router.push("/ambassador")
            } catch (err: any) {
                logger.error("[AcceptInvitePage] submit error", err);
                toast.error(err?.response?.data?.message ?? t.toast.error[l]);
            }
        });
    };

    if (done) return <SuccessScreen l={l} />;

    const StepIcon   = STEP_ICONS[step - 1];
    const stepKey    = STEP_KEYS[step - 1];

    return (
        <div className="min-h-screen flex bg-background">

            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col justify-between p-12 border-r bg-card relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                />

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
                    <Badge variant="secondary" className="mb-10 gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {t.hero.badge[l]}
                    </Badge>
                    <h1 className="text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-5">
                        {t.hero.title1[l]}<br />
                        <span className="text-primary">{t.hero.title2[l]}</span>
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                        {t.hero.subtitle[l]}
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="relative space-y-1">
                    {STEP_ICONS.map((Icon, i) => {
                        const s        = i + 1;
                        const isActive = s === step;
                        const isDone   = s < step;
                        return (
                            <div key={s}
                                 className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                                 style={{ opacity: isActive ? 1 : isDone ? 0.5 : 0.28 }}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                                    ${isDone   ? "bg-primary text-primary-foreground"
                                    : isActive ? "bg-primary/15 border border-primary text-primary"
                                        : "bg-muted border border-border text-muted-foreground"}`}
                                >
                                    {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Icon className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                    {t.steps[STEP_KEYS[i]][l]}
                                </span>
                                {isActive && <motion.div layoutId="line" className="h-px flex-1 max-w-8 bg-primary/40" />}
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex flex-col">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 lg:px-10 border-b">
                    <div className="lg:hidden">
                        <Badge variant="secondary" className="gap-1.5 text-xs">
                            <Sparkles className="w-3 h-3" />
                            {t.hero.badge[l]}
                        </Badge>
                    </div>


                    <div className="ml-auto flex items-center gap-5">

                        <div className={"flex items-center gap-2"}>
                            <ThemeToggle/>
                            <ChangeLangButton />
                        </div>


                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-1.5">
                                    <X className="w-3.5 h-3.5" />
                                    {t.decline.trigger[l]}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t.decline.title[l]}</AlertDialogTitle>
                                    <AlertDialogDescription>{t.decline.desc[l]}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t.decline.cancel[l]}</AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button variant="destructive" onClick={handleDecline} disabled={isDeclining}>
                                            {isDeclining && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                                            {isDeclining ? t.decline.doing[l] : t.decline.confirm[l]}
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Mobile progress */}
                <div className="lg:hidden px-6 pt-5 pb-1">
                    <div className="flex gap-1 mb-1.5">
                        {Array.from({ length: TOTAL }, (_, i) => (
                            <div key={i}
                                 className={`flex-1 h-1 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : "bg-muted"}`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{step} / {TOTAL} — {t.steps[stepKey][l]}</p>
                </div>

                {/* Form body */}
                <div className="flex-1 flex items-start justify-center px-6 py-10 lg:px-16 xl:px-24">
                    <div className="w-full max-w-md">

                        {/* Header */}
                        <AnimatePresence mode="wait" custom={dir}>
                            <motion.div key={`h${step}`} custom={dir} variants={slide}
                                        initial="enter" animate="center" exit="exit" transition={tr} className="mb-8">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <StepIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-primary tracking-widest uppercase">
                                        {t.steps[stepKey][l]}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">{t.heading[step][l]}</h2>
                                <p className="text-muted-foreground text-sm mt-1.5">{t.subheading[step][l]}</p>
                            </motion.div>
                        </AnimatePresence>

                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait" custom={dir}>
                                <motion.div key={`s${step}`} custom={dir} variants={slide}
                                            initial="enter" animate="center" exit="exit" transition={tr}>
                                    <FieldGroup className="space-y-4">

                                        {/* Step 1 */}
                                        {step === 1 && (<>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Controller name="firstName" control={form.control}
                                                            render={({ field, fieldState }) => (
                                                                <Field data-invalid={!!fieldState.error}>
                                                                    <FieldLabel>{t.fields.firstName[l]}</FieldLabel>
                                                                    <Input {...field} placeholder={t.placeholders.firstName[l]} />
                                                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                                </Field>
                                                            )}
                                                />
                                                <Controller name="lastName" control={form.control}
                                                            render={({ field, fieldState }) => (
                                                                <Field data-invalid={!!fieldState.error}>
                                                                    <FieldLabel>{t.fields.lastName[l]}</FieldLabel>
                                                                    <Input {...field} placeholder={t.placeholders.lastName[l]} />
                                                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                                </Field>
                                                            )}
                                                />
                                            </div>
                                            <Controller name="password" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>{t.fields.password[l]}</FieldLabel>
                                                                <div className="relative">
                                                                    <Input {...field} type={showPw ? "text" : "password"}
                                                                           placeholder={t.placeholders.password[l]} className="pr-10" />
                                                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                            <Controller name="confirmPassword" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>{t.fields.confirmPassword[l]}</FieldLabel>
                                                                <div className="relative">
                                                                    <Input {...field} type={showCpw ? "text" : "password"}
                                                                           placeholder={t.placeholders.confirmPassword[l]} className="pr-10" />
                                                                    <button type="button" onClick={() => setShowCpw(v => !v)}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                                        {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                        </>)}

                                        {/* Step 2 */}
                                        {step === 2 && (<>
                                            <Controller name="tagline" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>
                                                                    {t.fields.tagline[l]}{" "}
                                                                    <span className="text-muted-foreground font-normal">{t.fields.optional[l]}</span>
                                                                </FieldLabel>
                                                                <Input {...field} placeholder={t.placeholders.tagline[l]} />
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                            <Controller name="bio" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>
                                                                    {t.fields.bio[l]}{" "}
                                                                    <span className="text-muted-foreground font-normal">{t.fields.optional[l]}</span>
                                                                </FieldLabel>
                                                                <Textarea {...field} rows={5} placeholder={t.placeholders.bio[l]} />
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {field.value?.length ?? 0} {t.chars[l]}
                                                                </p>
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                        </>)}

                                        {/* Step 3 */}
                                        {step === 3 && (<>
                                            <Controller name="degreeType" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>{t.fields.degree[l]}</FieldLabel>
                                                                <div className="grid grid-cols-3 gap-2.5">
                                                                    {DEGREE_TYPES.map(d => (
                                                                        <button key={d.value} type="button" onClick={() => field.onChange(d.value)}
                                                                                className={`p-4 rounded-xl border text-center transition-all duration-150
                                                                        ${field.value === d.value
                                                                                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                                                    : "border-border bg-muted/40 hover:bg-muted"}`}>
                                                                            <div className="text-2xl mb-1">{d.icon}</div>
                                                                            <div className="text-xs font-medium">{d.label[l]}</div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                            <Controller name="studyYear" control={form.control}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={!!fieldState.error}>
                                                                <FieldLabel>{t.fields.studyYear[l]}</FieldLabel>
                                                                <div className="flex gap-2">
                                                                    {[1,2,3,4,5,6].map(y => (
                                                                        <button key={y} type="button" onClick={() => field.onChange(y)}
                                                                                className={`w-11 h-11 rounded-lg border text-sm font-semibold transition-all duration-150
                                                                        ${field.value === y
                                                                                    ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                                                                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
                                                                            {y}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                            </Field>
                                                        )}
                                            />
                                        </>)}

                                        {/* Step 4 */}
                                        {step === 4 && (
                                            <Field data-invalid={!!form.formState.errors.languages}>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {LANGUAGES.map(lang => {
                                                        const selected = languages.includes(lang.value);
                                                        return (
                                                            <button key={lang.value} type="button" onClick={() => toggle("languages", lang.value)}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150
                                                                    ${selected
                                                                        ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                                                        : "border-border bg-muted/30 hover:bg-muted"}`}>
                                                                <span className="text-xl">{lang.flag}</span>
                                                                <span className="text-sm font-medium flex-1">{lang.label[l]}</span>
                                                                {selected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={3} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {form.formState.errors.languages && (
                                                    <FieldError>{form.formState.errors.languages.message}</FieldError>
                                                )}
                                            </Field>
                                        )}

                                        {/* Step 5 */}
                                        {step === 5 && (
                                            <Field data-invalid={!!form.formState.errors.interests}>
                                                <div className="flex flex-wrap gap-2">
                                                    {INTERESTS.map(item => {
                                                        const selected = interests.includes(item.value);
                                                        return (
                                                            <Badge key={item.value}
                                                                   variant={selected ? "default" : "outline"}
                                                                   className="cursor-pointer gap-1.5 py-2 px-3 text-sm hover:opacity-80 transition-opacity"
                                                                   onClick={() => toggle("interests", item.value)}>
                                                                <span>{item.icon}</span>
                                                                {item.label[l]}
                                                                {selected && <X className="w-3 h-3 ml-0.5" />}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                                {form.formState.errors.interests && (
                                                    <FieldError>{form.formState.errors.interests.message}</FieldError>
                                                )}
                                            </Field>
                                        )}

                                    </FieldGroup>
                                </motion.div>
                            </AnimatePresence>

                            <Separator className="my-8" />

                            <div className="flex items-center justify-between">
                                <Button type="button" variant="ghost" size="sm"
                                        onClick={goPrev} disabled={step === 1}
                                        className="gap-1.5 text-muted-foreground">
                                    <ChevronLeft className="w-4 h-4" />
                                    {t.nav.back[l]}
                                </Button>

                                {step < TOTAL ? (
                                    <Button type="button" onClick={goNext} className="gap-1.5">
                                        {t.nav.continue[l]}
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                                        {isSubmitting
                                            ? <><Loader2 className="w-4 h-4 animate-spin" />{t.nav.saving[l]}</>
                                            : <><Check className="w-4 h-4" strokeWidth={2.5} />{t.nav.submit[l]}</>
                                        }
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}