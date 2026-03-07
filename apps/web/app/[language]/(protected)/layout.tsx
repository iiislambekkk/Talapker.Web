"use client"

import React, {useEffect} from 'react';
import {useSession} from "next-auth/react";
import {useFirebaseMessaging} from "@/hooks/useFirebaseMessaging";
import {SessionUpdaterProvider} from "@/app/[language]/(protected)/_components/SessionUpdaterProvider";


const Layout = ({children} : {children : React.ReactNode}) => {

    return (
        <>
            {children}
        </>
    );
};

export default Layout;