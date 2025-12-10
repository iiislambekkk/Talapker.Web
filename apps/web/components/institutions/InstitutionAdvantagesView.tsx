import React from 'react';
import {InstitutionAdvantageDto} from "@/Data/models/InstitutionAdvantageDto";
import {Card, CardContent, CardHeader, CardTitle} from "@workspace/ui/components/card";

const InstitutionAdvantagesView = ({advantages} : {advantages: InstitutionAdvantageDto[]}) => {
    return (
        <>
            {advantages.map(advantage => (
                <Card className={"w-full lg:w-1/3 xl:w-[300px]"} key={advantage.id}>
                    <CardHeader>
                        <CardTitle>{advantage.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {advantage.description}
                    </CardContent>
                </Card>
            ))}
        </>
    );
};

export default InstitutionAdvantagesView;