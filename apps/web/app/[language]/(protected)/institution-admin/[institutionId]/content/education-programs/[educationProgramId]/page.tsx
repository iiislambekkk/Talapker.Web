"use client"
import React from 'react';
import {useParams} from "next/navigation";

const Page = () => {
    const {educationProgramId} = useParams() as {educationProgramId: string}

    return (
        <div>
            {educationProgramId}
        </div>
    );
};

export default Page;