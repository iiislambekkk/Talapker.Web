"use client"

import React from 'react';
import Navbar from "@/app/[language]/(public)/_components/Navbar";
import Footer from "@/app/[language]/(public)/_components/Footer";

const Layout = ({children} : {children: React.ReactNode}) => {
    return (
        <div className={"px-2"} suppressHydrationWarning>
            <Navbar/>
            <main className={"container mx-auto px-4 md:px-6 lg:px-8 mb-32"}>
                {children}
            </main>
            {/*<Footer/>*/}
        </div>
    );
};

export default Layout;