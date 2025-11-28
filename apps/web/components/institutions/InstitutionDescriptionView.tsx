"use client"
import React, {useMemo} from 'react';
import StarterKit from "@tiptap/starter-kit";
import parse from "html-react-parser"
import {generateHTML} from "@tiptap/html"
import {cn} from "@workspace/ui/lib/utils";
import {JSONContent} from "@tiptap/react";

const InstitutionDescriptionView = ({description} : {description?: string}) => {

    let json = "{}" as any
    try {
        json = JSON.parse(description!)
    }
    catch (error) {
        return (
            <div className={cn(
                "rounded-lg min-h-[100px] p-4 border border-input focus:outline-none w-full",
                "dark:bg-input/30 shadow-xs transition-[color,box-shadow]",
                "prose prose-sm lg:prose-lg xl:prose-xl dark:prose-invert !w-full max-w-full overflow-hidden break-all"
            )}>
                Пусто
            </div>
        )
    }

    const output = useMemo(() => {
        return generateHTML(json as JSONContent, [
            StarterKit

        ])
    }, [json])

    return (
        <div className={cn(
            "rounded-lg min-h-[100px] p-4 border border-input focus:outline-none w-full",
            "dark:bg-input/30 shadow-xs transition-[color,box-shadow]",
            "prose prose-sm lg:prose-lg xl:prose-xl dark:prose-invert !w-full max-w-full overflow-hidden break-all"
        )}>
            {parse(output)}
        </div>
    );
};

export default InstitutionDescriptionView;