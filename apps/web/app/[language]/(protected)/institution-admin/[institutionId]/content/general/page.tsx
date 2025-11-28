"use client"
import React from 'react';
import InstitutionForAdminHeader
    from "@/components/institutions/generalInfo/InstitutionForAdminHeader";
import {useParams} from "next/navigation";
import InstitutionDescriptionAdminView
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/InstitutionDescriptionAdminView";
import InstitutionAdvantagesView from "@/components/institutions/InstitutionAdvantagesView";
import {useQuery} from "@tanstack/react-query";
import {institutionForAdminQueryOptions} from "@/lib/tanstackQuery/options/institutionForAdminQueryOptions";
import InstitutionAdvantagesAdminView
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/InstitutionAdvantagesAdminView";

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const { data: institution, status } = useQuery(institutionForAdminQueryOptions(institutionId))

    if (status == "success") {

        return (
            <>
                <InstitutionForAdminHeader/>
                <InstitutionDescriptionAdminView institution={institution}/>
                <InstitutionAdvantagesAdminView institution={institution} />
            </>
        );
    }

    return <></>
};

export default Page;