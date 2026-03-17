"use client"
import React from 'react';
import {useProspectStore} from "@/lib/stores/prospectStore";
import {TalapkerChatWidget} from "@/app/[language]/(widget)/widget-chat/_components/TalapkerChatWidget";
import {useLang} from "@/hooks/useLang";

const Page = () => {
    const store = useProspectStore()
    const [lang] = useLang()

    return (
        <div>
            <TalapkerChatWidget
                institutionId={store.selectedInstitutionId!}
                lang={lang}
            />
        </div>
    );
};

export default Page;