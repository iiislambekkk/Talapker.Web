"use client";

import React, {useState} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";
import {useForm, Controller, useFieldArray} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { createApi } from "@/lib/axios";
import { useLang } from "@/hooks/useLang";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { allInstitutionsShortOptions } from "@/lib/tanstackQuery/options/allInstitutionsShortOptions";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import { PenIcon, PlusCircle, Languages, X } from "lucide-react";
import { handleApiError } from "@/lib/handleApiError";
import { InstitutionAdvantageAdminDto } from "@/Data/models/InstitutionAdvantageAdminDto";
import {
    InstitutionAdvantagesSchema, InstitutionAdvantagesSchemaInputType, InstitutionAdvantagesSchemaOutputType
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/InstitutionAdvantagesSchema";
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';

export const InstitutionAdvantagesForm = ({data, id} : {data: InstitutionAdvantageAdminDto[], id: string}) => {
    const t = useTranslations();
    const [lang] = useLang()
    const [isPending, setIsPending] = useState<boolean>(false);
    const {data: session} = useSession()
    const queryClient = getQueryClient()
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = useState("kk");

    const form = useForm<InstitutionAdvantagesSchemaInputType, InstitutionAdvantagesSchemaOutputType>({
        resolver: zodResolver(InstitutionAdvantagesSchema),
        defaultValues: {
            advantages: data.map(advantage => ({
                title: advantage.title,
                description: advantage.description
            }))
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "advantages"
    });

    const LANGUAGE_TABS = [
        { code: "kk", label: "Қазақша", flag: "🇰🇿" },
        { code: "ru", label: "Русский", flag: "🇷🇺" },
        { code: "en", label: "English", flag: "🇬🇧" },
    ];

    const onSubmit = async (values: InstitutionAdvantagesSchemaOutputType) => {
        setIsPending(true);

        try {
            const api = createApi(session?.accessToken)

            await api.put(`/institutions/${id}/edit/advantages`, {id: id, ...values})

            toast.success(t(LocalizationKeys.Messages.Description.UpdateSuccess));
            form.reset()
            setOpen(false);
            setActiveTab("kk");

            await queryClient.invalidateQueries({queryKey: allInstitutionsShortOptions.queryKey})
        }
        catch (error : any) {
            handleApiError(error, t, LocalizationKeys.Prefixes.AdminDashBoard)
        }
        finally {
            setIsPending(false);
        }
    }

    return (
        <div className={"w-full"}>
            <div className={"flex justify-end"}>
                {!open && (
                    <Button onClick={() => setOpen(true)} className={"h-12 px-2"}>
                        <PenIcon className={"size-6 mr-2"}/>
                        Edit advantages
                    </Button>
                )}
            </div>

            {open && (
                <form
                    className="space-y-6 bg-card p-5 rounded-2xl"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <p className={"text-4xl font-normal mb-6"}>
                        {lang == "kk" ? (
                            t(LocalizationKeys.AdminDashBoard.Description) + " " + t(LocalizationKeys.Actions.Edit).toLowerCase()
                        ) : (
                            t(LocalizationKeys.Actions.Edit) + " " + t(LocalizationKeys.AdminDashBoard.Description).toLowerCase()
                        )}
                    </p>

                    <FieldGroup className={"p-0 m-0"}>
                        {/* Language Tabs */}
                        <div className="mb-6">
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
                            </Tabs>
                        </div>

                        {/* Advantages List */}
                        <div className="space-y-8">
                            {fields.map((field, index) => (
                                <div key={field.id} className="relative border rounded-lg p-6 bg-card/50">
                                    {/* Remove button */}
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 text-destructive hover:text-destructive"
                                            onClick={() => remove(index)}
                                            disabled={isPending}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <p className="text-lg font-semibold mb-4">
                                        {t(LocalizationKeys.AdminDashBoard.Description)} #{index + 1}
                                    </p>

                                    {/* Title fields for all languages - only active tab is visible */}
                                    {LANGUAGE_TABS.map((tab) => (
                                        <div key={`${index}-title-${tab.code}`} className={activeTab === tab.code ? 'block' : 'hidden'}>
                                            { /* @ts-ignore */ }
                                            <Controller disabled={isPending} name={`advantages.${index}.title.${tab.code}` as const}
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={!!fieldState.error} className="mb-4">
                                                        <FieldLabel>
                                                            {tab.flag} Title ({tab.label})
                                                        </FieldLabel>
                                                        { /* @ts-ignore */ }
                                                        <Input
                                                            {...field}
                                                            placeholder={`Enter title in ${tab.label}`}
                                                        />
                                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                    </Field>
                                                )}
                                            />
                                        </div>
                                    ))}

                                    {/* Description fields for all languages - only active tab is visible */}
                                    {LANGUAGE_TABS.map((tab) => (
                                        <div key={`${index}-desc-${tab.code}`} className={activeTab === tab.code ? 'block' : 'hidden'}>
                                            { /* @ts-ignore */ }
                                            <Controller disabled={isPending} name={`advantages.${index}.description.${tab.code}` as const}
                                                control={form.control}
                                                render={({ field, fieldState }) => (
                                                    <Field data-invalid={!!fieldState.error}>
                                                        <FieldLabel>
                                                            {tab.flag} Description ({tab.label})
                                                        </FieldLabel>
                                                        { /* @ts-ignore */ }
                                                        <Textarea
                                                            {...field}
                                                            placeholder={`Enter description in ${tab.label}`}
                                                            rows={3}
                                                        />
                                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                    </Field>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Add new advantage button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({
                                title: { kk: "", ru: "", en: "" },
                                description: { kk: "", ru: "", en: "" }
                            })}
                            disabled={isPending}
                            className="w-full mt-4"
                        >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add new advantage
                        </Button>
                    </FieldGroup>

                    {/* Form actions */}
                    <div className={"flex justify-end mt-10 gap-3"}>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => {
                                form.reset()
                                setOpen(false)
                                setActiveTab("kk")
                            }}
                        >
                            {t(LocalizationKeys.Actions.Close)}
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "Saving..." : t(LocalizationKeys.Actions.Save)}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InstitutionAdvantagesForm;