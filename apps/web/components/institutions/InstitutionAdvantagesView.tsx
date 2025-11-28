import React from 'react';
import {InstitutionAdvantageDto} from "@/Data/models/InstitutionAdvantageDto";

const InstitutionAdvantagesView = ({advantages} : {advantages: InstitutionAdvantageDto[]}) => {
    return (
        <>
            {advantages.map(advantage => (
                <div key={advantage.id}>

                </div>
            ))}
        </>
    );
};

export default InstitutionAdvantagesView;