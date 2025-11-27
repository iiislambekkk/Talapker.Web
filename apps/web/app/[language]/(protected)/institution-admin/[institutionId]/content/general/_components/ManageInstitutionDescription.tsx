"use client"

import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {institutionForAdminQueryOptions} from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import {useLang} from "@/hooks/useLang";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@workspace/ui/components/card";
import RenderDescription from "@/components/institutions/RenderDescription";
import ChangeInstitutionDescriptionForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/changeInstitutionDescriptionForm";

const ManageInstitutionDescription = ({institutionId} : {institutionId: string}) => {
    const { data: institution, status } = useQuery(institutionForAdminQueryOptions(institutionId))
    const [lang] = useLang()

    if (status === "success") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className={"text-4xl"}>Description</CardTitle>
                </CardHeader>
                <CardContent className={"space-y-5"}>
                    <RenderDescription description={institution?.description[lang]}/>

                    <CardFooter className={"flex justify-end"}>
                        <ChangeInstitutionDescriptionForm data={institution}/>
                    </CardFooter>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
        </>
    )
}

export default ManageInstitutionDescription;