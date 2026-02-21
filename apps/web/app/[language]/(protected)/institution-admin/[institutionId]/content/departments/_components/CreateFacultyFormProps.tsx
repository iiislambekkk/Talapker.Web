"use client";

import React, {useTransition, useState} from 'react';
import { Button } from "@workspace/ui/components/button";
import {useForm, Controller} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DrawerForm } from "@/components/DrawerForm";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import {createApi} from "@/lib/axios";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import {BaseApiResponse} from "@/Data/models/ApiResponse";
import {handleApiError} from "@/lib/handleApiError";
import {useLang} from "@/hooks/useLang";
import {
    facultiesQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {useTranslations} from "next-intl";
import { Languages } from "lucide-react";

const createFacultySchema = z.object({
    nameKk: z.string().min(1, "Қазақша атауы міндетті"),
    nameRu: z.string().min(1, "Название на русском обязательно"),
    nameEn: z.string().min(1, "English name is required"),
});

type CreateFacultyFormData = z.infer<typeof createFacultySchema>;

interface CreateFacultyFormProps {
    institutionId: string;
}

export const CreateFacultyForm = ({institutionId}: CreateFacultyFormProps) => {
    const [isPending, startPending] = useTransition();
    const t = useTranslations();
    const {data: session} = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const [lang] = useLang();
    const [activeTab, setActiveTab] = useState("kk");

    const LANGUAGE_TABS = [
        { code: "kk", label: "Қазақша", flag: "🇰🇿" },
        { code: "ru", label: "Русский",  flag: "🇷🇺" },
        { code: "en", label: "English",  flag: "🇬🇧" },
    ];

    const form = useForm<CreateFacultyFormData>({
        resolver: zodResolver(createFacultySchema),
        defaultValues: {
            nameKk: "",
            nameRu: "",
            nameEn: "",
        },
    });

    const onSubmit = async (values: CreateFacultyFormData) => {
        const apiCall = async () => {
            try {
                const api = createApi();
                const headers = {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    }
                };

                const command = {
                    institutionId,
                    name: {
                        kk: values.nameKk,
                        ru: values.nameRu,
                        en: values.nameEn
                    }
                };

                await api.post<BaseApiResponse>("/api/faculties/create", command, headers);

                toast.success("Факультет сәтті қосылды!");
                form.reset();
                setOpen(false);
                setActiveTab("kk");
                await queryClient.invalidateQueries({queryKey: facultiesQueryOptions(institutionId).queryKey});
            } catch (error: any) {
                handleApiError(error, t);
            }
        };

        startPending(apiCall);
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button>Жаңа факультет</Button>}
            title="Жаңа факультет қосу"
            description="Факультет атауын үш тілде енгізіңіз"
        >
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Languages className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Тілдер / Languages</span>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                {LANGUAGE_TABS.map((tab) => (
                                    <TabsTrigger key={tab.code} value={tab.code}>
                                        {tab.flag} {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {LANGUAGE_TABS.map((tab) => (
                                <TabsContent key={tab.code} value={tab.code} className="space-y-4 mt-4">
                                    <Controller
                                        name={`name${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}` as any}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>
                                                    {tab.code === "kk" ? "Атауы" :
                                                        tab.code === "ru" ? "Название" :
                                                            "Name"}
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    placeholder={
                                                        tab.code === "kk" ? "Информатика факультеті" :
                                                            tab.code === "ru" ? "Факультет информатики" :
                                                                "Faculty of Computer Science"
                                                    }
                                                />
                                                {fieldState.error && (
                                                    <FieldError>{fieldState.error.message}</FieldError>
                                                )}
                                            </Field>
                                        )}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </FieldGroup>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                        setOpen(false);
                        setActiveTab("kk");
                        form.reset();
                    }}>
                        Болдырмау
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Қосылуда..." : "Қосу"}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default CreateFacultyForm;