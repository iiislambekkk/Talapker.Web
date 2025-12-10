import React, {useMemo} from 'react';
import {useLang} from "@/hooks/useLang";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";
import InstitutionAdvantagesView from "@/components/institutions/InstitutionAdvantagesView";
import InstitutionAdvantagesForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/InstitutionAdvantagesForm";

const InstitutionAdvantagesAdminView =  ({institution} : {institution: InstitutionAdminDto}) => {
    const [lang] = useLang()

    const advantages = useMemo(() =>
        institution.advantages.map(a => ({
                id: a.id,
                description: a.description[lang],
                title: a.title[lang]
        })
    ), [institution.advantages, lang])

    if (advantages.length === 0) {
        return (
            <div className={"space-y-2"}>
                <div className={"flex justify-between"}>
                    <h2 className={"text-4xl font-semibold"}>Advantages</h2>
                </div>

                <p className={"text-muted-foreground tracking-tight"}>There is no advantages yet.</p>
                <InstitutionAdvantagesForm data={institution.advantages} id={institution.id} />
            </div>
        )
    }

    return (
        <>
            <div className={"flex justify-between"}>
                <h2 className={"text-4xl font-semibold"}>Advantages</h2>
            </div>

            <InstitutionAdvantagesView advantages={advantages} />
            <InstitutionAdvantagesForm data={institution.advantages} id={institution.id} />

        </>
    );
};

export default InstitutionAdvantagesAdminView;