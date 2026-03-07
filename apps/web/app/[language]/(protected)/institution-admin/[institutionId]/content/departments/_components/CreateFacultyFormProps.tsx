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
import {facultiesQueryOptions} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {Languages} from "lucide-react";
import {logger} from "@/lib/logger";

type Lang = "ru" | "kk" | "en";

const t = {
    trigger:     { ru: "Новый факультет",                       kk: "Жаңа факультет",                        en: "New Faculty"                          },
    title:       { ru: "Добавить факультет",                    kk: "Жаңа факультет қосу",                   en: "Add Faculty"                          },
    description: { ru: "Введите название факультета на трёх языках", kk: "Факультет атауын үш тілде енгізіңіз", en: "Enter faculty name in three languages" },
    cancel:      { ru: "Отмена",                                kk: "Болдырмау",                              en: "Cancel"                               },
    submit:      { ru: "Добавить",                              kk: "Қосу",                                   en: "Add"                                  },
    submitting:  { ru: "Добавляется...",                        kk: "Қосылуда...",                            en: "Adding..."                            },
    success:     { ru: "Факультет успешно добавлен!",           kk: "Факультет сәтті қосылды!",               en: "Faculty added successfully!"          },
    langLabel:   { ru: "Языки",                                 kk: "Тілдер",                                 en: "Languages"                            },
    colorLabel:  { ru: "Цвет",                                  kk: "Түсі",                                   en: "Color"                                },
} as const;

const LANGUAGE_TABS = [
    { code: "kk", label: "Қазақша", flag: "🇰🇿", fieldLabel: "Атауы",    placeholder: "Информатика факультеті"      },
    { code: "ru", label: "Русский",  flag: "🇷🇺", fieldLabel: "Название", placeholder: "Факультет информатики"       },
    { code: "en", label: "English",  flag: "🇬🇧", fieldLabel: "Name",     placeholder: "Faculty of Computer Science" },
];

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

const createFacultySchema = z.object({
    nameKk: z.string().min(1, "Қазақша атауы міндетті"),
    nameRu: z.string().min(1, "Название на русском обязательно"),
    nameEn: z.string().min(1, "English name is required"),
    color:  z.string().min(1, "Color is required"),
});

type CreateFacultyFormData = z.infer<typeof createFacultySchema>;

interface CreateFacultyFormProps {
    institutionId: string;
}

export const CreateFacultyForm = ({institutionId}: CreateFacultyFormProps) => {
    const [isPending, startPending] = useTransition();
    const {data: session} = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const [lang] = useLang();
    const [activeTab, setActiveTab] = useState("kk");

    const l: Lang = (lang as Lang) in t.trigger ? (lang as Lang) : "en";

    const form = useForm<CreateFacultyFormData>({
        resolver: zodResolver(createFacultySchema),
        defaultValues: { nameKk: "", nameRu: "", nameEn: "", color: "blue" },
    });

    const handleClose = () => {
        setOpen(false);
        setActiveTab("kk");
        form.reset();
    };

    const onSubmit = async (values: CreateFacultyFormData) => {
        const apiCall = async () => {
            try {
                logger.log("[CreateFaculty] Submitting:", values);

                const api = createApi();
                await api.post<BaseApiResponse>("/api/faculties/create", {
                    institutionId,
                    name: { kk: values.nameKk, ru: values.nameRu, en: values.nameEn },
                    color: values.color,
                }, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                });

                logger.log("[CreateFaculty] Success");
                toast.success(t.success[l]);
                handleClose();
                await queryClient.invalidateQueries({queryKey: facultiesQueryOptions(institutionId).queryKey});
            } catch (error: any) {
                logger.error("[CreateFaculty] Error:", error);
            }
        };
        startPending(apiCall);
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button>{t.trigger[l]}</Button>}
            title={t.title[l]}
            description={t.description[l]}
        >
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>

                    {/* Name tabs */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Languages className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t.langLabel[l]}</span>
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

                    {/* Color picker */}
                    <Controller
                        name="color"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>{t.colorLabel[l]}</FieldLabel>
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

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        {t.cancel[l]}
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? t.submitting[l] : t.submit[l]}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default CreateFacultyForm;