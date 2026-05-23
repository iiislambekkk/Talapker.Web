"use client";

import React, { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Upload, FileText, Trash2, Plus, Brain,
    Tag, ChevronRight, ChevronLeft, Edit3, CheckCircle,
    XCircle, Clock, Sparkles, AlertCircle, RefreshCw,
    FolderOpen, PenLine, MessageSquare, Send, Loader2,
    Bot, User, CornerDownRight, ImageIcon
} from "lucide-react";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { useLang } from "@/hooks/useLang";
import { DrawerForm } from "@/components/DrawerForm";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
    useKnowledgeHub
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/ai/knowledge-base/_components/useKnowledgeHub";
import {env} from "@/lib/env";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ru" | "kk" | "en";

type KnowledgeFileDto = {
    id: string;
    fileName: string;
    storageKey: string;
    status: "Pending" | "Processing" | "Processed" | "Failed";
    errorMessage: string | null;
    uploadedAt: string;
    processedAt: string | null;
    entriesCount: number;
    textContent: string | null;
};

type KnowledgeEntryDto = {
    id: string;
    sourceFileId: string | null;
    sourceFileName: string | null;
    sourceFileKey: string | null;
    question: string;
    answer: string;
    tags: string[];
    createdAt: string;
    updatedAt: string | null;
};

type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
};

type AskResult = {
    answer: string;
    sources: { fileName: string; fileKey: string; matchedQuestion: string }[];
};

// ─── i18n ─────────────────────────────────────────────────────────────────────

const t = {
    title:             { ru: "База знаний",                          kk: "Білім базасы",                      en: "Knowledge Base"                     },
    subtitle:          { ru: "Документы и Q&A для AI-бота",          kk: "AI-бот үшін құжаттар мен Q&A",      en: "Documents and Q&A for AI bot"       },
    files:             { ru: "Документы",                            kk: "Құжаттар",                          en: "Documents"                          },
    entries:           { ru: "Q&A база",                             kk: "Q&A базасы",                        en: "Q&A Pairs"                          },
    uploadFile:        { ru: "Загрузить документ",                   kk: "Құжат жүктеу",                      en: "Upload Document"                    },
    addEntry:          { ru: "Добавить вручную",                     kk: "Қолмен қосу",                       en: "Add Manually"                       },
    question:          { ru: "Вопрос",                               kk: "Сұрақ",                             en: "Question"                           },
    answer:            { ru: "Ответ",                                kk: "Жауап",                             en: "Answer"                             },
    tags:              { ru: "Теги (через запятую)",                 kk: "Тегтер (үтірмен)",                  en: "Tags (comma separated)"             },
    save:              { ru: "Сохранить",                            kk: "Сақтау",                            en: "Save"                               },
    saving:            { ru: "Сохранение...",                        kk: "Сақталуда...",                      en: "Saving..."                          },
    cancel:            { ru: "Отмена",                               kk: "Болдырмау",                         en: "Cancel"                             },
    delete:            { ru: "Удалить",                              kk: "Жою",                               en: "Delete"                             },
    edit:              { ru: "Редактировать",                        kk: "Өңдеу",                             en: "Edit"                               },
    noFiles:           { ru: "Документов пока нет",                  kk: "Құжаттар әлі жоқ",                  en: "No documents yet"                   },
    noEntries:         { ru: "Q&A пар пока нет",                     kk: "Q&A жұптары әлі жоқ",               en: "No Q&A pairs yet"                   },
    noFilesDesc:       { ru: "Загрузите PDF или Word — AI автоматически создаст Q&A пары", kk: "PDF немесе Word жүктеңіз — AI автоматты Q&A жасайды", en: "Upload PDF or Word — AI will auto-generate Q&A pairs" },
    noEntriesDesc:     { ru: "Добавьте вопросы вручную или загрузите документ", kk: "Сұрақтарды қолмен қосыңыз немесе құжат жүктеңіз", en: "Add questions manually or upload a document" },
    uploadDesc:        { ru: "AI прочитает документ и создаст Q&A пары автоматически", kk: "AI құжатты оқып Q&A жұптарын автоматты жасайды", en: "AI will read and auto-generate Q&A pairs" },
    chooseFile:        { ru: "Выберите файл",                        kk: "Файл таңдаңыз",                     en: "Choose file"                        },
    uploading:         { ru: "Загрузка...",                          kk: "Жүктелуде...",                      en: "Uploading..."                       },
    uploadSuccess:     { ru: "Документ загружен, обрабатывается",    kk: "Құжат жүктелді, өңделуде",          en: "Uploaded, processing..."            },
    deleteSuccess:     { ru: "Удалено",                              kk: "Жойылды",                           en: "Deleted"                            },
    saveSuccess:       { ru: "Сохранено",                            kk: "Сақталды",                          en: "Saved"                              },
    addSuccess:        { ru: "Q&A пара добавлена",                   kk: "Q&A жұбы қосылды",                  en: "Q&A pair added"                     },
    statusPending:     { ru: "Ожидает",                              kk: "Күтуде",                            en: "Pending"                            },
    statusProcessing:  { ru: "Обрабатывается",                       kk: "Өңделуде",                          en: "Processing"                         },
    statusProcessed:   { ru: "Готово",                               kk: "Дайын",                             en: "Processed"                          },
    statusFailed:      { ru: "Ошибка",                               kk: "Қате",                              en: "Failed"                             },
    pairs:             { ru: "пар",                                  kk: "жұп",                               en: "pairs"                              },
    allFiles:          { ru: "Все источники",                        kk: "Барлық дереккөздер",                en: "All sources"                        },
    manual:            { ru: "Только ручные",                        kk: "Тек қолмен",                        en: "Manual only"                        },
    tab_files:         { ru: "Документы",                            kk: "Құжаттар",                          en: "Documents"                          },
    tab_entries:       { ru: "Q&A пары",                             kk: "Q&A жұптары",                       en: "Q&A Pairs"                          },
    tab_ask:           { ru: "Спросить AI",                          kk: "AI-дан сұрау",                      en: "Ask AI"                             },
    askPlaceholder:    { ru: "Задайте вопрос по базе знаний...",      kk: "Білім базасынан сұрақ қойыңыз...",  en: "Ask a question from the knowledge base..." },
    askButton:         { ru: "Спросить",                             kk: "Сұрау",                             en: "Ask"                                },
    asking:            { ru: "Думаю...",                             kk: "Ойлануда...",                       en: "Thinking..."                        },
    askTitle:          { ru: "AI-ассистент по базе знаний",          kk: "Білім базасы AI-ассистенті",        en: "Knowledge Base AI Assistant"        },
    askDesc:           { ru: "Задайте вопрос — AI найдёт ответ в загруженных документах", kk: "Сұрақ қойыңыз — AI жүктелген құжаттардан жауап табады", en: "Ask a question — AI will find answers in your documents" },
    sources:           { ru: "Источники",                            kk: "Дереккөздер",                       en: "Sources"                            },
    noAnswer:          { ru: "Задайте первый вопрос",                kk: "Алғашқы сұрақты қойыңыз",           en: "Ask your first question"            },
    noAnswerDesc:      { ru: "AI ответит на основе загруженных документов и Q&A пар", kk: "AI жүктелген құжаттар мен Q&A жұптары негізінде жауап береді", en: "AI will answer based on your documents and Q&A pairs" },
    manualBadge:       { ru: "Вручную",                              kk: "Қолмен",                            en: "Manual"                             },
    orAddContext:      { ru: "или добавьте контекст",                kk: "немесе контекст қосыңыз",           en: "or add context"                     },
    orPasteText:       { ru: "или вставьте текст напрямую",          kk: "немесе тікелей мәтін қойыңыз",      en: "or paste text directly"             },
    additionalContext: { ru: "Дополнительный контекст",              kk: "Қосымша контекст",                  en: "Additional context"                 },
    additionalContextPlaceholder: { ru: "Уточнения, примечания к документу...", kk: "Құжатқа түсініктемелер...", en: "Notes or clarifications for the document..." },
    additionalContextHint: { ru: "AI учтёт этот текст при создании Q&A пар", kk: "AI бұл мәтінді Q&A жасауда ескереді", en: "AI will use this when generating Q&A pairs" },
    pasteText:         { ru: "Вставьте текст",                       kk: "Мәтін қойыңыз",                     en: "Paste text"                         },
    pasteTextPlaceholder: { ru: "Вставьте текст документа, правила, FAQ...", kk: "Құжат мәтінін, ережелерді қойыңыз...", en: "Paste document text, rules, FAQ..." },
    pasteTextHint:     { ru: "Файл не обязателен — можно добавить только текст", kk: "Файл міндетті емес — тек мәтін қосуға болады", en: "File is optional — text alone is enough" },
    fileName:          { ru: "Название документа",                   kk: "Құжат атауы",                       en: "Document name"                      },
    fileNameHint:      { ru: "Как этот документ будет отображаться в базе знаний", kk: "Бұл құжат білім базасында қалай көрсетіледі", en: "How this document appears in the knowledge base" },
    textContent:       { ru: "Текстовый контекст",                   kk: "Мәтіндік контекст",                 en: "Text context"                       },
    hideText:          { ru: "Скрыть текст",                         kk: "Мәтінді жасыру",                    en: "Hide text"                          },
    showText:          { ru: "Показать текст",                       kk: "Мәтінді көрсету",                   en: "Show text"                          },
} as const;

// ─── Query helpers ────────────────────────────────────────────────────────────

const filesQuery = (institutionId: string, token: string) => ({
    queryKey: ["knowledge-files", institutionId],
    queryFn: async (): Promise<KnowledgeFileDto[]> => {
        const api = createApi(token);
        const res = await api.get(`/institutions/${institutionId}/knowledge/files`);
        return res.data;
    },
});

const entriesQuery = (
    institutionId: string,
    token: string,
    fileId: string | null,
    manualOnly: boolean,
    tag: string,
    page: number
) => ({
    queryKey: ["knowledge-entries", institutionId, fileId, manualOnly, tag, page],
    queryFn: async (): Promise<PagedResult<KnowledgeEntryDto>> => {
        const api = createApi(token);
        const params: Record<string, any> = { page, pageSize: 15 };
        if (manualOnly) params.manualOnly = true;
        else if (fileId) params.fileId = fileId;
        if (tag) params.tag = tag;
        const res = await api.get(`/institutions/${institutionId}/knowledge/entries`, { params });
        return res.data;
    },
});

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
    const { institutionId } = useParams() as { institutionId: string };
    const { data: session } = useSession();
    const [lang] = useLang();
    const l: Lang = (lang as Lang) in t.title ? (lang as Lang) : "en";
    const token = session?.accessToken ?? "";

    useKnowledgeHub(institutionId, token);

    const [tab, setTab] = useState<"files" | "entries" | "ask">("files");
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [manualOnly, setManualOnly] = useState(false);
    const [tagFilter, setTagFilter] = useState("");
    const [page, setPage] = useState(1);

    const { data: files, status: filesStatus } = useQuery(filesQuery(institutionId, token));
    const { data: entriesPage, status: entriesStatus } = useQuery(
        entriesQuery(institutionId, token, selectedFileId, manualOnly, tagFilter, page)
    );

    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["knowledge-files", institutionId] });
        qc.invalidateQueries({ queryKey: ["knowledge-entries", institutionId] });
    };

    const tabs = [
        { key: "files" as const,   label: t.tab_files[l],   count: files?.length },
        { key: "entries" as const, label: t.tab_entries[l], count: entriesPage?.totalCount },
        { key: "ask" as const,     label: t.tab_ask[l],     count: undefined },
    ];

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t.title[l]}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t.subtitle[l]}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <UploadFileForm institutionId={institutionId} token={token} l={l} onSuccess={invalidate} userId={session?.user.sub ?? ""} />
                    <AddEntryForm institutionId={institutionId} token={token} l={l} onSuccess={invalidate} />
                </div>
            </div>

            <StatsBar files={files ?? []} entriesTotal={entriesPage?.totalCount ?? 0} l={l} />

            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            tab === key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {label}
                        {count !== undefined && (
                            <span className="text-xs bg-muted-foreground/20 rounded-full px-1.5 py-0.5 leading-none">
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === "files" && (
                    <motion.div key="files" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <FilesTab
                            files={files ?? []}
                            status={filesStatus}
                            institutionId={institutionId}
                            token={token}
                            l={l}
                            onSelectFile={(id) => { setSelectedFileId(id); setManualOnly(false); setTab("entries"); setPage(1); }}
                            onDelete={invalidate}
                        />
                    </motion.div>
                )}
                {tab === "entries" && (
                    <motion.div key="entries" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <EntriesTab
                            entriesPage={entriesPage ?? null}
                            status={entriesStatus}
                            files={files ?? []}
                            institutionId={institutionId}
                            token={token}
                            l={l}
                            selectedFileId={selectedFileId}
                            manualOnly={manualOnly}
                            tagFilter={tagFilter}
                            page={page}
                            onFileFilter={(id, manual) => { setSelectedFileId(id); setManualOnly(manual); setPage(1); }}
                            onTagFilter={(tag) => { setTagFilter(tag); setPage(1); }}
                            onPageChange={setPage}
                            onMutate={invalidate}
                        />
                    </motion.div>
                )}
                {tab === "ask" && (
                    <motion.div key="ask" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        <AskTab institutionId={institutionId} token={token} l={l} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ files, entriesTotal, l }: { files: KnowledgeFileDto[]; entriesTotal: number; l: Lang }) => {
    const processed  = files.filter(f => f.status === "Processed").length;
    const processing = files.filter(f => f.status === "Processing" || f.status === "Pending").length;

    const stats = [
        { icon: <FileText className="w-4 h-4" />,   value: files.length, label: t.tab_files[l],        color: "text-blue-500",    bg: "bg-blue-500/10"    },
        { icon: <Brain className="w-4 h-4" />,       value: entriesTotal, label: t.tab_entries[l],      color: "text-violet-500",  bg: "bg-violet-500/10"  },
        { icon: <CheckCircle className="w-4 h-4" />, value: processed,    label: t.statusProcessed[l],  color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: <RefreshCw className="w-4 h-4" />,   value: processing,   label: t.statusProcessing[l], color: "text-amber-500",   bg: "bg-amber-500/10"   },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
                <Card key={i} className="border-0 bg-muted/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
                        <div>
                            <p className="text-2xl font-bold leading-none">{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// ─── Files tab ────────────────────────────────────────────────────────────────

const FilesTab = ({ files, status, institutionId, token, l, onSelectFile, onDelete }: {
    files: KnowledgeFileDto[]; status: string; institutionId: string; token: string; l: Lang;
    onSelectFile: (id: string) => void; onDelete: () => void;
}) => {
    if (status === "pending") return (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
    );

    if (!files.length) return (
        <Card className="border-dashed border-2">
            <CardContent className="p-16 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-muted rounded-2xl"><FolderOpen className="w-10 h-10 text-muted-foreground" /></div>
                <div>
                    <h3 className="text-lg font-semibold">{t.noFiles[l]}</h3>
                    <p className="text-muted-foreground mt-1 text-sm max-w-sm">{t.noFilesDesc[l]}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-2">
            {files.map(file => (
                <FileRow key={file.id} file={file} institutionId={institutionId} token={token} l={l} onViewEntries={() => onSelectFile(file.id)} onDelete={onDelete} />
            ))}
        </div>
    );
};

const statusConfig = (l: Lang) => ({
    Pending:    { label: t.statusPending[l],    icon: <Clock className="w-3 h-3" />,                  variant: "secondary" as const   },
    Processing: { label: t.statusProcessing[l], icon: <RefreshCw className="w-3 h-3 animate-spin" />, variant: "secondary" as const   },
    Processed:  { label: t.statusProcessed[l],  icon: <CheckCircle className="w-3 h-3" />,            variant: "default" as const     },
    Failed:     { label: t.statusFailed[l],     icon: <XCircle className="w-3 h-3" />,                variant: "destructive" as const },
});

const FileRow = ({ file, institutionId, token, l, onViewEntries, onDelete }: {
    file: KnowledgeFileDto; institutionId: string; token: string; l: Lang;
    onViewEntries: () => void; onDelete: () => void;
}) => {
    const [deleting, startDeleting] = useTransition();
    const [textExpanded, setTextExpanded] = useState(false);
    const cfg = statusConfig(l)[file.status];

    const handleDelete = () => startDeleting(async () => {
        try {
            await createApi(token).delete(`/institutions/${institutionId}/knowledge/files/${file.id}`);
            toast.success(t.deleteSuccess[l]);
            onDelete();
        } catch (e) { logger.error("[FileRow] delete", e); }
    });

    return (
        <Card className="border-0 bg-card hover:bg-accent/20 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">{file.fileName}</span>
                            <Badge variant={cfg.variant} className="gap-1 text-xs shrink-0 h-5">
                                {cfg.icon}{cfg.label}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            {file.status === "Processed" && (
                                <span className="flex items-center gap-1">
                                    <Brain className="w-3 h-3" />{file.entriesCount} {t.pairs[l]}
                                </span>
                            )}
                            {file.textContent && (
                                <button
                                    onClick={() => setTextExpanded(v => !v)}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    <PenLine className="w-3 h-3" />
                                    {textExpanded ? t.hideText[l] : t.showText[l]}
                                </button>
                            )}
                            {file.errorMessage && (
                                <span className="text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{file.errorMessage}
                                </span>
                            )}

                            {file.storageKey && (
                                <a target={"_blank"} href={env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL + "/" + file.storageKey}><span className={"hover:text-blue-700!"}>Скачать</span></a>
                            )}
                        </div>

                        <AnimatePresence>
                            {textExpanded && file.textContent && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-2.5 text-sm text-muted-foreground leading-relaxed border-l-2 border-blue-500/30 pl-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                        {file.textContent}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {file.status === "Processed" && file.entriesCount > 0 && (
                            <Button size="sm" variant="ghost" onClick={onViewEntries} className="text-xs gap-1 h-8">
                                Q&A <ChevronRight className="w-3 h-3" />
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Entries tab ──────────────────────────────────────────────────────────────

const EntriesTab = ({ entriesPage, status, files, institutionId, token, l,
                        selectedFileId, manualOnly, tagFilter, page,
                        onFileFilter, onTagFilter, onPageChange, onMutate }: {
    entriesPage: PagedResult<KnowledgeEntryDto> | null; status: string;
    files: KnowledgeFileDto[]; institutionId: string; token: string; l: Lang;
    selectedFileId: string | null; manualOnly: boolean; tagFilter: string; page: number;
    onFileFilter: (id: string | null, manual: boolean) => void;
    onTagFilter: (tag: string) => void;
    onPageChange: (p: number) => void;
    onMutate: () => void;
}) => {
    const allTags = Array.from(new Set(entriesPage?.items.flatMap(e => e.tags) ?? []));
    const totalPages = entriesPage ? Math.ceil(entriesPage.totalCount / entriesPage.pageSize) : 1;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
                <select
                    value={manualOnly ? "manual" : (selectedFileId ?? "")}
                    onChange={e => {
                        if (e.target.value === "manual") onFileFilter(null, true);
                        else onFileFilter(e.target.value || null, false);
                    }}
                    className="text-sm bg-muted border-0 rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-ring cursor-pointer"
                >
                    <option value="">{t.allFiles[l]}</option>
                    <option value="manual">✏️ {t.manual[l]}</option>
                    {files.filter(f => f.status === "Processed").map(f => (
                        <option key={f.id} value={f.id}>📄 {f.fileName}</option>
                    ))}
                </select>

                {allTags.slice(0, 8).map(tag => (
                    <button key={tag} onClick={() => onTagFilter(tagFilter === tag ? "" : tag)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                tagFilter === tag
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted border-transparent hover:border-border text-muted-foreground hover:text-foreground"
                            }`}>
                        #{tag}
                    </button>
                ))}
                {tagFilter && (
                    <button onClick={() => onTagFilter("")}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> clear
                    </button>
                )}
            </div>

            {status === "pending" ? (
                <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
            ) : !entriesPage?.items.length ? (
                <Card className="border-dashed border-2">
                    <CardContent className="p-16 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-muted rounded-2xl"><Brain className="w-10 h-10 text-muted-foreground" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">{t.noEntries[l]}</h3>
                            <p className="text-muted-foreground mt-1 text-sm max-w-sm">{t.noEntriesDesc[l]}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {entriesPage.items.map(entry => (
                        <EntryRow key={entry.id} entry={entry} institutionId={institutionId} token={token} l={l} onMutate={onMutate} />
                    ))}
                </div>
            )}

            {entriesPage && entriesPage.totalCount > entriesPage.pageSize && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="h-8 w-8 p-0">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">{page} / {totalPages}</span>
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-8 w-8 p-0">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

const EntryRow = ({ entry, institutionId, token, l, onMutate }: {
    entry: KnowledgeEntryDto; institutionId: string; token: string; l: Lang; onMutate: () => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const [deleting, startDeleting] = useTransition();

    const handleDelete = () => startDeleting(async () => {
        try {
            await createApi(token).delete(`/institutions/${institutionId}/knowledge/entries/${entry.id}`);
            toast.success(t.deleteSuccess[l]);
            onMutate();
        } catch (e) { logger.error("[EntryRow] delete", e); }
    });

    return (
        <Card className="border-0 bg-card transition-colors hover:bg-accent/10">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-xl shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-snug">{entry.question}</p>
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed border-l-2 border-violet-500/30 pl-3">
                                        {entry.answer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {entry.tags.map(tag => (
                                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">#{tag}</span>
                            ))}
                            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                                {entry.sourceFileName
                                    ? <><FileText className="w-3 h-3" />{entry.sourceFileName}</>
                                    : <><PenLine className="w-3 h-3" />{t.manualBadge[l]}</>
                                }
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}
                                className="h-7 w-7 p-0 text-muted-foreground">
                            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="block">
                                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                            </motion.span>
                        </Button>
                        <EditEntryForm entry={entry} institutionId={institutionId} token={token} l={l} onSuccess={onMutate} />
                        <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Ask tab ──────────────────────────────────────────────────────────────────

const AskTab = ({ institutionId, token, l }: { institutionId: string; token: string; l: Lang }) => {
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState<AskResult | null>(null);
    const [asking, startAsking] = useTransition();

    const handleAsk = () => {
        if (!question.trim()) return;
        startAsking(async () => {
            try {
                const api = createApi(token);
                const res = await api.post(`/institutions/${institutionId}/knowledge/ask`, { question });
                setResult(res.data);
            } catch (e) {
                logger.error("[AskTab]", e);
                toast.error("Ошибка при запросе");
            }
        });
    };

    return (
        <div className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5 shadow-none ring-1 ring-border">
                <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-violet-500/10 rounded-xl">
                            <Bot className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{t.askTitle[l]}</p>
                            <p className="text-xs text-muted-foreground">{t.askDesc[l]}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAsk()}
                            placeholder={t.askPlaceholder[l]}
                            className="flex-1 bg-background/80 border-border/60 focus:border-violet-500/50"
                            disabled={asking}
                        />
                        <Button onClick={handleAsk} disabled={asking || !question.trim()} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                            {asking
                                ? <><Loader2 className="w-4 h-4 animate-spin" />{t.asking[l]}</>
                                : <><Send className="w-4 h-4" />{t.askButton[l]}</>
                            }
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                {asking && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="border-0 bg-muted/40">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                    {t.asking[l]}
                                </div>
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-4/5 rounded" />
                                <Skeleton className="h-4 w-3/5 rounded" />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {!asking && result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                        <div className="flex items-start gap-3 mb-3">
                            <div className="p-2 bg-muted rounded-xl shrink-0 mt-0.5">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground max-w-xl">
                                {question}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-xl shrink-0 mt-0.5">
                                <Bot className="w-3.5 h-3.5 text-violet-500" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <Card className="border-0 bg-violet-500/5 ring-1 ring-violet-500/20">
                                    <CardContent className="p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                            {result.answer}
                                        </p>
                                    </CardContent>
                                </Card>

                                {result.sources.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                            <CornerDownRight className="w-3 h-3" />{t.sources[l]}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.sources.map((src, i) => (
                                                <div key={i} className="flex items-center gap-1.5 text-xs bg-muted rounded-lg px-2.5 py-1.5 text-muted-foreground">
                                                    <FileText className="w-3 h-3 shrink-0" />
                                                    <span>{src.fileName || t.manualBadge[l]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
                {!asking && !result && (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card className="border-dashed border-2">
                            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
                                <div className="p-4 bg-muted rounded-2xl">
                                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold">{t.noAnswer[l]}</h3>
                                    <p className="text-muted-foreground mt-1 text-sm max-w-xs">{t.noAnswerDesc[l]}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Upload file form ─────────────────────────────────────────────────────────

const UploadFileForm = ({ institutionId, token, l, onSuccess, userId }: {
    institutionId: string; token: string; l: Lang; onSuccess: () => void; userId: string
}) => {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState("");
    const [additionalText, setAdditionalText] = useState("");
    const [uploading, startUploading] = useTransition();

    const handleFileChange = (f: File) => {
        setFile(f);
        setCustomName(f.name.replace(/\.[^/.]+$/, ""));
    };

    const handleUpload = () => {
        if (!file && !additionalText.trim()) return;
        startUploading(async () => {
            try {
                const form = new FormData();
                if (file) form.append("file", file);
                if (file) form.append("userId", userId);
                if (customName.trim()) form.append("name", customName.trim());
                if (additionalText.trim()) form.append("text", additionalText.trim());
                await createApi(token).post(`/institutions/${institutionId}/knowledge/files`, form, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast.success(t.uploadSuccess[l]);
                handleClose();
                onSuccess();
            } catch (e) {
                logger.error("[UploadFileForm]", e);
            }
        });
    };

    const handleClose = () => {
        setOpen(false);
        setFile(null);
        setCustomName("");
        setAdditionalText("");
    };

    const canSubmit = (file !== null || additionalText.trim().length > 0) && !uploading;

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={
                <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-3.5 h-3.5" />{t.uploadFile[l]}
                </Button>
            }
            title={t.uploadFile[l]}
            description={t.uploadDesc[l]}
        >
            <div className="space-y-5">
                <div
                    onClick={() => document.getElementById("kb-file-input")?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500/40 hover:bg-muted/30 transition-all"
                >
                    <input
                        id="kb-file-input"
                        type="file"
                        className="hidden"
                        accept=".pdf,.txt,image/jpeg,image/png,image/webp,image/gif"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleFileChange(f);
                        }}
                    />
                    {file ? (
                        <div className="flex items-center justify-center gap-3">
                            <div className={`p-2.5 rounded-xl ${file.type.startsWith("image/") ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                                {file.type.startsWith("image/")
                                    ? <ImageIcon className="w-6 h-6 text-emerald-500" />
                                    : <FileText className="w-6 h-6 text-blue-500" />
                                }
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); setFile(null); setCustomName(""); }}
                                className="ml-auto p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{t.chooseFile[l]}</p>
                            <p className="text-xs text-muted-foreground opacity-60">PDF, TXT, JPG, PNG, WEBP, GIF</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">
                        {file ? t.orAddContext[l] : t.orPasteText[l]}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                <Field>
                    <FieldLabel>{file ? t.additionalContext[l] : t.pasteText[l]}</FieldLabel>
                    <textarea
                        value={additionalText}
                        onChange={e => setAdditionalText(e.target.value)}
                        rows={5}
                        placeholder={file ? t.additionalContextPlaceholder[l] : t.pasteTextPlaceholder[l]}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {file ? t.additionalContextHint[l] : t.pasteTextHint[l]}
                    </p>
                </Field>

                <AnimatePresence>
                    {file && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                        >
                            <Field>
                                <FieldLabel>{t.fileName[l]}</FieldLabel>
                                <Input
                                    value={customName}
                                    onChange={e => setCustomName(e.target.value)}
                                    placeholder={file.name}
                                />
                                <p className="text-xs text-muted-foreground mt-1">{t.fileNameHint[l]}</p>
                            </Field>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        {t.cancel[l]}
                    </Button>
                    <Button onClick={handleUpload} disabled={!canSubmit} className="flex-1 gap-2">
                        {uploading
                            ? <><Loader2 className="w-4 h-4 animate-spin" />{t.uploading[l]}</>
                            : <><Sparkles className="w-4 h-4" />{t.uploadFile[l]}</>
                        }
                    </Button>
                </div>
            </div>
        </DrawerForm>
    );
};

// ─── Add / Edit entry forms ───────────────────────────────────────────────────

const entrySchema = z.object({
    question: z.string().min(3),
    answer: z.string().min(3),
    tags: z.string(),
});
type EntryFormData = z.infer<typeof entrySchema>;

const EntryFormFields = ({ form, l }: { form: ReturnType<typeof useForm<EntryFormData>>; l: Lang }) => (
    <FieldGroup>
        <Controller name="question" control={form.control} render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
                <FieldLabel>{t.question[l]}</FieldLabel>
                <Input {...field} placeholder="Как подать документы?" />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
        )} />
        <Controller name="answer" control={form.control} render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
                <FieldLabel>{t.answer[l]}</FieldLabel>
                <textarea {...field} rows={5}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                          placeholder="Подробный ответ..." />
                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
        )} />
        <Controller name="tags" control={form.control} render={({ field }) => (
            <Field>
                <FieldLabel>{t.tags[l]}</FieldLabel>
                <Input {...field} placeholder="поступление, документы, дедлайны" />
            </Field>
        )} />
    </FieldGroup>
);

const AddEntryForm = ({ institutionId, token, l, onSuccess }: {
    institutionId: string; token: string; l: Lang; onSuccess: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [isPending, startPending] = useTransition();
    const form = useForm<EntryFormData>({ resolver: zodResolver(entrySchema), defaultValues: { question: "", answer: "", tags: "" } });

    const onSubmit = (values: EntryFormData) => startPending(async () => {
        try {
            await createApi(token).post(`/institutions/${institutionId}/knowledge/entries`, {
                question: values.question,
                answer: values.answer,
                tags: values.tags.split(",").map(s => s.trim()).filter(Boolean),
            });
            toast.success(t.addSuccess[l]);
            form.reset();
            setOpen(false);
            onSuccess();
        } catch (e) { logger.error("[AddEntryForm]", e); }
    });

    return (
        <DrawerForm open={open} setOpen={setOpen}
                    trigger={<Button size="sm" className="gap-2"><Plus className="w-3.5 h-3.5" />{t.addEntry[l]}</Button>}
                    title={t.addEntry[l]}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <EntryFormFields form={form} l={l} />
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.cancel[l]}</Button>
                    <Button type="submit" disabled={isPending} className="flex-1">{isPending ? t.saving[l] : t.save[l]}</Button>
                </div>
            </form>
        </DrawerForm>
    );
};

const EditEntryForm = ({ entry, institutionId, token, l, onSuccess }: {
    entry: KnowledgeEntryDto; institutionId: string; token: string; l: Lang; onSuccess: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [isPending, startPending] = useTransition();
    const form = useForm<EntryFormData>({
        resolver: zodResolver(entrySchema),
        defaultValues: { question: entry.question, answer: entry.answer, tags: entry.tags.join(", ") }
    });

    const onSubmit = (values: EntryFormData) => startPending(async () => {
        try {
            await createApi(token).put(`/institutions/${institutionId}/knowledge/entries/${entry.id}`, {
                question: values.question,
                answer: values.answer,
                tags: values.tags.split(",").map(s => s.trim()).filter(Boolean),
            });
            toast.success(t.saveSuccess[l]);
            setOpen(false);
            onSuccess();
        } catch (e) { logger.error("[EditEntryForm]", e); }
    });

    return (
        <DrawerForm open={open} setOpen={setOpen}
                    trigger={
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                            <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                    }
                    title={t.edit[l]}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <EntryFormFields form={form} l={l} />
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.cancel[l]}</Button>
                    <Button type="submit" disabled={isPending} className="flex-1">{isPending ? t.saving[l] : t.save[l]}</Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default Page;