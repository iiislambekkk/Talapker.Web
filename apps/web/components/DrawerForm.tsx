"use client";

import React from "react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@workspace/ui/components/drawer";
import {useIsMobile} from "@/hooks/use-mobile";

interface DrawerFormProps {
    trigger: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DrawerForm({ trigger, title, description, children, open, setOpen }: DrawerFormProps) {
    const isMobile = useIsMobile();

    return (
        <Drawer
            direction={isMobile ? "bottom" : "right"}
            open={open}
            onOpenChange={setOpen}
        >
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>

            <DrawerContent className={!isMobile ? "w-[600px] max-w-none" : ""}>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && (
                        <DrawerDescription>{description}</DrawerDescription>
                    )}
                </DrawerHeader>

                <div className="overflow-y-auto px-4 pb-12">
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
