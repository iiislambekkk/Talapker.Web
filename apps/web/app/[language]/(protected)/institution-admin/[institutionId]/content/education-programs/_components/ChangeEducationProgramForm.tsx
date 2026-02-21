"use client";

import React, { useTransition, useState, useEffect } from 'react';
import { Button } from "@workspace/ui/components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { DrawerForm } from "@/components/DrawerForm";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { useLang } from "@/hooks/useLang";
import { EducationProgramDto, FacultyDto } from "@/Data/models/Faculty";
import { Search, PenIcon, Languages, Briefcase, Hash, Star, Sparkles, Loader2, Clock, GraduationCap } from "lucide-react";
import {
    educationGroupsQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/educationGroupsQueryOptions";

enum Language {
    Kazakh = 0,
    Russian = 1,
    English = 2,
}

enum StudyForm {
    FullTime = 0,
    PartTime = 1,
    Evening = 2,
    Distance = 3,
}

// Маппинг для преобразования строковых значений enum в числа
const StudyFormMapping: Record<string, StudyForm> = {
    'FullTime': StudyForm.FullTime,
    'PartTime': StudyForm.PartTime,
    'Evening': StudyForm.Evening,
    'Distance': StudyForm.Distance,
    '0': StudyForm.FullTime,
    '1': StudyForm.PartTime,
    '2': StudyForm.Evening,
    '3': StudyForm.Distance,
};

// Обратный маппинг для отображения (число -> строка)
const StudyFormReverseMapping: Record<StudyForm, string> = {
    [StudyForm.FullTime]: 'FullTime',
    [StudyForm.PartTime]: 'PartTime',
    [StudyForm.Evening]: 'Evening',
    [StudyForm.Distance]: 'Distance',
};

const changeProgramSchema = z.object({
    facultyId: z.string().min(1, "Faculty is required"),
    educationGroupId: z.string().min(1, "Education group is required"),
    nameKk: z.string().min(1, "Қазақша атауы міндетті"),
    nameRu: z.string().min(1, "Название на русском обязательно"),
    nameEn: z.string().min(1, "English name is required"),
    descriptionKk: z.string().optional(),
    descriptionRu: z.string().optional(),
    descriptionEn: z.string().optional(),
    workPlacesKk: z.string().optional(),
    workPlacesRu: z.string().optional(),
    workPlacesEn: z.string().optional(),
    practiseBasesKk: z.string().optional(),
    practiseBasesRu: z.string().optional(),
    practiseBasesEn: z.string().optional(),
    minimumUntScore: z.number().min(0),
    code: z.string().min(1, "Program code is required"),
    studyForm: z.nativeEnum(StudyForm),
    durationYears: z.number().min(0.5).max(10),
    languages: z.array(z.nativeEnum(Language)).min(1, "At least one language must be selected"),
});

type ChangeProgramFormData = z.infer<typeof changeProgramSchema>;

interface ChangeEducationProgramFormProps {
    program: EducationProgramDto;
    institutionId: string;
    faculties: FacultyDto[];
}

// Функция для преобразования языков из серверного формата в клиентский enum
const convertToClientLanguages = (serverLanguages: any): Language[] => {
    console.log('Converting server languages:', serverLanguages);

    if (!serverLanguages) return [];

    // Если это массив
    if (Array.isArray(serverLanguages)) {
        return serverLanguages.map(lang => {
            // Если это уже число
            if (typeof lang === 'number') return lang;

            // Если это строка
            if (typeof lang === 'string') {
                switch(lang.toLowerCase()) {
                    case 'kazakh': return Language.Kazakh;
                    case 'russian': return Language.Russian;
                    case 'english': return Language.English;
                    default: {
                        console.warn('Unknown language string:', lang);
                        return null;
                    }
                }
            }

            // Если это объект
            if (typeof lang === 'object' && lang !== null) {
                const langValue = lang.name || lang.value || '';
                if (typeof langValue === 'string') {
                    switch(langValue.toLowerCase()) {
                        case 'kazakh': return Language.Kazakh;
                        case 'russian': return Language.Russian;
                        case 'english': return Language.English;
                    }
                }
                if (typeof langValue === 'number') {
                    return langValue;
                }
            }

            console.warn('Unknown language format:', lang);
            return null;
        }).filter(lang => lang !== null);
    }

    console.warn('Server languages is not an array:', serverLanguages);
    return [];
};

// Функция для преобразования studyForm из серверного формата (строка) в клиентский enum (число)
const convertToClientStudyForm = (serverStudyForm: any): StudyForm => {
    console.log('Converting server studyForm:', serverStudyForm);

    if (serverStudyForm === null || serverStudyForm === undefined) {
        return StudyForm.FullTime;
    }

    // Если это уже число
    if (typeof serverStudyForm === 'number') {
        return serverStudyForm;
    }

    // Если это строка (как в вашем случае "FullTime")
    if (typeof serverStudyForm === 'string') {
        // Пробуем найти в маппинге
        if (serverStudyForm in StudyFormMapping) {
            return StudyFormMapping[serverStudyForm] ?? StudyForm.Evening;
        }

        // Пробуем распарсить как число на всякий случай
        const asNumber = parseInt(serverStudyForm, 10);
        if (!isNaN(asNumber) && asNumber >= 0 && asNumber <= 3) {
            return asNumber;
        }
    }

    console.warn('Unknown studyForm format, using default:', serverStudyForm);
    return StudyForm.FullTime;
};

export const ChangeEducationProgramForm = ({ program, institutionId, faculties }: ChangeEducationProgramFormProps) => {
    const [isPending, startPending] = useTransition();
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const [lang] = useLang();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("kk");
    const [rawText, setRawText] = useState("");

    const { data: educationGroups, isLoading: groupsLoading } = useQuery(educationGroupsQueryOptions());

    // Отладка: смотрим, что приходит с сервера
    useEffect(() => {
        console.log('Program from server:', program);
        console.log('Program languages raw:', program.languages);
        console.log('Program studyForm raw:', program.studyForm);
    }, [program]);

    const getDefaultValues = () => {
        const convertedLanguages = convertToClientLanguages(program.languages);
        const convertedStudyForm = convertToClientStudyForm(program.studyForm);

        console.log('Converted languages:', convertedLanguages);
        console.log('Converted studyForm:', convertedStudyForm);

        return {
            facultyId: program.facultyId ?? "",
            educationGroupId: program.educationGroupId ?? "",
            nameKk: program.name?.kk || "",
            nameRu: program.name?.ru || "",
            nameEn: program.name?.en || "",
            descriptionKk: program.description?.kk || "",
            descriptionRu: program.description?.ru || "",
            descriptionEn: program.description?.en || "",
            workPlacesKk: program.workPlaces?.kk || "",
            workPlacesRu: program.workPlaces?.ru || "",
            workPlacesEn: program.workPlaces?.en || "",
            practiseBasesKk: program.practiseBases?.kk || "",
            practiseBasesRu: program.practiseBases?.ru || "",
            practiseBasesEn: program.practiseBases?.en || "",
            minimumUntScore: program.minimumUntScore ?? 0,
            code: program.code || "",
            studyForm: convertedStudyForm,
            durationYears: program.durationYears ?? 4,
            languages: convertedLanguages,
        };
    };

    const form = useForm<ChangeProgramFormData>({
        resolver: zodResolver(changeProgramSchema),
        defaultValues: getDefaultValues(),
        mode: 'onChange',
    });

    // Отладка: следим за состоянием формы
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'languages' || name === 'studyForm') {
                console.log(`${name} changed:`, value[name]);
                console.log('Form errors:', form.formState.errors);
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        const defaultValues = getDefaultValues();
        console.log('Resetting form with:', defaultValues);
        form.reset(defaultValues);

        // Принудительно проверяем поля после сброса
        setTimeout(() => {
            form.trigger(['languages', 'studyForm']);
        }, 100);
    }, [program]);

    const STUDY_FORM_OPTIONS = [
        { value: StudyForm.FullTime,  label: lang === "kk" ? "Күндізгі"      : lang === "ru" ? "Очная"           : "Full-time" },
        { value: StudyForm.PartTime,  label: lang === "kk" ? "Сырттай"       : lang === "ru" ? "Заочная"         : "Part-time" },
        { value: StudyForm.Evening,   label: lang === "kk" ? "Кешкі"         : lang === "ru" ? "Вечерняя"        : "Evening"   },
        { value: StudyForm.Distance,  label: lang === "kk" ? "Қашықтықтан"   : lang === "ru" ? "Дистанционная"   : "Distance"  },
    ];

    const LANGUAGE_TABS = [
        { code: "kk", label: "Қазақша", flag: "🇰🇿" },
        { code: "ru", label: "Русский",  flag: "🇷🇺" },
        { code: "en", label: "English",  flag: "🇬🇧" },
    ];

    const LANGUAGE_OPTIONS = [
        { value: Language.Kazakh,  label: "Қазақша", flag: "🇰🇿" },
        { value: Language.Russian, label: "Русский",  flag: "🇷🇺" },
        { value: Language.English, label: "English",  flag: "🇬🇧" },
    ];

    const handlePreview = async () => {
        if (!rawText.trim()) return;
        setIsPreviewLoading(true);
        try {
            const api = createApi();
            const { data } = await api.post("/api/education-programs/preview",
                { text: rawText },
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            );

            const setIfNotEmpty = (field: any, value: string) => {
                if (value?.trim()) form.setValue(field, value);
            };

            setIfNotEmpty("code", data.code);
            setIfNotEmpty("nameKk", data.name?.kk);
            setIfNotEmpty("nameRu", data.name?.ru);
            setIfNotEmpty("nameEn", data.name?.en);
            setIfNotEmpty("descriptionKk", data.description?.kk);
            setIfNotEmpty("descriptionRu", data.description?.ru);
            setIfNotEmpty("descriptionEn", data.description?.en);
            setIfNotEmpty("workPlacesKk", data.workPlaces?.kk);
            setIfNotEmpty("workPlacesRu", data.workPlaces?.ru);
            setIfNotEmpty("workPlacesEn", data.workPlaces?.en);
            setIfNotEmpty("practiseBasesKk", data.practiseBases?.kk);
            setIfNotEmpty("practiseBasesRu", data.practiseBases?.ru);
            setIfNotEmpty("practiseBasesEn", data.practiseBases?.en);

            toast.success(lang === "ru" ? "AI заполнил данные!" : "AI мәліметтерді толтырды!");
        } catch {
            toast.error(lang === "ru" ? "Ошибка AI" : "AI қате шықты");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const onSubmit = async (values: ChangeProgramFormData) => {
        console.log('Submitting values:', values);

        const apiCall = async () => {
            try {
                const api = createApi();

                const command = {
                    id: program.id,
                    facultyId: values.facultyId,
                    educationGroupId: values.educationGroupId,
                    name: { kk: values.nameKk, ru: values.nameRu, en: values.nameEn },
                    description: { kk: values.descriptionKk || "", ru: values.descriptionRu || "", en: values.descriptionEn || "" },
                    workPlaces: { kk: values.workPlacesKk || "", ru: values.workPlacesRu || "", en: values.workPlacesEn || "" },
                    practiseBases: { kk: values.practiseBasesKk || "", ru: values.practiseBasesRu || "", en: values.practiseBasesEn || "" },
                    minimumUntScore: values.minimumUntScore,
                    code: values.code,
                    studyForm: values.studyForm, // ← Отправляем как число (0, 1, 2, 3), НЕ СТРОКУ!
                    durationYears: values.durationYears,
                    languages: values.languages,
                };

                console.log('Sending command:', command);

                await api.put("/api/education-programs/change", command, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                });

                toast.success(lang === "ru" ? "Программа успешно обновлена!" : "Бағдарлама сәтті жаңартылды!");
                setOpen(false);
                setSearchQuery("");
                setRawText("");
                await queryClient.invalidateQueries({ queryKey: ['education-programs', institutionId] });
            } catch (error: any) {
                console.error('Submit error:', error);
                toast.error(error.message || "Қате шықты");
            }
        };
        startPending(apiCall);
    };

    const filteredGroups = educationGroups?.filter(group => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const name = (group.name[lang] || group.name.ru || '').toLowerCase();
        const code = (group.nationalCode || '').toLowerCase();
        const fieldName = (group.educationField?.name[lang] || group.educationField?.name.ru || '').toLowerCase();
        return name.includes(searchLower) || code.includes(searchLower) || fieldName.includes(searchLower);
    });

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button variant="ghost" size="sm" className={"w-full justify-start p-0"}><PenIcon className="size-4" />Өңдеу</Button>}
            title="Білім бағдарламасын өңдеу"
            description={`${program.name[lang] || program.name.ru} - бағдарламасын өңдеу`}
        >
            <form className="space-y-6 pb-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    {/* Faculty */}
                    <Controller name="facultyId" control={form.control} render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                            <FieldLabel>Факультет</FieldLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Факультетті таңдаңыз" /></SelectTrigger>
                                <SelectContent>
                                    {faculties.map((faculty) => (
                                        <SelectItem key={faculty.id} value={faculty.id}>
                                            {faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )} />

                    {/* Education Group */}
                    <Controller name="educationGroupId" control={form.control} render={({ field, fieldState }) => (
                        <Field data-invalid={!!fieldState.error}>
                            <FieldLabel>Білім беру тобы</FieldLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={groupsLoading}>
                                <SelectTrigger className="p-5 py-8">
                                    <SelectValue placeholder={groupsLoading ? "Жүктелуде..." : "Топты таңдаңыз"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                    <div className="sticky top-0 bg-popover p-2 border-b z-10">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Іздеу..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {filteredGroups?.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground">Топтар табылмады</div>
                                        ) : (
                                            filteredGroups?.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>
                                                    <div className="flex flex-col py-1">
                                                        <span className="font-medium">{group.name[lang] || group.name.ru}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <span className="bg-primary/10 px-1.5 py-0.5 rounded">{group.nationalCode}</span>
                                                            <span>{group.educationField?.name[lang] || group.educationField?.name.ru}</span>
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </div>
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                        </Field>
                    )} />

                    {/* Code + Score */}
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="code" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel><div className="flex items-center gap-1"><Hash className="w-4 h-4" />Код</div></FieldLabel>
                                <Input {...field} placeholder="6B01501" />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )} />

                        <Controller name="minimumUntScore" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel><div className="flex items-center gap-1"><Star className="w-4 h-4" />ҰБТ балы</div></FieldLabel>
                                <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} placeholder="70" />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )} />
                    </div>

                    {/* Study Form + Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <Controller name="studyForm" control={form.control} render={({ field, fieldState }) => {
                            console.log('Rendering studyForm:', { value: field.value, error: fieldState.error });

                            return (
                                <Field data-invalid={!!fieldState.error}>
                                    <FieldLabel>
                                        <div className="flex items-center gap-1">
                                            <GraduationCap className="w-4 h-4" />
                                            {lang === "kk" ? "Оқу түрі" : lang === "ru" ? "Форма обучения" : "Study Form"}
                                        </div>
                                    </FieldLabel>
                                    <Select
                                        onValueChange={(v) => {
                                            console.log('StudyForm selected:', v);
                                            field.onChange(Number(v));
                                        }}
                                        value={String(field.value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={lang === "ru" ? "Выберите форму" : "Таңдаңыз"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STUDY_FORM_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={String(opt.value)}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            );
                        }} />

                        <Controller name="durationYears" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {lang === "kk" ? "Оқу мерзімі (жыл)" : lang === "ru" ? "Срок обучения (лет)" : "Duration (years)"}
                                    </div>
                                </FieldLabel>
                                <Input
                                    type="number"
                                    min={0.5}
                                    max={10}
                                    step={0.5}
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    placeholder="4"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )} />
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                        <Controller
                            name="languages"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                console.log('Rendering languages field:', { value: field.value, error: fieldState.error });

                                return (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Оқыту тілдері</FieldLabel>
                                        <div className="flex gap-4">
                                            {LANGUAGE_OPTIONS.map((language) => {
                                                const checked = Array.isArray(field.value) && field.value.includes(language.value);
                                                return (
                                                    <div key={language.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`edit-lang-${language.value}`}
                                                            checked={checked}
                                                            onCheckedChange={(isChecked) => {
                                                                console.log('Checkbox changed:', { language: language.label, checked: isChecked });

                                                                const current = Array.isArray(field.value) ? field.value : [];
                                                                const newValue = isChecked
                                                                    ? [...current, language.value]
                                                                    : current.filter((v) => v !== language.value);

                                                                console.log('New languages value:', newValue);
                                                                field.onChange(newValue);

                                                                setTimeout(() => {
                                                                    form.trigger('languages');
                                                                }, 0);
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`edit-lang-${language.value}`}
                                                            className="text-sm font-medium leading-none cursor-pointer"
                                                        >
                                                            {language.flag} {language.label}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {fieldState.error && (
                                            <FieldError>{fieldState.error.message}</FieldError>
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </div>

                    {/* AI Block */}
                    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {lang === "ru" ? "Автозаполнение через AI" : "AI арқылы автоматты толтыру"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {lang === "ru"
                                ? "Вставьте любой текст о программе — AI заполнит только те поля, которые найдёт. Уже заполненные поля не сбросятся."
                                : "Бағдарлама туралы мәтін енгізіңіз — AI тек табылған өрістерді толтырады."}
                        </p>
                        <Textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder={lang === "ru" ? "Сфера деятельности: ...\nМеста работы: ...\nБазы практик: ..." : "Paste raw program info here..."}
                            rows={5}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={!rawText.trim() || isPreviewLoading}
                            onClick={handlePreview}
                        >
                            {isPreviewLoading
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{lang === "ru" ? "AI обрабатывает..." : "AI өңдеуде..."}</>
                                : <><Sparkles className="w-4 h-4 mr-2" />{lang === "ru" ? "Заполнить через AI" : "AI-мен толтыру"}</>
                            }
                        </Button>
                    </div>

                    {/* Language Tabs */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Languages className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Тілдер / Languages</span>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                {LANGUAGE_TABS.map((tab) => (
                                    <TabsTrigger key={tab.code} value={tab.code}>{tab.flag} {tab.label}</TabsTrigger>
                                ))}
                            </TabsList>

                            {LANGUAGE_TABS.map((tab) => (
                                <TabsContent key={tab.code} value={tab.code} className="space-y-4 mt-4">
                                    <Controller
                                        name={`name${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}` as any}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>{tab.code === "kk" ? "Атауы" : tab.code === "ru" ? "Название" : "Name"}</FieldLabel>
                                                <Input {...field} placeholder={tab.code === "en" ? "Computer Science" : "Информатика"} />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name={`description${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}` as any}
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel>{tab.code === "kk" ? "Сипаттама" : tab.code === "ru" ? "Описание" : "Description"}</FieldLabel>
                                                <Textarea {...field} placeholder={tab.code === "ru" ? "Описание программы..." : "Program description..."} rows={3} />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name={`workPlaces${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}` as any}
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel>
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="w-4 h-4" />
                                                        {tab.code === "kk" ? "Жұмыс орындары" : tab.code === "ru" ? "Места работы" : "Work Places"}
                                                    </div>
                                                </FieldLabel>
                                                <Textarea {...field} placeholder={tab.code === "ru" ? "Школы, колледжи..." : "Schools, colleges..."} rows={3} />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name={`practiseBases${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}` as any}
                                        control={form.control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel>
                                                    {tab.code === "kk" ? "Тәжірибе базалары" : tab.code === "ru" ? "Базы практик" : "Practise Bases"}
                                                </FieldLabel>
                                                <Textarea {...field} placeholder={tab.code === "ru" ? "Реабилитационный центр, поликлиника..." : "Rehabilitation center, clinic..."} rows={3} />
                                            </Field>
                                        )}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </FieldGroup>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Болдырмау</Button>
                    <Button
                        type="submit"
                        disabled={isPending || groupsLoading || !form.formState.isValid}
                    >
                        {isPending ? "Сақталуда..." : "Сақтау"}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default ChangeEducationProgramForm;