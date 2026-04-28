import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { cn } from "@workspace/ui/lib/utils";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import {EducationProgramDto} from "@/Data/models/Faculty";
import React from "react";

// ── Enums (строковые значения совпадают с API) ─────────────────────────────────

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

// ── Labels ────────────────────────────────────────────────────────────────────

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

// ── Query ─────────────────────────────────────────────────────────────────────

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

// ── Tooltip ───────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, studentLabel }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
            <p className="font-semibold">{label}</p>
            <p className="text-primary">{studentLabel}: <span className="font-bold">{payload[0].value}</span></p>
        </div>
    );
};

// ── ScoreChart ────────────────────────────────────────────────────────────────

const ScoreChart = ({
                        data,
                        color,
                        title,
                        noDataLabel,
                        studentLabel,
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

// ── GrantStatisticDiagram ─────────────────────────────────────────────────────

const GrantStatisticDiagram = ({
                                   code,
                                   ovpo,
                                   institutionName,
                                   isMagistracy,
                                   lang,
                               }: {
    code: string;
    ovpo: string;
    institutionName: string;
    isMagistracy: boolean;
    lang: Lang;
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
        ? currentStat.frequencyRecords
            .slice()
            .sort((a, b) => a.score - b.score)
            .map(r => ({ score: r.score, frequency: r.frequency, isPassing: r.score >= currentStat.minScore }))
        : [];

    const ovpoNum = parseInt(ovpo, 10);
    const ovpoData = currentStat
        ? currentStat.ovpoRecords
            .filter(r => r.ovpo === ovpoNum)
            .slice()
            .sort((a, b) => a.score - b.score)
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
                <Select
                    value={selectedType}
                    onValueChange={v => setSelectedType(v as GrantCompetitionType)}
                >
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

            <ScoreChart
                data={allOvpoData}
                color="#3b82f6"
                title={t("allOvpo")}
                noDataLabel={t("noData")}
                studentLabel={t("students")}
            />

            <ScoreChart
                data={ovpoData}
                color="#10b981"
                title={institutionName}
                noDataLabel={t("noData")}
                studentLabel={t("students")}
            />

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

// ── Parser ────────────────────────────────────────────────────────────────────

interface GrantDiagramMeta {
    code: string;
    ovpo: string;
    institutionName: string;
    isMagistracy: boolean;
}

type ContentBlock =
    | { type: "markdown"; content: string }
    | { type: "grantDiagram"; meta: GrantDiagramMeta };

const parseContentBlocks = (content: string): ContentBlock[] => {
    const regex = /\[grantStatisticDiagram:([\w-]+):(\d+):([^\]]+?)(?::magistracy)?\]/g;
    const blocks: ContentBlock[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            blocks.push({ type: "markdown", content: content.slice(lastIndex, match.index) });
        }
        blocks.push({
            type: "grantDiagram",
            meta: {
                code: match[1]!.trim(),
                ovpo: match[2]!.trim(),
                institutionName: match[3]!.trim(),
                isMagistracy: match[0]!.includes(":magistracy]"),
            },
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        blocks.push({ type: "markdown", content: content.slice(lastIndex) });
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

const MessageContent = ({ content, isUser, lang }: { content: string; isUser: boolean; lang: Lang }) => {
    const blocks = parseContentBlocks(content);

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
                return <MarkdownBlock key={i} content={block.content} isUser={isUser} />;
            })}
        </div>
    );
};

export default MessageContent;