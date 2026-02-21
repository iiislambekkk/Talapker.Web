"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AmbassadorProfileForm } from "@/app/[language]/(protected)/ambassador/_components/AmbassadorProfileForm";
import { createApi } from "@/lib/axios";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import {AmbassadorDto} from "@/Data/models/AmbassadorDto";

const ambassadorByUserQueryOptions = (userId: string) => ({
    queryKey: ['ambassador', 'by-user', userId],
    queryFn: async (): Promise<AmbassadorDto> => {
        const api = createApi();
        const response = await api.get(`/api/ambassadors/by-user/${userId}`);
        return response.data;
    },
    enabled: !!userId
});

const Page = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user?.sub;

    const { data: ambassador, isLoading, error } = useQuery({
        ...ambassadorByUserQueryOptions(userId!),
        enabled: !!userId && sessionStatus === 'authenticated'
    });

    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-96" />
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-destructive">Error loading ambassador profile</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!ambassador) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Ambassador profile not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <AmbassadorProfileForm
                ambassador={ambassador}
                institutionId={ambassador.institutionId}
            />
        </div>
    );
};

export default Page;