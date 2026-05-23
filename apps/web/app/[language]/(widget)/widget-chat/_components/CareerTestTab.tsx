"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, ChevronRight, ChevronLeft, RotateCcw,
    Sparkles, CheckCircle2, Target, Zap, Star,
    ArrowRight, Trophy, Medal, Award, Briefcase
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
    CAREER_QUESTIONS, DIRECTIONS, scoreAnswers,
    type TestResult, type Direction
} from "./careerTestData";

type Lang = "ru" | "kk" | "en";

const STORAGE_KEY = "talapker_career_test_v2";

interface StoredTest {
    answers: number[];
    result: TestResult;
    completedAt: string;
    lang: Lang;
}

interface CareerTestTabProps {
    lang: Lang;
    institutionId: string;
    onGoToChat: (message: string) => void;
}

const i18n = {
    title:         { ru: "Профориентационный тест",       kk: "Кәсіптік бағдарлау тесті",      en: "Career Orientation Test" },
    subtitle:      { ru: "Метод Holland RIASEC · Научный подход", kk: "Holland RIASEC әдісі · Ғылыми тәсіл", en: "Holland RIASEC Method · Scientific Approach" },
    start:         { ru: "Начать тест",                   kk: "Тестті бастау",                  en: "Start test" },
    retake:        { ru: "Пройти заново",                 kk: "Қайта өту",                      en: "Retake test" },
    question:      { ru: "Вопрос",                        kk: "Сұрақ",                          en: "Question" },
    of:            { ru: "из",                            kk: "сынан",                          en: "of" },
    prev:          { ru: "Назад",                         kk: "Артқа",                          en: "Back" },
    next:          { ru: "Далее",                         kk: "Келесі",                         en: "Next" },
    finish:        { ru: "Завершить",                     kk: "Аяқтау",                         en: "Finish" },
    yourCode:      { ru: "Твой Holland Code",             kk: "Сенің Holland Code-ың",          en: "Your Holland Code" },
    topType:       { ru: "Ведущий тип",                   kk: "Жетекші тип",                    en: "Primary type" },
    also:          { ru: "Также выражены",                kk: "Сондай-ақ байқалады",            en: "Also expressed" },
    traits:        { ru: "Твои качества",                 kk: "Сенің қасиеттерің",              en: "Your traits" },
    careers:       { ru: "Подходящие профессии",          kk: "Сәйкес мамандықтар",            en: "Matching careers" },
    goToChat:      { ru: "Узнать подходящие специальности", kk: "Сәйкес мамандықтарды білу",   en: "Find matching specialties" },
    savedResult:   { ru: "Есть сохранённый результат",   kk: "Сақталған нәтиже бар",           en: "You have a saved result" },
    viewResult:    { ru: "Посмотреть",                    kk: "Қарау",                          en: "View" },
    questions:     { ru: "вопросов",                      kk: "сұрақ",                          en: "questions" },
    minutes:       { ru: "минут",                         kk: "минут",                          en: "minutes" },
    types:         { ru: "типов",                         kk: "тип",                            en: "types" },
    hollandAbout:  {
        ru: "Метод Холланда (RIASEC) — один из наиболее научно валидированных инструментов профориентации в мире. Используется в O*NET, Strong Interest Inventory и государственных системах 50+ стран.",
        kk: "Холланд әдісі (RIASEC) — әлемдегі ең ғылыми негізделген кәсіптік бағдарлау құралдарының бірі. O*NET, Strong Interest Inventory және 50+ елдің мемлекеттік жүйелерінде қолданылады.",
        en: "Holland's RIASEC method is one of the most scientifically validated career assessment tools in the world. Used in O*NET, Strong Interest Inventory, and government systems in 50+ countries.",
    },
    allScores:     { ru: "Все баллы по типам",            kk: "Барлық тип бойынша ұпайлар",    en: "Scores by type" },
} as const;

function tr(key: keyof typeof i18n, lang: Lang): string {
    return (i18n[key] as Record<Lang, string>)[lang] ?? (i18n[key] as Record<string, string>).ru;
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, max, color, delay, percent, typeId }: {
    label: string; score: number; max: number; color: string;
    delay: number; percent: number; typeId: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                        style={{ background: color }}
                    >
                        {typeId}
                    </span>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{percent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.9, delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

// ─── Direction mini-card (for 2nd and 3rd) ────────────────────────────────────

function MiniDirectionCard({ dir, lang, rank }: {
    dir: Direction & { score: number };
    lang: Lang;
    rank: 2 | 3;
}) {
    const Icon = rank === 2 ? Medal : Award;
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank === 2 ? 0.35 : 0.45 }}
            className="rounded-xl p-3 border flex items-center gap-3"
            style={{ borderColor: dir.color + "40", background: dir.color + "0a" }}
        >
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                style={{ background: dir.color + "20" }}
            >
                {dir.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                    {dir.label[lang] ?? dir.label.ru}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {dir.description[lang] ?? dir.description.ru}
                </p>
            </div>
            <Icon className="w-4 h-4 shrink-0" style={{ color: dir.color }} />
        </motion.div>
    );
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ result, lang, onRetake, onGoToChat }: {
    result: TestResult;
    lang: Lang;
    onRetake: () => void;
    onGoToChat: (msg: string) => void;
}) {
    const top = result.topDirection;
    const topLabel = top.label[lang] ?? top.label.ru;

    const chatMsg = {
        ru: `Я прошёл профориентационный тест по методу Холланда (RIASEC). Мой код: ${result.hollandCode}. Ведущий тип: «${topLabel}». Расскажи, какие специальности и программы в вашем вузе подойдут для этого профиля?`,
        kk: `Мен Холланд (RIASEC) әдісі бойынша кәсіптік бағдарлау тестінен өттім. Менің кодым: ${result.hollandCode}. Жетекші тип: «${topLabel}». Университетіңіздегі осы профильге сәйкес мамандықтар мен бағдарламалар туралы айтыңыз?`,
        en: `I completed a Holland RIASEC career assessment. My code: ${result.hollandCode}. Primary type: "${topLabel}". Which specialties and programs at your university would suit this profile?`,
    }[lang];

    const traits = top.traits[lang] ?? top.traits.ru;
    const careers = top.careers[lang] ?? top.careers.ru;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-6">

            {/* Holland Code badge */}
            <div className="text-center space-y-2 pt-2">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="mx-auto w-fit"
                >
                    <div className="flex items-center gap-1 bg-muted border border-border rounded-2xl px-4 py-2">
                        {result.hollandCode.split("").map((letter, i) => {
                            const dir = DIRECTIONS.find(d => d.id === letter);
                            return (
                                <span
                                    key={i}
                                    className="text-2xl font-black w-9 h-9 rounded-lg flex items-center justify-center text-white"
                                    style={{ background: dir?.color ?? "#888" }}
                                >
                                    {letter}
                                </span>
                            );
                        })}
                    </div>
                </motion.div>
                <p className="text-xs text-muted-foreground">{tr("yourCode", lang)}</p>
            </div>

            {/* Top direction card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-4 border-2"
                style={{ borderColor: top.color + "50", background: top.color + "10" }}
            >
                <div className="flex items-start gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: top.color + "25" }}
                    >
                        {top.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                            {tr("topType", lang)}
                        </p>
                        <p className="text-lg font-bold text-foreground leading-tight">
                            {topLabel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {top.description[lang] ?? top.description.ru}
                        </p>
                    </div>
                    <Trophy className="w-5 h-5 shrink-0 text-yellow-500 mt-0.5" />
                </div>

                {/* Traits */}
                <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">{tr("traits", lang)}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {traits.map((t, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="text-xs px-2 py-0.5 rounded-full border font-medium"
                                style={{
                                    borderColor: top.color + "50",
                                    color: top.color,
                                    background: top.color + "12",
                                }}
                            >
                                {t}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Careers */}
                <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs font-semibold text-foreground">{tr("careers", lang)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {careers.join(" · ")}
                    </p>
                </div>
            </motion.div>

            {/* 2nd and 3rd */}
            <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground px-0.5">{tr("also", lang)}</p>
                <MiniDirectionCard dir={result.secondDirection} lang={lang} rank={2} />
                <MiniDirectionCard dir={result.thirdDirection} lang={lang} rank={3} />
            </div>

            {/* All scores */}
            <div className="space-y-2.5 pt-1">
                <p className="text-xs font-semibold text-muted-foreground">{tr("allScores", lang)}</p>
                {result.scores.map((s, i) => (
                    <ScoreBar
                        key={s.id}
                        typeId={s.id}
                        label={s.label[lang] ?? s.label.ru}
                        score={s.score}
                        max={s.max}
                        color={s.color}
                        percent={s.percent}
                        delay={0.4 + i * 0.07}
                    />
                ))}
            </div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="space-y-2 pt-1"
            >
                <Button
                    onClick={() => onGoToChat(chatMsg)}
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                >
                    <Sparkles className="w-4 h-4" />
                    {tr("goToChat", lang)}
                    <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetake}
                    className="w-full gap-2 text-muted-foreground"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {tr("retake", lang)}
                </Button>
            </motion.div>
        </motion.div>
    );
}

// ─── Question screen with auto-advance ────────────────────────────────────────

function QuestionScreen({ question, answer, onAnswer, onPrev, current, total, lang }: {
    question: typeof CAREER_QUESTIONS[0];
    answer: number | null;
    onAnswer: (idx: number) => void;
    onPrev: () => void;
    current: number;
    total: number;
    lang: Lang;
}) {
    const isLast = current === total - 1;
    const progress = ((current + 1) / total) * 100;

    return (
        <motion.div
            key={current}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
        >
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                        {tr("question", lang)} {current + 1} {tr("of", lang)} {total}
                    </span>
                    <span className="text-xs font-mono text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.35 }}
                    />
                </div>
            </div>

            <p className="text-base font-semibold text-foreground leading-snug py-1">
                {question.text[lang] ?? question.text.ru}
            </p>

            <div className="space-y-2">
                {question.options.map((opt, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.055 }}
                        onClick={() => onAnswer(i)}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200",
                            answer === i
                                ? "border-primary bg-primary/10 text-foreground font-medium shadow-sm"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                answer === i ? "border-primary bg-primary" : "border-muted-foreground/40"
                            )}>
                                {answer === i && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-white"
                                    />
                                )}
                            </div>
                            <span>{opt.text[lang] ?? opt.text.ru}</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Navigation buttons - always show back button when not on first question */}
            <div className="flex gap-2 pt-1">
                {current > 0 && (
                    <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
                        <ChevronLeft className="w-4 h-4" />
                        {tr("prev", lang)}
                    </Button>
                )}
                <div className="flex-1" />
                {isLast && answer !== null && (
                    <Button
                        size="sm"
                        onClick={onPrev}
                        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {tr("finish", lang)}
                    </Button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Start screen ─────────────────────────────────────────────────────────────

function StartScreen({ lang, onStart, saved, onViewSaved }: {
    lang: Lang;
    onStart: () => void;
    saved: StoredTest | null;
    onViewSaved: () => void;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 py-2">

            <div className="text-center space-y-3">
                <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"
                >
                    <Brain className="w-10 h-10 text-primary" />
                </motion.div>
                <div>
                    <h3 className="text-xl font-bold text-foreground">{tr("title", lang)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tr("subtitle", lang)}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { icon: <Target className="w-4 h-4" />, value: `${CAREER_QUESTIONS.length}`, label: tr("questions", lang) },
                    { icon: <Zap className="w-4 h-4" />,    value: "10–15",                     label: tr("minutes", lang) },
                    { icon: <Star className="w-4 h-4" />,   value: `${DIRECTIONS.length}`,      label: tr("types", lang) },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        className="rounded-xl bg-muted/50 border border-border p-3 text-center"
                    >
                        <div className="text-primary mx-auto w-fit mb-1">{stat.icon}</div>
                        <div className="text-lg font-bold text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* RIASEC types preview */}
            <div className="space-y-1.5">
                {DIRECTIONS.map((dir, i) => (
                    <motion.div
                        key={dir.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.055 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30 border border-border/50"
                    >
                        <span
                            className="text-xs font-black w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                            style={{ background: dir.color }}
                        >
                            {dir.id}
                        </span>
                        <span className="text-lg">{dir.emoji}</span>
                        <p className="text-sm font-medium text-foreground flex-1 truncate">
                            {dir.label[lang] ?? dir.label.ru}
                        </p>
                        <p className="text-xs text-muted-foreground truncate hidden sm:block max-w-[120px]">
                            {dir.description[lang] ?? dir.description.ru}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Holland about */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl bg-muted/30 border border-border/50 px-4 py-3"
            >
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {tr("hollandAbout", lang)}
                </p>
            </motion.div>

            {/* Saved result */}
            {saved && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 flex items-center gap-3"
                >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium">{tr("savedResult", lang)}</p>
                        <p className="text-[10px] text-muted-foreground">{saved.completedAt}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onViewSaved} className="text-xs h-7 px-2 shrink-0">
                        {tr("viewResult", lang)}
                    </Button>
                </motion.div>
            )}

            <Button
                onClick={onStart}
                size="lg"
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
                {saved ? tr("retake", lang) : tr("start", lang)}
                <ChevronRight className="w-4 h-4" />
            </Button>
        </motion.div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Phase = "start" | "test" | "results";

export function CareerTestTab({ lang, institutionId, onGoToChat }: CareerTestTabProps) {
    const [phase, setPhase]     = useState<Phase>("start");
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(
        () => new Array(CAREER_QUESTIONS.length).fill(null)
    );
    const [result, setResult]   = useState<TestResult | null>(null);

    const [saved, setSaved] = useState<StoredTest | null>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as StoredTest) : null;
        } catch { return null; }
    });

    const handleStart = useCallback(() => {
        setAnswers(new Array(CAREER_QUESTIONS.length).fill(null));
        setCurrentQ(0);
        setPhase("test");
    }, []);

    const handleViewSaved = useCallback(() => {
        if (!saved) return;
        setResult(saved.result);
        setPhase("results");
    }, [saved]);

    const handleAnswer = useCallback((idx: number) => {
        // Save the answer
        setAnswers(prev => {
            const n = [...prev];
            n[currentQ] = idx;
            return n;
        });

        // Auto-advance to next question or finish if last
        if (currentQ === CAREER_QUESTIONS.length - 1) {
            // Last question - finish the test
            setTimeout(() => {
                const finalAnswers = [...answers];
                finalAnswers[currentQ] = idx;
                const res = scoreAnswers(finalAnswers as number[]);
                setResult(res);
                setPhase("results");

                const stored: StoredTest = {
                    answers: finalAnswers as number[],
                    result: res,
                    completedAt: new Date().toLocaleDateString(
                        lang === "ru" ? "ru-RU" : lang === "kk" ? "kk-KZ" : "en-US",
                        { day: "numeric", month: "long", year: "numeric" }
                    ),
                    lang,
                };
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); setSaved(stored); }
                catch {}
            }, 150); // Small delay for better UX
        } else {
            // Move to next question
            setTimeout(() => {
                setCurrentQ(q => q + 1);
            }, 150);
        }
    }, [currentQ, answers, lang]);

    const handlePrev = useCallback(() => {
        if (currentQ > 0) {
            setCurrentQ(q => q - 1);
        }
    }, [currentQ]);

    const handleRetake = useCallback(() => {
        setPhase("start");
        setResult(null);
    }, []);

    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="p-4 max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {phase === "start" && (
                        <motion.div key="start" exit={{ opacity: 0 }}>
                            <StartScreen lang={lang} onStart={handleStart} saved={saved} onViewSaved={handleViewSaved} />
                        </motion.div>
                    )}
                    {phase === "test" && (
                        <QuestionScreen
                            key={`q-${currentQ}`}
                            question={CAREER_QUESTIONS[currentQ]!}
                            answer={answers[currentQ] ?? null}
                            onAnswer={handleAnswer}
                            onPrev={handlePrev}
                            current={currentQ}
                            total={CAREER_QUESTIONS.length}
                            lang={lang}
                        />
                    )}
                    {phase === "results" && result && (
                        <motion.div key="results" exit={{ opacity: 0 }}>
                            <ResultsScreen result={result} lang={lang} onRetake={handleRetake} onGoToChat={onGoToChat} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}