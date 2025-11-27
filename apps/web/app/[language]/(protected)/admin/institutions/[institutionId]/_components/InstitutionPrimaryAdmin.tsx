"use client"

import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {institutionPrimaryAdminOptions} from "@/lib/tanstackQuery/options/institutionPrimaryAdminOptions";
import {useParams} from "next/navigation";
import {useTranslations} from "next-intl";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import DataFetchingFail from "@/components/DataFetchingFail";
import {Skeleton} from "@workspace/ui/components/skeleton";
import AssignPrimeAdminForm
    from "@/app/[language]/(protected)/admin/institutions/[institutionId]/_components/AssignPrimeAdminForm";
import {Card, CardContent} from "@workspace/ui/components/card";
import {Avatar, AvatarFallback, AvatarImage} from "@workspace/ui/components/avatar";
import {Badge} from "@workspace/ui/components/badge";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {User, Mail, Shield} from "lucide-react";

const InstitutionPrimaryAdmin = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const t = useTranslations()
    const {data: primaryAdmin, status, refetch} = useQuery(institutionPrimaryAdminOptions(institutionId))

    if (status == "success") {
        return (
            <InstitutionPrimaryAdminWrapper>
                {!primaryAdmin && (
                    <Card className="w-full border-border/50 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="text-center lg:text-left">
                                    <h3 className="text-2xl font-bold text-foreground mb-2">
                                        {t(LocalizationKeys.AdminDashBoard.PrimeAdminNotAssigned)}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Assign a primary administrator to manage this institution
                                    </p>
                                </div>
                                <AssignPrimeAdminForm institutionId={institutionId} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {primaryAdmin && (
                    <Card className="w-full border-border/50 bg-gradient-to-br from-card to-card/80">
                        <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="size-32 rounded-2xl  border-primary/20 bg-card shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={generateS3UrlFromKey(primaryAdmin.image)} alt={`${primaryAdmin.firstName} ${primaryAdmin.lastName}`} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                                {(primaryAdmin.firstName[0] ?? "" + primaryAdmin.lastName[0] ?? "").toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4 text-center lg:text-left">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl xl:text-3xl font-bold text-foreground leading-tight">
                                            {primaryAdmin.firstName} {primaryAdmin.lastName}
                                        </h3>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap justify-center lg:justify-start">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">{primaryAdmin.email}</span>
                                        </div>

                                        <Badge variant="red" className="">
                                            <Shield className="w-4 h-4" />
                                            Primary Administrator
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </InstitutionPrimaryAdminWrapper>
        )
    }

    if (status == "error") {
        return (
            <InstitutionPrimaryAdminWrapper>
                <DataFetchingFail
                    message={"Failed to fetch prime admin"}
                    className={"w-full"}
                    refetch={() => refetch()}
                />
            </InstitutionPrimaryAdminWrapper>
        )
    }

    return (
        <InstitutionPrimaryAdminWrapper>
            <Skeleton className="w-full h-32 rounded-xl"/>
        </InstitutionPrimaryAdminWrapper>
    )
};

const InstitutionPrimaryAdminWrapper = ({children} : {children: React.ReactNode}) => {
    const t = useTranslations()

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3">
                    <User className="w-8 h-8 text-primary" />
                    {t(LocalizationKeys.AdminDashBoard.PrimeAdmin)}
                </h2>
            </div>
            {children}
        </div>
    )
}

export default InstitutionPrimaryAdmin;