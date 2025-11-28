import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {
    institutionForAdminQueryOptions
} from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import {useParams} from "next/navigation";
import {useTranslations} from "next-intl";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {useLang} from "@/hooks/useLang";
import {ImageWithFallback} from "@/components/ImageWithFallback";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {Badge} from "@workspace/ui/components/badge";
import ChangeInstitutionGeneralInfoForm
    from "@/components/institutions/generalInfo/changeInstitutionGeneralInfoForm";
import {Skeleton} from "@workspace/ui/components/skeleton";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@workspace/ui/components/card";
import {Building2, Hash} from "lucide-react";
import {
    GraduationCap,
    Home,
    Target,
    DollarSign,
    Shield,
    Users
} from 'lucide-react';


const InstitutionForAdminHeader = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const t = useTranslations()
    const { data: institution, status } = useQuery(institutionForAdminQueryOptions(institutionId))
    const [lang] = useLang()

    console.log(institution)

    if (status == "success") {
        return (
            <Card className="w-full overflow-hidden bg-transparent border-0 p-0 mt-10">
                <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row  items-start gap-6 lg:gap-8">
                        <div className="relative group w-full lg:w-auto">
                            <div className="w-full max-w-[280px] mx-auto lg:max-w-[300px] rounded-2xl bg-card shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                                <ImageWithFallback
                                    src={generateS3UrlFromKey(institution.logoKey)}
                                    alt={`${institution.name} logo`}
                                    width={160}
                                    height={160}
                                    imageClassName="w-full h-full object-cover aspect-square transition-transform duration-300"
                                    skeletonClassName="aspect-square w-[300px] h-auto"
                                />
                            </div>
                        </div>

                        <div className={"flex flex-col xl:flex-row justify-between items-center xl:items-start gap-10"}>
                            <div className="flex-1 flex flex-col gap-4 sm:gap-6 text-center lg:text-left w-full">
                                <div className="space-y-2">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                                        {institution.name[lang]}
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="flex xs:flex-row items-center gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start">
                                        <Badge variant="yellow" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {institution.type}
                                        </Badge>

                                        {institution.nationalCode != null && (
                                            <Badge variant="indigo" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold gap-2">
                                                <Hash className="w-4 h-4" />
                                                {t(LocalizationKeys.AdminDashBoard.NationalCode)}: {institution.nationalCode}
                                            </Badge>
                                        )}

                                        <ChangeInstitutionGeneralInfoForm data={institution} />
                                    </div>
                                </div>
                            </div>

                            <div className={"grid grid-cols-2 gap-5 w-full xl:w-[400px]"}>
                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <GraduationCap className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Специальности:
                                        </p>
                                        <p className="mt-1">
                                            {institution?.minCostPerYear || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <Home className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Общежитие:
                                        </p>
                                        <p className="mt-1">
                                            {institution?.hasHousing ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>

                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <Target className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Пороговый балл:
                                        </p>
                                        <p className="mt-1">
                                            {"N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <DollarSign className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Стоимость от:
                                        </p>
                                        <p className="mt-1">
                                            {institution?.minCostPerYear || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <Shield className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Военная кафедра:
                                        </p>
                                        <p className="mt-1">
                                            {institution?.hasMilitaryDepartment ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>

                                <div className={"bg-accent flex items-start gap-2 p-4 rounded-2xl"}>
                                    <Users className="w-5 h-5" />
                                    <div className={"flex flex-col"}>
                                        <p className={"text-xs"}>
                                            Студентов:
                                        </p>
                                        <p className="mt-1">
                                            {institution?.studentsCount || "2500"}
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </CardContent>
            </Card>
        )
    }

    return <InstitutionForAdminHeaderSkeleton />;
};

const InstitutionForAdminHeaderSkeleton = () => {
    return (
        <Card className="w-full overflow-hidden border-border/50">
            <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Logo skeleton */}
                    <div className="w-32 h-32 xl:w-40 xl:h-40 rounded-2xl border-4 border-border/20 bg-card shadow-lg overflow-hidden">
                        <Skeleton className="w-full h-full rounded-xl" />
                    </div>

                    {/* Content skeleton */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Title skeleton */}
                        <div className="space-y-3">
                            <Skeleton className="h-12 w-3/4 mx-auto lg:mx-0" />
                        </div>

                        {/* Badges skeleton */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center lg:justify-start">
                            <Skeleton className="h-8 w-32 rounded-full" />
                            <Skeleton className="h-8 w-48 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-lg ml-auto" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InstitutionForAdminHeader;