"use client";

import React, {useState} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";
import {useForm, Controller, Path} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import {createApi} from "@/lib/axios";
import {useLang} from "@/hooks/useLang";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import {allInstitutionsShortOptions} from "@/lib/tanstackQuery/options/allInstitutionsShortOptions";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {PenIcon, SparklesIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import createMultiLingualFormConfig from "@/lib/lang/createMultiLingualFormConfig";
import {InstitutionAdvantageAdminDto} from "@/Data/models/InstitutionAdvantageAdminDto";
import {
    InstitutionAdvantagesSchema, InstitutionAdvantagesSchemaInputType, InstitutionAdvantagesSchemaOutputType
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/InstitutionAdvantagesSchema";
import { Input } from '@workspace/ui/components/input';

export const InstitutionAdvantagesForm = ({data, id} : {data: InstitutionAdvantageAdminDto[], id: string}) => {
    const t = useTranslations();
    const [lang] = useLang()
    const [isPending, setIsPending] = useState<boolean>(false);
    const {data: session} = useSession()
    const queryClient = getQueryClient()
    const [open, setOpen] = React.useState(false);

    const form = useForm<InstitutionAdvantagesSchemaInputType, InstitutionAdvantagesSchemaOutputType>({
        resolver: zodResolver(InstitutionAdvantagesSchema),
        defaultValues: {
            advantages: data.map(advantage => ({
                title: advantage.title,
                description: advantage.description
            }))
        }
    });

    const LANGUAGES = createMultiLingualFormConfig("Advantage", "Advantage")

    const onSubmit = async (values: InstitutionAdvantagesSchemaOutputType) => {
        setIsPending(true);

        try {
            const api = createApi(session?.accessToken)

            await api.put(`/institutions/${id}/edit/advantages`, {id: id, ...values})

            toast.success(t(LocalizationKeys.Messages.Description.UpdateSuccess));
            form.reset()
            setOpen(false);

            await queryClient.invalidateQueries({queryKey: allInstitutionsShortOptions.queryKey})
        }
        catch (error : any) {
            handleApiError(error, t, LocalizationKeys.Prefixes.AdminDashBoard)
        }
        finally {
            setIsPending(false);
        }
    }

    const advantages = form.watch("advantages") || [];

    return (
        <div className={"w-full"}>

            <div className={"flex justify-end"}>
                {!open && (
                    <Button onClick={() => setOpen(true)} className={"h-12 px-2"}>
                        <PenIcon className={"size-6"}/>
                        Edit advantages
                    </Button>
                )}
            </div>


            {open && (
                <form
                    className="space-y-6 bg-card p-5 rounded-2xl"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <p className={"text-4xl font-normal"}>
                        {lang == "kk" && (
                            t(LocalizationKeys.AdminDashBoard.Description) + " " + t(LocalizationKeys.Actions.Edit).toLowerCase()
                        )}
                        {lang != "kk" && (
                            t(LocalizationKeys.Actions.Edit) + " " + t(LocalizationKeys.AdminDashBoard.Description).toLowerCase()
                        )}
                    </p>
                    <FieldGroup className={"p-0 m-0"}>

                        {/* Render each advantage */}
                        {advantages.map((_, index) => (
                            <FieldGroup key={index} className={"p-0 m-0 mb-6"}>
                                <p className="text-lg font-semibold mb-4">
                                    {t(LocalizationKeys.AdminDashBoard.Description)} #{index + 1}
                                </p>

                                {LANGUAGES.map((langItem) => (
                                    <Controller
                                        disabled={isPending}
                                        key={`${index}-${langItem.code}`}
                                        name={`advantages.${index}.title.${langItem.code}` as const}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Title {langItem.code}:</FieldLabel>
                                                <Input {...field} />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                ))}

                                {LANGUAGES.map((langItem) => (
                                    <Controller
                                        disabled={isPending}
                                        key={`${index}-${langItem.code}`}
                                        name={`advantages.${index}.description.${langItem.code}` as const}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Description {langItem.code}:</FieldLabel>
                                                <Input {...field} />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                ))}
                            </FieldGroup>
                        ))}

                        <Button
                            onClick={() => form.setValue("advantages", [...form.getValues("advantages"), {
                                title: {
                                    kk: "",
                                    ru: "",
                                    en: ""
                                },
                                description: {
                                    kk: "",
                                    ru: "",
                                    en: ""
                                }
                            }])}
                            disabled={isPending}
                            className={""} type="button">
                            Add new
                        </Button>
                    </FieldGroup>

                    <div className={"flex justify-end mt-10 gap-3"}>
                        <Button
                            disabled={isPending}
                            onClick={() => {
                                form.reset()
                                setOpen(false)
                            }}
                            className={""} type="button">
                            {t(LocalizationKeys.Actions.Close)}
                        </Button>

                        <Button
                            disabled={isPending}
                            className={""} type="submit">
                            {t(LocalizationKeys.Actions.Save)}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default InstitutionAdvantagesForm;