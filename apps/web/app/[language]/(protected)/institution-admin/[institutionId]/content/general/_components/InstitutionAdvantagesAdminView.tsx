import React from 'react';
import {useLang} from "@/hooks/useLang";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";
import InstitutionAdvantagesView from "@/components/institutions/InstitutionAdvantagesView";

const InstitutionAdvantagesAdminView =  ({institution} : {institution: InstitutionAdminDto}) => {
    const [lang] = useLang()

    return (
        <>
            <div className={"flex justify-between"}>
                <h2 className={"text-4xl font-semibold"}>Description</h2>
            </div>

            <InstitutionAdvantagesView advantages={institution.advantages.map(a => {
                return {
                    id: a.id,
                    description: a.description[lang],
                    title: a.title[lang]
                }
                })
            }/>
        </>
    );
};

export default InstitutionAdvantagesAdminView;