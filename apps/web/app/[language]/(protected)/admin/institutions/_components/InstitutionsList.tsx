"use client"

import React from 'react';
import {useQuery} from "@tanstack/react-query";
import {allInstitutionsShortOptions} from "@/lib/tanstackQuery/options/allInstitutionsShortOptions";
import DataFetchingFail from "@/components/DataFetchingFail";
import InstitutionCard, {
    InstitutionCardSkeleton
} from "@/app/[language]/(protected)/admin/institutions/_components/InstitutionCard";

const InstitutionsList = ({ isForProspect = false }: { isForProspect?: boolean }) => {
    const { data, error, refetch, status } = useQuery(allInstitutionsShortOptions)

    return (
        <div>
            <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 lg:gap-5"}>
                {status == "success" && data.map(institution => (
                    <InstitutionCard key={institution.id} institution={institution} isForProspect={isForProspect} />
                ))}

                {status == "pending" && Array.from({length: 10}).map((el, index) =>
                    <InstitutionCardSkeleton key={index} />
                )}
            </div>

            {status == "error" && <DataFetchingFail refetch={() => refetch()} />}
        </div>
    );
};


export default InstitutionsList;