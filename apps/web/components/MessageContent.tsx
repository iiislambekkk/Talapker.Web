"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BarChart3, Send, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { cn } from "@workspace/ui/lib/utils";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { EducationProgramDto } from "@/Data/models/Faculty";
import React from "react";

export enum GrantCompetitionType {
    General = "General",
    Rural   = "Rural",
    Profile = "Profile",
    Ped     = "Ped",
}

export enum GrantDegree {
    Bachelor    = "Bachelor",
    Magistracy  = "Magistracy",
    Philosopher = "Philosopher",
}

const labels = {
    generalCompetition:  { kk: "Жалпы конкурс",           ru: "Общий конкурс",              en: "General Competition"    },
    ruralCompetition:    { kk: "Ауыл конкурсы",            ru: "Сельский конкурс",           en: "Rural Competition"      },
    profileCompetition:  { kk: "Бейіндік магистратура",    ru: "Профильная магистратура",    en: "Profile Magistracy"     },
    pedCompetition:      { kk: "Ғылыми-пед. магистратура", ru: "Науч.-пед. магистратура",    en: "Pedagogical Magistracy" },
    minScore:            { kk: "Мин. балл",                ru: "Мин. балл",                  en: "Min score"              },
    grants:              { kk: "Грант",                    ru: "Грантов",                    en: "Grants"                 },
    students:            { kk: "Студент",                  ru: "Студентов",                  en: "Students"               },
    score:               { kk: "Балл",                     ru: "Балл",                       en: "Score"                  },
    allOvpo:             { kk: "Барлық ВУЗ",               ru: "Все ВУЗы",                   en: "All institutions"       },
    belowPassing:        { kk: "Өту балынан төмен",        ru: "Ниже проходного",            en: "Below passing"          },
    passing:             { kk: "Өту балынан жоғары",       ru: "Выше проходного",            en: "Above passing"          },
    noData:              { kk: "Деректер жоқ",             ru: "Нет данных",                 en: "No data"                },
} as const;

type Lang = "kk" | "ru" | "en";

const typeLabels: Record<GrantCompetitionType, keyof typeof labels> = {
    [GrantCompetitionType.General]: "generalCompetition",
    [GrantCompetitionType.Rural]:   "ruralCompetition",
    [GrantCompetitionType.Profile]: "profileCompetition",
    [GrantCompetitionType.Ped]:     "pedCompetition",
};

export const educationProgramByIdQueryOptions = (id: string) => queryOptions({
    queryKey: ["education-program", id],
    queryFn: async (): Promise<EducationProgramDto> => {
        const api = createApi("");
        const response = await api.get(`/api/education-programs/id/${id}`);
        logger.log(response.data);
        return response.data;
    },
    enabled: !!id,
});

const CustomTooltip = ({ active, payload, label, studentLabel }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
            <p className="font-semibold">{label}</p>
            <p className="text-primary">{studentLabel}: <span className="font-bold">{payload[0].value}</span></p>
        </div>
    );
};

const ScoreChart = ({
                        data, color, title, noDataLabel, studentLabel,
                    }: {
    data: { score: number; frequency: number; isPassing: boolean }[];
    color: string;
    title: string;
    noDataLabel: string;
    studentLabel: string;
}) => (
    <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        {data.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">{noDataLabel}</p>
        ) : (
            <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="score" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={25} />
                        <Tooltip content={<CustomTooltip studentLabel={studentLabel} />} />
                        <Bar dataKey="frequency" radius={[4, 4, 0, 0]} maxBarSize={30}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.isPassing ? color : "#94a3b8"} fillOpacity={entry.isPassing ? 0.8 : 0.4} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

const GrantStatisticDiagram = ({
                                   code, ovpo, institutionName, isMagistracy, lang,
                               }: {
    code: string; ovpo: string; institutionName: string; isMagistracy: boolean; lang: Lang;
}) => {
    const { data: program, status } = useQuery(educationProgramByIdQueryOptions(code));
    const t = (key: keyof typeof labels) => labels[key][lang];

    const competitionTypes = isMagistracy
        ? [GrantCompetitionType.Profile, GrantCompetitionType.Ped]
        : [GrantCompetitionType.General, GrantCompetitionType.Rural];

    const [selectedType, setSelectedType] = useState<GrantCompetitionType>(competitionTypes[0]!);

    if (status === "pending") return <Skeleton className="h-64 w-full rounded-xl my-3" />;
    if (status === "error") return null;
    if (!program?.educationGroup) return null;

    const degree = isMagistracy ? GrantDegree.Magistracy : GrantDegree.Bachelor;
    const currentStat = program.educationGroup.grantCompetitionStatistics.find(
        // @ts-ignore
        s => s.competitionType === selectedType && s.degree === degree
    );

    const allOvpoData = currentStat
        ? currentStat.frequencyRecords.slice().sort((a, b) => a.score - b.score)
            .map(r => ({ score: r.score, frequency: r.frequency, isPassing: r.score >= currentStat.minScore }))
        : [];

    const ovpoNum = parseInt(ovpo, 10);
    const ovpoData = currentStat
        ? currentStat.ovpoRecords.filter(r => r.ovpo === ovpoNum).slice().sort((a, b) => a.score - b.score)
            .map(r => ({ score: r.score, frequency: r.frequency, isPassing: r.score >= currentStat.minScore }))
        : [];

    return (
        <div className="my-3 p-4 rounded-xl border bg-card space-y-4 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">{program.name[lang] || program.name.ru}</p>
                        <p className="text-xs text-muted-foreground">{program.code}</p>
                    </div>
                </div>
                <Select value={selectedType} onValueChange={v => setSelectedType(v as GrantCompetitionType)}>
                    <SelectTrigger className="w-auto h-7 text-xs shrink-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {competitionTypes.map(type => (
                            <SelectItem key={type} value={type} className="text-xs">
                                {t(typeLabels[type])}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {currentStat && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{t("minScore")}: <strong className="text-foreground">{currentStat.minScore}</strong></span>
                    <span>{t("grants")}: <strong className="text-foreground">{currentStat.totalGrants}</strong></span>
                </div>
            )}
            <ScoreChart data={allOvpoData} color="#3b82f6" title={t("allOvpo")} noDataLabel={t("noData")} studentLabel={t("students")} />
            <ScoreChart data={ovpoData} color="#10b981" title={institutionName} noDataLabel={t("noData")} studentLabel={t("students")} />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm opacity-80 bg-blue-500" />
                    <span>{t("passing")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm opacity-40 bg-slate-400" />
                    <span>{t("belowPassing")}</span>
                </div>
            </div>
        </div>
    );
};

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldDef =
    | { type: "number"; id: string; label: string; min: number; max: number }
    | { type: "text";   id: string; label: string }
    | { type: "chips";  id: string; label: string; options: string[]; max: number }
    | { type: "select"; id: string; label: string; options: string[] };

interface ModalConfig {
    title: string;
    fields: FieldDef[];
    template: string;
}

interface SuggestionItem {
    text: string;
    kind: "send" | "prefill" | "modal";
    modalConfig?: ModalConfig;
}

// ── parseModalConfig ──────────────────────────────────────────────────────────

// Format: button_text|title|field1|field2|...|template
// field formats:
//   number:id:label:min-max
//   text:id:label
//   chips:id:label:opt1/opt2/opt3:max
//   select:id:label:opt1/opt2/opt3

const parseModalConfig = (raw: string): { btnText: string; config: ModalConfig } | null => {
    const parts = raw.split("|");
    if (parts.length < 3) return null;

    const btnText  = parts[0]!.trim();
    const title    = parts[1]!.trim();
    const template = parts[parts.length - 1]!.trim();
    const fieldParts = parts.slice(2, parts.length - 1);

    const fields: FieldDef[] = [];

    for (const fp of fieldParts) {
        const segs = fp.trim().split(":");
        const type = segs[0]?.trim();

        if (type === "number" && segs.length >= 4) {
            const [min, max] = (segs[3] ?? "0-140").split("-").map(Number);
            fields.push({ type: "number", id: segs[1]!.trim(), label: segs[2]!.trim(), min: min ?? 0, max: max ?? 140 });
        } else if (type === "text" && segs.length >= 3) {
            fields.push({ type: "text", id: segs[1]!.trim(), label: segs[2]!.trim() });
        } else if (type === "chips" && segs.length >= 4) {
            const options = segs[3]!.split("/").map(s => s.trim()).filter(Boolean);
            const max = parseInt(segs[4] ?? "99", 10);
            fields.push({ type: "chips", id: segs[1]!.trim(), label: segs[2]!.trim(), options, max });
        } else if (type === "select" && segs.length >= 4) {
            const options = segs[3]!.split("/").map(s => s.trim()).filter(Boolean);
            fields.push({ type: "select", id: segs[1]!.trim(), label: segs[2]!.trim(), options });
        }
    }

    if (fields.length === 0) return null;
    return { btnText, config: { title, fields, template } };
};

// ── DynamicModal ──────────────────────────────────────────────────────────────

const DynamicModal = ({
                          config, lang, onSend, onClose,
                      }: {
    config: ModalConfig;
    lang: Lang;
    onSend: (text: string) => void;
    onClose: () => void;
}) => {
    const [values, setValues] = useState<Record<string, string | string[]>>(() =>
        Object.fromEntries(config.fields.map(f => [f.id, f.type === "chips" ? [] : ""]))
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const clearError = (id: string) => setErrors(p => { const n = { ...p }; delete n[id]; return n; });

    const setStr = (id: string, val: string) => { setValues(p => ({ ...p, [id]: val })); clearError(id); };

    const toggleChip = (id: string, chip: string, max: number) => {
        const cur = values[id] as string[];
        if (cur.includes(chip)) {
            setValues(p => ({ ...p, [id]: cur.filter(x => x !== chip) }));
        } else if (cur.length < max) {
            setValues(p => ({ ...p, [id]: [...cur, chip] }));
        }
        clearError(id);
    };

    const handleSubmit = () => {
        const errs: Record<string, string> = {};
        const required = lang === "kk" ? "Міндетті" : lang === "en" ? "Required" : "Обязательно";

        for (const f of config.fields) {
            if (f.type === "number") {
                const n = parseInt(values[f.id] as string, 10);
                if (isNaN(n) || n < f.min || n > f.max) {
                    errs[f.id] = `${f.min}–${f.max}`;
                }
            } else if (f.type === "chips") {
                if ((values[f.id] as string[]).length === 0) errs[f.id] = required;
            } else {
                if (!(values[f.id] as string).trim()) errs[f.id] = required;
            }
        }

        if (Object.keys(errs).length) { setErrors(errs); return; }

        let msg = config.template;
        for (const f of config.fields) {
            const val = values[f.id];
            const str = Array.isArray(val) ? val.join(" и ") : String(val);
            msg = msg.replace(new RegExp(`\\{${f.id}\\}`, "g"), str);
        }

        onSend(msg);
        onClose();
    };

    const submitLabel = lang === "kk" ? "Жіберу" : lang === "en" ? "Submit" : "Отправить";
    const cancelLabel = lang === "kk" ? "Болдырмау" : lang === "en" ? "Cancel" : "Отмена";

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between">
                    <p className="font-semibold text-base text-foreground">{config.title}</p>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {config.fields.map(f => (
                    <div key={f.id} className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">{f.label}</label>

                        {f.type === "number" && (
                            <input
                                type="number"
                                min={f.min} max={f.max}
                                value={values[f.id] as string}
                                onChange={e => setStr(f.id, e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                placeholder={`${f.min}–${f.max}`}
                                className={cn(
                                    "w-full px-3 py-2.5 rounded-xl border bg-muted text-sm outline-none transition-colors",
                                    "placeholder:text-muted-foreground text-foreground focus:border-primary focus:bg-background",
                                    errors[f.id] ? "border-destructive" : "border-border"
                                )}
                            />
                        )}

                        {f.type === "text" && (
                            <input
                                type="text"
                                value={values[f.id] as string}
                                onChange={e => setStr(f.id, e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                className={cn(
                                    "w-full px-3 py-2.5 rounded-xl border bg-muted text-sm outline-none transition-colors",
                                    "placeholder:text-muted-foreground text-foreground focus:border-primary focus:bg-background",
                                    errors[f.id] ? "border-destructive" : "border-border"
                                )}
                            />
                        )}

                        {f.type === "select" && (
                            <Select value={values[f.id] as string} onValueChange={v => setStr(f.id, v)}>
                                <SelectTrigger className={cn("w-full", errors[f.id] ? "border-destructive" : "")}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {f.options.map(opt => (
                                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {f.type === "chips" && (
                            <div className="flex flex-wrap gap-1.5">
                                {f.options.map(opt => {
                                    const selected = (values[f.id] as string[]).includes(opt);
                                    const maxed = (values[f.id] as string[]).length >= f.max && !selected;
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => toggleChip(f.id, opt, f.max)}
                                            className={cn(
                                                "text-xs px-3 py-1.5 rounded-full border transition-all duration-150",
                                                selected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : maxed
                                                        ? "border-border/40 text-muted-foreground opacity-40 cursor-not-allowed"
                                                        : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {errors[f.id] && <p className="text-xs text-destructive">{errors[f.id]}</p>}
                    </div>
                ))}

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <Send className="w-3.5 h-3.5" />
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── SuggestionsBlock ──────────────────────────────────────────────────────────

interface SuggestionsBlockProps {
    items: SuggestionItem[];
    onSend: (text: string) => void;
    onPrefill: (text: string) => void;
    isStreaming: boolean;
    lang: Lang;
}

const SuggestionsBlock = ({ items, onSend, onPrefill, isStreaming, lang }: SuggestionsBlockProps) => {
    const [openConfig, setOpenConfig] = useState<ModalConfig | null>(null);

    if (!items.length || isStreaming) return null;

    return (
        <>
            <div className="flex flex-wrap gap-1.5 mt-2">
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (item.kind === "modal" && item.modalConfig) setOpenConfig(item.modalConfig);
                            else if (item.kind === "prefill") onPrefill(item.text);
                            else onSend(item.text);
                        }}
                        className={cn(
                            "text-xs px-3 py-1.5 rounded-full border text-primary",
                            "transition-colors cursor-pointer leading-tight text-left",
                            "border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary/60"
                        )}
                    >
                        {item.text}
                    </button>
                ))}
            </div>

            {openConfig && (
                <DynamicModal
                    config={openConfig}
                    lang={lang}
                    onSend={onSend}
                    onClose={() => setOpenConfig(null)}
                />
            )}
        </>
    );
};

// ── Parser ────────────────────────────────────────────────────────────────────

interface GrantDiagramMeta {
    code: string;
    ovpo: string;
    institutionName: string;
    isMagistracy: boolean;
}

type ContentBlock =
    | { type: "markdown";     content: string }
    | { type: "grantDiagram"; meta: GrantDiagramMeta }
    | { type: "suggestions";  items: SuggestionItem[] };

const parseContentBlocks = (content: string, ovpo: string, institutionName: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];

    type TokenGrant   = { kind: "grant";   code: string; isMagistracy: boolean; index: number; length: number };
    type TokenSuggest = { kind: "suggest"; item: SuggestionItem;                index: number; length: number };
    type Token = TokenGrant | TokenSuggest;

    const tokens: Token[] = [];

    // suggest-modal captures everything between | and ] as one segment via lazy match
    const re = /\[grantStatisticDiagram:([\w-]+)(?::magistracy)?\]|\[suggest-prefill:\s*([^\]]+)\]|\[suggest-modal:\s*([^\]]+)\]|\[suggest:\s*([^\]]+)\]/g;
    let m: RegExpExecArray | null;

    while ((m = re.exec(content)) !== null) {
        if (m[1] !== undefined) {
            tokens.push({
                kind: "grant",
                code: m[1].trim(),
                isMagistracy: m[0].includes(":magistracy]"),
                index: m.index,
                length: m[0].length,
            });
        } else if (m[2] !== undefined) {
            tokens.push({
                kind: "suggest",
                item: { text: m[2].trim(), kind: "prefill" },
                index: m.index,
                length: m[0].length,
            });
        } else if (m[3] !== undefined) {
            const parsed = parseModalConfig(m[3]);
            const item: SuggestionItem = parsed
                ? { text: parsed.btnText, kind: "modal", modalConfig: parsed.config }
                : { text: m[3].split("|")[0]?.trim() ?? m[3], kind: "send" };
            tokens.push({ kind: "suggest", item, index: m.index, length: m[0].length });
        } else if (m[4] !== undefined) {
            tokens.push({
                kind: "suggest",
                item: { text: m[4].trim(), kind: "send" },
                index: m.index,
                length: m[0].length,
            });
        }
    }

    tokens.sort((a, b) => a.index - b.index);

    let cursor = 0;
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i]!;

        if (token.index > cursor) {
            let textSlice = content.slice(cursor, token.index);
            if (token.kind === "suggest") textSlice = textSlice.replace(/\n?---\s*\n?$/, "").trimEnd();
            if (textSlice.trim()) blocks.push({ type: "markdown", content: textSlice });
        }

        if (token.kind === "grant") {
            blocks.push({
                type: "grantDiagram",
                meta: { code: token.code, ovpo, institutionName, isMagistracy: token.isMagistracy },
            });
            cursor = token.index + token.length;
            i++;
        } else {
            const items: SuggestionItem[] = [];
            let j = i;
            while (j < tokens.length && tokens[j]!.kind === "suggest") {
                items.push((tokens[j]! as TokenSuggest).item);
                j++;
            }
            blocks.push({ type: "suggestions", items });
            cursor = tokens[j - 1]!.index + tokens[j - 1]!.length;
            i = j;
        }
    }

    if (cursor < content.length) {
        const tail = content.slice(cursor).trim();
        if (tail) blocks.push({ type: "markdown", content: tail });
    }

    return blocks;
};

// ── MarkdownBlock ─────────────────────────────────────────────────────────────

const MarkdownBlock = ({ content, isUser }: { content: string; isUser: boolean }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            p:          ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            ul:         ({ children }) => <ul className="my-2 ml-4 space-y-1 list-disc marker:text-primary/60">{children}</ul>,
            ol:         ({ children }) => <ol className="my-2 ml-4 space-y-1 list-decimal marker:text-primary/60">{children}</ol>,
            li:         ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
            strong:     ({ children }) => <strong className={cn("font-semibold", isUser ? "text-primary-foreground" : "text-foreground")}>{children}</strong>,
            em:         ({ children }) => <em className="italic opacity-90">{children}</em>,
            h1:         ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
            h2:         ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
            h3:         ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
            pre:        ({ children }) => <pre className="my-2 overflow-x-auto rounded-lg">{children}</pre>,
            hr:         () => <hr className={cn("my-3 border-t", isUser ? "border-primary-foreground/20" : "border-border")} />,
            blockquote: ({ children }) => (
                <blockquote className={cn("my-2 pl-3 border-l-2 italic opacity-80", isUser ? "border-primary-foreground/40" : "border-primary/40")}>
                    {children}
                </blockquote>
            ),
            a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className={cn("underline underline-offset-2 transition-opacity hover:opacity-100", isUser ? "opacity-80" : "text-primary opacity-90")}>
                    {children}
                </a>
            ),
            code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                return isBlock ? (
                    <code className={cn("block rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto", isUser ? "bg-black/20 text-primary-foreground" : "bg-muted text-foreground")}>
                        {children}
                    </code>
                ) : (
                    <code className={cn("rounded px-1.5 py-0.5 text-xs font-mono", isUser ? "bg-black/20 text-primary-foreground" : "bg-muted text-foreground")}>
                        {children}
                    </code>
                );
            },
            table:  ({ children }) => <div className="my-2 overflow-x-auto rounded-lg border border-border"><table className="w-full text-xs">{children}</table></div>,
            thead:  ({ children }) => <thead className="bg-muted/50">{children}</thead>,
            th:     ({ children }) => <th className="px-3 py-2 text-left font-semibold border-b border-border">{children}</th>,
            td:     ({ children }) => <td className="px-3 py-2 border-b border-border/50 last:border-0">{children}</td>,
        }}
    >
        {content}
    </ReactMarkdown>
);

// ── MessageContent ────────────────────────────────────────────────────────────

interface MessageContentProps {
    content: string;
    isUser: boolean;
    lang: Lang;
    ovpo: string;
    institutionName: string;
    isStreaming?: boolean;
    onSuggestionClick?: (text: string) => void;
    onSuggestionPrefill?: (text: string) => void;
}

const MessageContent = ({
                            content, isUser, lang, ovpo, institutionName, isStreaming = false, onSuggestionClick, onSuggestionPrefill,
                        }: MessageContentProps) => {
    const blocks = parseContentBlocks(content, ovpo, institutionName);

    return (
        <div className={cn("text-sm leading-relaxed break-words", isUser ? "text-primary-foreground" : "text-foreground")}>
            {blocks.map((block, i) => {
                if (block.type === "grantDiagram") {
                    return (
                        <GrantStatisticDiagram
                            key={i}
                            code={block.meta.code}
                            ovpo={block.meta.ovpo}
                            institutionName={block.meta.institutionName}
                            isMagistracy={block.meta.isMagistracy}
                            lang={lang}
                        />
                    );
                }
                if (block.type === "suggestions") {
                    return (
                        <SuggestionsBlock
                            key={i}
                            items={block.items}
                            isStreaming={isStreaming}
                            lang={lang}
                            onSend={onSuggestionClick ?? (() => {})}
                            onPrefill={onSuggestionPrefill ?? onSuggestionClick ?? (() => {})}
                        />
                    );
                }
                return <MarkdownBlock key={i} content={block.content} isUser={isUser} />;
            })}
        </div>
    );
};

export default MessageContent;