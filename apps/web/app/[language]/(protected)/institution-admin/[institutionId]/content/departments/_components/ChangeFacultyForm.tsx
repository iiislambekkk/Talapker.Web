"use client";

import React, {useEffect, useTransition, useState} from 'react';
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
import Uploader from "@/components/fileUploader/Uploader";
import {Languages, PenIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import {facultiesQueryOptions} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {FacultyDto} from "@/Data/models/Faculty";
import {logger} from "@/lib/logger";

const COLORS = [
    { key: "blue",   class: "bg-blue-500"   },
    { key: "purple", class: "bg-purple-500" },
    { key: "teal",   class: "bg-teal-500"   },
    { key: "orange", class: "bg-orange-500" },
    { key: "yellow", class: "bg-yellow-500" },
    { key: "pink",   class: "bg-pink-500"   },
    { key: "red",    class: "bg-red-500"    },
    { key: "indigo", class: "bg-indigo-500" },
    { key: "green",  class: "bg-green-500"  },
];

const LANGUAGE_TABS = [
    { code: "kk", label: "Қазақша", flag: "🇰🇿", fieldLabel: "Атауы",    placeholder: "Информатика факультеті"     },
    { code: "ru", label: "Русский",  flag: "🇷🇺", fieldLabel: "Название", placeholder: "Факультет информатики"      },
    { code: "en", label: "English",  flag: "🇬🇧", fieldLabel: "Name",     placeholder: "Faculty of Computer Science" },
];

const changeFacultySchema = z.object({
    nameKk: z.string().min(1, "Қазақша атауы міндетті"),
    nameRu: z.string().min(1, "Название на русском обязательно"),
    nameEn: z.string().min(1, "English name is required"),
    logoUrl: z.string().optional(),
    color: z.string().min(1, "Color is required"),
});

type ChangeFacultyFormData = z.infer<typeof changeFacultySchema>;

interface ChangeFacultyFormProps {
    faculty: FacultyDto;
    institutionId: string;
}

export const ChangeFacultyForm = ({faculty, institutionId}: ChangeFacultyFormProps) => {
    const [isPending, startPending] = useTransition();
    const {data: session} = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = useState("kk");

    const form = useForm<ChangeFacultyFormData>({
        resolver: zodResolver(changeFacultySchema),
        defaultValues: {
            nameKk:  faculty.name.kk  || "",
            nameRu:  faculty.name.ru  || "",
            nameEn:  faculty.name.en  || "",
            logoUrl: faculty.logoUrl  || "",
            color:   faculty.color    || "blue",
        },
    });

    useEffect(() => {
        form.reset({
            nameKk:  faculty.name.kk  || "",
            nameRu:  faculty.name.ru  || "",
            nameEn:  faculty.name.en  || "",
            logoUrl: faculty.logoUrl  || "",
            color:   faculty.color    || "blue",
        });
    }, [faculty, form]);

    const onSubmit = async (values: ChangeFacultyFormData) => {
        const apiCall = async () => {
            try {
                logger.log("[ChangeFaculty] Submitting:", faculty.id, values);

                const api = createApi(session?.accessToken);
                await api.put("/api/faculties/change", {
                    id: faculty.id,
                    name: { kk: values.nameKk, ru: values.nameRu, en: values.nameEn },
                    logoUrl: values.logoUrl,
                    color: values.color,
                }, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                });

                logger.log("[ChangeFaculty] Success:", faculty.id);
                toast.success("Факультет сәтті жаңартылды!");
                setOpen(false);
                await queryClient.invalidateQueries({queryKey: facultiesQueryOptions(institutionId).queryKey});
            } catch (error: any) {
                logger.error("[ChangeFaculty] Error:", error);
            }
        };
        startPending(apiCall);
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button variant="outline" size="sm"><PenIcon className="size-4 mr-2" /> Өңдеу</Button>}
            title="Факультетті өңдеу"
            description="Факультет ақпаратын жаңарту"
        >
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>

                    {/* Name tabs */}
                    <div>
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
                                                <FieldLabel>{tab.fieldLabel}</FieldLabel>
                                                <Input {...field} placeholder={tab.placeholder} />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    {/* Logo */}
                    <Controller
                        name="logoUrl"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Логотип</FieldLabel>
                                <Uploader
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    fileTypeAccepted="image"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    {/* Color picker */}
                    <Controller
                        name="color"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Түсі / Цвет / Color</FieldLabel>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.key}
                                            type="button"
                                            onClick={() => field.onChange(color.key)}
                                            className={`
                                                w-8 h-8 rounded-full transition-all duration-150
                                                ${color.class}
                                                ${field.value === color.key
                                                ? "ring-2 ring-offset-2 ring-foreground scale-110"
                                                : "opacity-60 hover:opacity-100 hover:scale-105"
                                            }
                                            `}
                                        />
                                    ))}
                                </div>
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => {
                        setOpen(false);
                        setActiveTab("kk");
                    }}>
                        Болдырмау
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Сақталуда..." : "Сақтау"}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default ChangeFacultyForm;