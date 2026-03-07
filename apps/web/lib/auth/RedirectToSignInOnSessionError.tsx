"use client"

import {useEffect} from "react";
import {signIn, useSession} from "next-auth/react";


const RedirectToSignInOnSessionError = () => {
    const {data: session} = useSession()


    useEffect(() => {
        console.log(session)

        if (session?.error === "RefreshAccessTokenError") {
            // Redirect to signin when token refresh fails
            signIn("pharosIdentityServer", {
                callbackUrl: window.location.pathname,
            });
        }
    }, [session]);

    return <></>
};

export default RedirectToSignInOnSessionError;