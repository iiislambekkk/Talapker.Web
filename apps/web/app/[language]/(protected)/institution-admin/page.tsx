"use client"
import React, {useEffect} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string}
    const router = useRouter();
    const {data: session, status} = useSession()

    useEffect(() => {
        if (!institutionId && status == "authenticated") {
            router.push(`/institution-admin/${session?.user.tenantId!}/content/general`)
        }
    }, [status]);


    return (
        <div>
            {institutionId}
        </div>
    );
};

export default Page;