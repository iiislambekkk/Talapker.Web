import React from 'react';
import {useLang} from "@/hooks/useLang";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";

const InstitutionAdvantagesAdminView =  ({institution} : {institution: InstitutionAdminDto}) => {
    const [lang] = useLang()


    return (
        <div>
            Avdantages
        </div>
    );
};

export default InstitutionAdvantagesAdminView;