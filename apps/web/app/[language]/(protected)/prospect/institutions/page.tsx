import React from 'react';
import InstitutionsList from "@/app/[language]/(protected)/admin/institutions/_components/InstitutionsList";

const Page = () => {
    return (
        <div>
            <InstitutionsList isForProspect={true} />
        </div>
    );
};

export default Page;