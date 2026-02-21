"use client"
import React from 'react';
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {useLang} from "@/hooks/useLang";
import {Badge} from "@workspace/ui/components/badge";
import {Skeleton} from "@workspace/ui/components/skeleton";
import {Card, CardContent} from "@workspace/ui/components/card";
import {
    Building2,
    BookOpen,
    GraduationCap,
    Calendar,
    Layers, ArrowRight
} from 'lucide-react';
import {
    facultiesQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {Faculty, FacultyDto} from "@/Data/models/Faculty";
import {Button} from "@workspace/ui/components/button";
import CreateFacultyForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/CreateFacultyFormProps";
import ChangeFacultyForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/ChangeFacultyForm";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {Avatar, AvatarFallback, AvatarImage} from "@workspace/ui/components/avatar";

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const t = useTranslations();
    const [lang] = useLang();
    const { data: faculties, status } = useQuery(facultiesQueryOptions(institutionId));

    console.log(faculties)

    if (status === "success") {
        return (
            <div className="container mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className={"flex justify-between items-center"}>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Faculties
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Manage faculties and their educational programs
                            </p>
                        </div>

                        <CreateFacultyForm institutionId={institutionId} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Building2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Faculties</p>
                                    <p className="text-2xl font-bold">{faculties.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Programs</p>
                                    <p className="text-2xl font-bold">
                                        {faculties.reduce((acc, f) => acc + (f.educationPrograms?.length || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Faculties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculties.map((faculty) => (
                        <FacultyCard key={faculty.id} faculty={faculty} lang={lang} />
                    ))}
                </div>

                {/* Empty State */}
                {faculties.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="p-12 text-center">
                            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Faculties Yet</h3>
                            <p className="text-muted-foreground">
                                Start by creating your first faculty.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return <FacultiesPageSkeleton />;
};

const FacultyCard = ({ faculty, lang }: { faculty: FacultyDto; lang: string }) => {
    const programCount = faculty.educationPrograms?.length || 0;
    const {institutionId} = useParams() as {institutionId: string};

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
                {/* Header */}
                <div
                    className="relative h-32 bg-cover bg-center mb-16"
                    style={faculty.wallPaperUrl ? { backgroundImage: `url(${generateS3UrlFromKey(faculty.wallPaperUrl)})` } : { backgroundColor: '#f0f0f0' }}
                >
                    {/* Затемнение для читаемости аватара */}
                    <div className="absolute inset-0 bg-black/30" />

                    <div className="absolute -bottom-12 left-6 z-10">
                        <div className="relative">
                            <div className="w-24 h-24 bg-background rounded-full overflow-hidden border-4 border-background shadow-lg">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage
                                        src={generateS3UrlFromKey(faculty.logoUrl)}
                                        alt={faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-semibold">
                                        {/* @ts-ignore */}
                                        {faculty.name[lang]?.[0] || faculty.name.ru?.[0] || 'Ф'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>

                </div>

                <h3 className="text-xl font-semibold mb-4">
                    {faculty.name[lang as keyof typeof faculty.name] || faculty.name.ru}
                </h3>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-accent/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span>{programCount} programs</span>
                        </div>
                    </div>
                    <div className="bg-accent/50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="w-4 h-4 text-green-500" />
                            <span>Active</span>
                        </div>
                    </div>
                </div>

                {/* Programs Preview */}
                {programCount > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Programs</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {faculty.educationPrograms?.slice(0, 3).map((program) => (
                                <Badge key={program.id} variant="secondary" className="text-xs">
                                    {program.name[lang as keyof typeof program.name] || program.name.ru}
                                </Badge>
                            ))}
                            {programCount > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{programCount - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">

                    <ChangeFacultyForm faculty={faculty} institutionId={institutionId} />

                    <Button variant="ghost" size="sm" className="gap-2">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const FacultiesPageSkeleton = () => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-12 w-48 mb-2" />
                    <Skeleton className="h-6 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1,2,3].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <Skeleton className="h-16 w-full mb-4" />
                            <div className="flex justify-between pt-4">
                                <Skeleton className="h-4 w-24" />
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