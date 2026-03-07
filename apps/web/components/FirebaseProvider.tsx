import React, {useEffect} from 'react';
import {useSession} from "next-auth/react";
import {useFirebaseMessaging} from "@/hooks/useFirebaseMessaging";

const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {

    const {data: session} = useSession();
    const { subscribe, listenForeground } = useFirebaseMessaging();

    useEffect(() => {
        console.log(session)

        const setupFirebaseMessaging = async () => {
            if (session?.user?.sub && session?.accessToken) {
                localStorage.setItem("notifyUserId", session.user.sub);
                await subscribe(session.user.sub, session.accessToken);
            }
        };

        setupFirebaseMessaging();

        let unsubscribe= () => {}

        if (session?.user?.sub && session?.accessToken) {
            unsubscribe = listenForeground();
        }

        return () => unsubscribe();
    }, [session, subscribe]);


    return (
        <>
            {children}
        </>
    );
};

export default FirebaseProvider;