"use client"
import React from 'react';
import InstitutionForAdminHeader
    from "@/components/institutions/generalInfo/InstitutionForAdminHeader";
import {useParams} from "next/navigation";
import ManageInstitutionDescription
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/ManageInstitutionDescription";

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string};


    return (
        <>
            <InstitutionForAdminHeader/>
            <ManageInstitutionDescription institutionId={institutionId}/>
        </>
    );
};

export default Page;