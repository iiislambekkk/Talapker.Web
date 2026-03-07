import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@workspace/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GrantCompetitionType } from "@/Data/models/Faculty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BarChart3 } from "lucide-react";
import {
    educationProgramQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/[educationProgramId]/_components/educationProgramQueryOptions";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid
} from 'recharts';

const labels = {
    generalCompetition: { kk: "Жалпы конкурс",      ru: "Общий конкурс",       en: "General Competition" },
    ruralCompetition:   { kk: "Ауыл конкурсы",       ru: "Сельский конкурс",    en: "Rural Competition"   },
    minScore:           { kk: "Мин. балл",            ru: "Мин. балл",           en: "Min score"           },
    grants:             { kk: "Грант",                ru: "Грантов",             en: "Grants"              },
    students:           { kk: "Студент",              ru: "Студентов",           en: "Students"            },
    score:              { kk: "Балл",                 ru: "Балл",                en: "Score"               },
    passingGeneral:     { kk: "Өту балы (жалпы)",     ru: "Проходные (общий)",   en: "Passing (general)"   },
    passingRural:       { kk: "Өту балы (ауыл)",      ru: "Проходные (сельский)",en: "Passing (rural)"     },
    belowPassing:       { kk: "Өту балынан төмен",    ru: "Ниже проходного",     en: "Below passing"       },
} as const;


const GrantStatisticDiagram = ({ educationProgramId, lang }: {
    educationProgramId: string;
    lang: "kk" | "ru" | "en";
}) => {
    const { data: program, status } = useQuery(educationProgramQueryOptions(educationProgramId));

    const t = (key: keyof typeof labels) => labels[key][lang];

    if (status === "pending") return <Skeleton className="h-48 w-full rounded-xl my-3" />;
    if (status === "error") return null;

    const generalStats = program.educationGroup?.grantCompetitionStatistics?.find(
        s => s.competitionType === GrantCompetitionType.General
    );
    const ruralStats = program.educationGroup?.grantCompetitionStatistics?.find(
        s => s.competitionType === GrantCompetitionType.Rural
    );

    if (!generalStats && !ruralStats) return null;

    const prepareChartData = (stats: typeof generalStats) => {
        if (!stats) return [];
        return stats.records
            .slice()
            .sort((a, b) => a.score - b.score)
            .map(record => ({
                score: record.score,
                frequency: record.frequency,
                isPassing: record.score >= stats.minScore
            }));
    };

    const generalData = prepareChartData(generalStats);
    const ruralData = prepareChartData(ruralStats);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-2 text-xs">
                    <p className="font-semibold">{t("score")}: {label}</p>
                    <p className="text-primary">
                        {t("students")}: <span className="font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CompetitionChart = ({
                                  data,
                                  stats,
                                  labelKey,
                                  passingColor,
                                  passingLegendKey,
                              }: {
        data: ReturnType<typeof prepareChartData>;
        stats: NonNullable<typeof generalStats>;
        labelKey: "generalCompetition" | "ruralCompetition";
        passingColor: string;
        passingLegendKey: "passingGeneral" | "passingRural";
    }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{t(labelKey)}</span>
                <div className="flex gap-3 text-muted-foreground">
                    <span>{t("minScore")}: <strong className="text-foreground">{stats.minScore}</strong></span>
                    <span>{t("grants")}: <strong className="text-foreground">{stats.totalGrants}</strong></span>
                </div>
            </div>
            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="score"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={{ stroke: "#cbd5e1" }}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            tickLine={false}
                            axisLine={false}
                            width={25}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="frequency" radius={[4, 4, 0, 0]} maxBarSize={30}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isPassing ? passingColor : "#94a3b8"}
                                    fillOpacity={entry.isPassing ? 0.8 : 0.4}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="my-3 p-4 rounded-xl border bg-card space-y-6 overflow-hidden">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">
                    {program.name[lang] || program.name.ru}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {generalStats && (
                    <CompetitionChart
                        data={generalData}
                        stats={generalStats}
                        labelKey="generalCompetition"
                        passingColor="#3b82f6"
                        passingLegendKey="passingGeneral"
                    />
                )}
                {ruralStats && (
                    <CompetitionChart
                        data={ruralData}
                        stats={ruralStats}
                        labelKey="ruralCompetition"
                        passingColor="#10b981"
                        passingLegendKey="passingRural"
                    />
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                {generalStats && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-80" />
                        <span>{t("passingGeneral")}</span>
                    </div>
                )}
                {ruralStats && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-500 rounded-sm opacity-80" />
                        <span>{t("passingRural")}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-slate-400 rounded-sm opacity-40" />
                    <span>{t("belowPassing")}</span>
                </div>
            </div>
        </div>
    );
};


// Parse custom tags out of markdown content before rendering
const parseContentBlocks = (content: string) => {
    const regex = /\{grantStatisticDiagram:([^}]+)\}/g;
    const blocks: Array<{ type: "markdown" | "grantDiagram"; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            blocks.push({ type: "markdown", content: content.slice(lastIndex, match.index) });
        }
        // @ts-ignore
        blocks.push({ type: "grantDiagram", content: match[1].trim() });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        blocks.push({ type: "markdown", content: content.slice(lastIndex) });
    }

    return blocks;
};

const MarkdownBlock = ({ content, isUser }: { content: string; isUser: boolean }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="my-2 ml-4 space-y-1 list-disc marker:text-primary/60">{children}</ul>,
            ol: ({ children }) => <ol className="my-2 ml-4 space-y-1 list-decimal marker:text-primary/60">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
            strong: ({ children }) => (
                <strong className={cn("font-semibold", isUser ? "text-primary-foreground" : "text-foreground")}>
                    {children}
                </strong>
            ),
            em: ({ children }) => <em className="italic opacity-90">{children}</em>,
            h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>,
            code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                return isBlock ? (
                    <code className={cn(
                        "block rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto",
                        isUser ? "bg-black/20 text-primary-foreground" : "bg-muted text-foreground"
                    )}>
                        {children}
                    </code>
                ) : (
                    <code className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-mono",
                        isUser ? "bg-black/20 text-primary-foreground" : "bg-muted text-foreground"
                    )}>
                        {children}
                    </code>
                );
            },
            pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-lg">{children}</pre>,
            hr: () => <hr className={cn("my-3 border-t", isUser ? "border-primary-foreground/20" : "border-border")} />,
            blockquote: ({ children }) => (
                <blockquote className={cn(
                    "my-2 pl-3 border-l-2 italic opacity-80",
                    isUser ? "border-primary-foreground/40" : "border-primary/40"
                )}>
                    {children}
                </blockquote>
            ),
            a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className={cn(
                    "underline underline-offset-2 transition-opacity hover:opacity-100",
                    isUser ? "opacity-80" : "text-primary opacity-90"
                )}>
                    {children}
                </a>
            ),
            table: ({ children }) => (
                <div className="my-2 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">{children}</table>
                </div>
            ),
            thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border-b border-border">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border-b border-border/50 last:border-0">{children}</td>,
        }}
    >
        {content}
    </ReactMarkdown>
);


const MessageContent = ({ content, isUser, lang }: { content: string; isUser: boolean; lang: "kk" | "ru" | "en" }) => {
    const blocks = parseContentBlocks(content);

    return (
        <div className={cn(
            "text-sm leading-relaxed break-words",
            isUser ? "text-primary-foreground" : "text-foreground"
        )}>
            {blocks.map((block, i) => {
                if (block.type === "grantDiagram") {
                    return <GrantStatisticDiagram key={i} educationProgramId={block.content} lang={lang} />;
                }
                return <MarkdownBlock key={i} content={block.content} isUser={isUser} />;
            })}
        </div>
    );
};

export default MessageContent;