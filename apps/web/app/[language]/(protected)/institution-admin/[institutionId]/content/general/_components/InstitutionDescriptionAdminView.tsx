"use client"

import React from 'react';
import {useLang} from "@/hooks/useLang";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@workspace/ui/components/card";
import InstitutionDescriptionView from "@/components/institutions/InstitutionDescriptionView";
import ChangeInstitutionDescriptionForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/changeInstitutionDescriptionForm";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";

const InstitutionDescriptionAdminView = ({institution} : {institution: InstitutionAdminDto}) => {
    const [lang] = useLang()

    return (
        <>
            <div className={"flex justify-between"}>
                <h2 className={"text-4xl font-semibold"}>Description</h2>
            </div>

            <InstitutionDescriptionView description={institution.description[lang]}/>
            <ChangeInstitutionDescriptionForm data={institution}/>
        </>
    );
}

export default InstitutionDescriptionAdminView;