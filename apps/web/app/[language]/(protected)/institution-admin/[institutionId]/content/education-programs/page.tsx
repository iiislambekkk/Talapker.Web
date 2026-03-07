"use client"
import React, { useState } from 'react';
import {useParams, useRouter} from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useLang } from "@/hooks/useLang";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
    BookOpen,
    GraduationCap,
    Calendar,
    Layers,
    ArrowRight,
    BookText,
    Filter,
    ChevronDown, Clock, MessageSquare, Building2, Star, MoreHorizontal, Eye, Pencil, Trash2, Copy
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    facultiesQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {
    educationProgramsQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/educationProgramsQueryOptions";
import {Button} from "@workspace/ui/components/button";
import CreateEducationProgramForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/CreateEducationProgramForm";
import {LanguageType} from "@/lib/lang/LanguageType";
import ChangeEducationProgramForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/ChangeEducationProgramForm";
import DeleteEducationProgramDialog
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/DeleteEducationProgramDialog";
import {EducationProgramDto, FacultyDto} from "@/Data/models/Faculty";

const Page = () => {
    const { institutionId } = useParams() as { institutionId: string };
    const t = useTranslations();
    const [lang] = useLang()

    const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

    const { data: programs, status } = useQuery(educationProgramsQueryOptions(institutionId, selectedFacultyId));
    const { data: faculties } = useQuery(facultiesQueryOptions(institutionId));

    const selectedFaculty = faculties?.find(f => f.id === selectedFacultyId);

    if (status === "success") {
        return (
            <div className="container mx-auto py-8">
                {/* Header / Тақырып / Заголовок */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {lang === "kk" && "Білім беру бағдарламалары"}
                                {lang === "ru" && "Образовательные программы"}
                                {lang === "en" && "Education Programs"}
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                {lang === "kk" && "Білім беру бағдарламаларын және олардың мәліметтерін басқару"}
                                {lang === "ru" && "Управление образовательными программами и их деталями"}
                                {lang === "en" && "Manage educational programs and their details"}
                            </p>
                        </div>

                        <CreateEducationProgramForm
                            institutionId={institutionId}
                            faculties={faculties || []}
                        />
                    </div>
                </div>

                {/* Filters / Сүзгілер / Фильтры */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            {lang === "kk" && "Сүзгі бойынша:"}
                            {lang === "ru" && "Фильтр:"}
                            {lang === "en" && "Filter by:"}
                        </span>
                    </div>

                    <Select
                        value={selectedFacultyId || "all"}
                        onValueChange={(value) => setSelectedFacultyId(value === "all" ? null : value)}
                    >
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder={
                                lang === "kk" ? "Барлық факультеттер" :
                                    lang === "ru" ? "Все факультеты" :
                                        "All Faculties"
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {lang === "kk" && "Барлық факультеттер"}
                                {lang === "ru" && "Все факультеты"}
                                {lang === "en" && "All Faculties"}
                            </SelectItem>
                            {faculties?.map((faculty) => (
                                <SelectItem key={faculty.id} value={faculty.id}>
                                    {faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedFaculty && (
                        <Badge variant="secondary" className="gap-1">
                            {selectedFaculty.name[lang as keyof typeof selectedFaculty.name] || selectedFaculty.name.ru}
                            <button
                                onClick={() => setSelectedFacultyId(null)}
                                className="ml-1 hover:text-destructive"
                            >
                                ×
                            </button>
                        </Badge>
                    )}
                </div>

                {/* Stats Cards / Статистика / Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {lang === "kk" && "Барлық бағдарламалар"}
                                        {lang === "ru" && "Все программы"}
                                        {lang === "en" && "Total Programs"}
                                    </p>
                                    <p className="text-2xl font-bold">{programs.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <Layers className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {lang === "kk" && "Факультеттер"}
                                        {lang === "ru" && "Факультеты"}
                                        {lang === "en" && "Faculties"}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {new Set(programs.map(p => p.faculty?.id)).size}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Programs Grid / Бағдарламалар / Программы */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <ProgramCard
                            key={program.id}
                            program={program}
                            lang={lang}
                            faculties={faculties || []}
                            institutionId={institutionId}
                        />
                    ))}
                </div>

                {/* Empty State / Бос күй / Пустое состояние */}
                {programs.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="p-12 text-center">
                            <BookText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {lang === "kk" && "Әзірге бағдарламалар жоқ"}
                                {lang === "ru" && "Программ пока нет"}
                                {lang === "en" && "No Programs Yet"}
                            </h3>
                            <p className="text-muted-foreground">
                                {selectedFaculty
                                    ? (lang === "kk" ? "Бұл факультетте әзірге бағдарламалар жоқ. Алғашқы бағдарламаны жасаңыз." :
                                        lang === "ru" ? "На этом факультете пока нет программ. Создайте первую программу." :
                                            "This faculty doesn't have any programs yet. Create your first program.")
                                    : (lang === "kk" ? "Алғашқы білім беру бағдарламасын жасаудан бастаңыз." :
                                        lang === "ru" ? "Начните с создания первой образовательной программы." :
                                            "Start by creating your first educational program.")}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return <ProgramsPageSkeleton lang={lang} />;
};

const ProgramCard = ({
                         program,
                         lang,
                         faculties,
                         institutionId
                     }: {
    program: EducationProgramDto;
    lang: LanguageType;
    faculties: FacultyDto[];
    institutionId: string;
}) => {
    const faculty = faculties.find(f => f.id === program.faculty?.id);
    const router = useRouter()

    return (
        <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20 relative">
            {/* Меню с тремя точками */}
            <div className="absolute top-2 right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 rounded-full opacity-100">
                            <MoreHorizontal size={12} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            {lang === "kk" && "Әрекеттер"}
                            {lang === "ru" && "Действия"}
                            {lang === "en" && "Actions"}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="gap-2" onSelect={e => router.push(`/${lang}/institution-admin/${institutionId}/content/education-programs/${program.id}`)}>
                            <Eye className="h-6 w-6" />
                            <span>
                            {lang === "kk" && "Қарау"}
                                {lang === "ru" && "Просмотр"}
                                {lang === "en" && "View"}
                            </span>
                        </DropdownMenuItem>

                        {/* Edit - встраиваем ChangeEducationProgramForm */}
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                            <ChangeEducationProgramForm
                                program={program}
                                institutionId={institutionId}
                                faculties={faculties}
                            />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Delete - встраиваем DeleteEducationProgramDialog */}
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
                            <DeleteEducationProgramDialog
                                institutionId={institutionId}
                                programId={program.id}
                                programName={program.name[lang] || program.name.ru}
                            />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Остальной контент карточки (без кнопок в футере) */}
            <CardContent className="p-6">
                {/* Header с иконкой и кодом */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-inner">
                            <BookText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold line-clamp-1">
                                    {program.name[lang as keyof typeof program.name] || program.name.ru}
                                </h3>
                                <Badge variant="secondary" className="text-xs font-mono">
                                    {program.code}
                                </Badge>
                            </div>
                            {faculty && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        {faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description с иконкой */}
                {program.description && (
                    <div className="flex gap-3 mb-4 p-3 bg-accent/30 rounded-xl">
                        <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {program.description[lang as keyof typeof program.description] || program.description.ru}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl p-3 hover:bg-accent/70 transition-colors">
                        <div className="flex flex-col items-center text-center">
                            <GraduationCap className="w-4 h-4 text-blue-500 mb-1" />
                            <span className="text-xs font-medium text-muted-foreground">
                                {lang === "kk" ? "Топ" : lang === "ru" ? "Группа" : "Group"}
                            </span>
                            <span className="text-sm font-semibold truncate w-full">
                                {program.educationGroup?.name?.[lang] || program.educationGroup?.name?.ru}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl p-3 hover:bg-accent/70 transition-colors">
                        <div className="flex flex-col items-center text-center">
                            <Clock className="w-4 h-4 text-green-500 mb-1" />
                            <span className="text-xs font-medium text-muted-foreground">
                                {lang === "kk" ? "Мерзім" : lang === "ru" ? "Срок" : "Duration"}
                            </span>
                            <span className="text-sm font-semibold">
                                {program.durationYears} {lang === "kk" ? "жыл" : lang === "ru" ? "лет" : "yrs"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl p-3 hover:bg-accent/70 transition-colors">
                        <div className="flex flex-col items-center text-center">
                            <Star className="w-4 h-4 text-yellow-500 mb-1" />
                            <span className="text-xs font-medium text-muted-foreground">
                                {lang === "kk" ? "Мин. ҰБТ" : lang === "ru" ? "Проходной балл" : "Min. UNT"}
                            </span>
                            <span className="text-sm font-semibold">
                                {program.minimumUntScore}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Languages chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {program.languages?.map((lang_code) => (
                        <Badge key={lang_code} variant="outline" className="bg-background/50 text-xs">
                            {lang_code === 0 && "🇰🇿 Қазақша"}
                            {lang_code === 1 && "🇷🇺 Русский"}
                            {lang_code === 2 && "🇬🇧 English"}
                        </Badge>
                    ))}
                </div>

                {/* Study Form chip */}
                <div className="mb-4">
                    <Badge variant="secondary" className="text-xs">
                        {program.studyForm === "FullTime" && (lang === "kk" ? "Күндізгі" : lang === "ru" ? "Очная" : "Full-time")}
                        {program.studyForm === "PartTime" && (lang === "kk" ? "Сырттай" : lang === "ru" ? "Заочная" : "Part-time")}
                        {program.studyForm === "Evening" && (lang === "kk" ? "Кешкі" : lang === "ru" ? "Вечерняя" : "Evening")}
                        {program.studyForm === "Distance" && (lang === "kk" ? "Қашықтықтан" : lang === "ru" ? "Дистанционная" : "Distance")}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

const ProgramsPageSkeleton = ({ lang }: { lang: LanguageType }) => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-12 w-64 mb-2" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            <Skeleton className="h-10 w-[250px] mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1,2,3].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full mb-4" />
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="flex justify-between pt-4">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Page;