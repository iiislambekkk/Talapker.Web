"use client";

import React, {useEffect, useState} from 'react';
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
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {PenIcon, SparklesIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import {
    InstitutionDescriptionSchema,
    InstitutionDescriptionSchemaInputType, InstitutionDescriptionSchemaOutputType
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/changeInstitutionDescriptionSchema";
import createMultiLingualFormConfig from "@/lib/lang/createMultiLingualFormConfig";
import RichTextEditor from "@/components/richTextEditor/Editor";

export const ChangeInstitutionDescriptionForm = ({data} : {data: InstitutionAdminDto}) => {
    const t = useTranslations();
    const [lang] = useLang()
    const [isPending, setIsPending] = useState<boolean>(false);
    const {data: session} = useSession()
    const queryClient = getQueryClient()
    const [open, setOpen] = React.useState(false);

    const form = useForm<InstitutionDescriptionSchemaInputType, InstitutionDescriptionSchemaOutputType>({
        resolver: zodResolver(InstitutionDescriptionSchema),
        defaultValues: {
            description: {
                kk: "",
                ru: "",
                en: ""
            }
        },
    });

    const LANGUAGES = createMultiLingualFormConfig("Description", "Description")

    useEffect(() => {
        form.setValue("description", data.description)
    }, [data])

    const onSubmit = async (values: InstitutionDescriptionSchemaOutputType) => {
        setIsPending(true);

        try {
            const api = createApi(session?.accessToken)
            console.log({id: data.id, ...values})

            await api.put(`/institutions/${data.id}/edit/description`, {id: data.id, ...values})

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

    const translateHandle = async (text: string, shouldImprove: boolean) => {
        setIsPending(true);

        const apiCall = async () => {
            try {
                const api = createApi(session?.accessToken)

                const res = await api.post(`/translate`, {text, shouldImprove})

                console.log("res: ", res.data)
                form.setValue("description", res.data)
            }
            catch (error : any) {
                handleApiError(error, t, LocalizationKeys.Errors.UnknownError)
            }
            finally {
                setIsPending(false);
            }
        }

        toast.promise(apiCall, {
            loading: t(LocalizationKeys.Messages.Translation.Loading),
            success: () => t(LocalizationKeys.Messages.Translation.Success),
            error: () => t(LocalizationKeys.Errors.TranslationFailed)
        });
    }

    return (
        <div className={"w-full"}>

            <div className={"flex justify-end"}>
                {!open && (
                    <Button onClick={() => setOpen(true)} className={"h-12 px-2"}>
                        <PenIcon className={"size-6"}/>
                        {t(LocalizationKeys.Actions.Edit)} {t(LocalizationKeys.AdminDashBoard.Description)}
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
                        {LANGUAGES.map((lang) => (
                            <Controller
                                disabled={isPending}
                                key={lang.code}
                                name={`description.${lang.code}` as Path<InstitutionDescriptionSchemaInputType>}
                                control={form.control}
                                render={({ field, fieldState } : {field: any, fieldState: any}) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>{lang.label}</FieldLabel>
                                        <RichTextEditor field={field} />
                                        <div className={"flex gap-2 justify-end"}>
                                            <Button
                                                disabled={isPending}
                                                type={"button"}
                                                variant={"indigo"}
                                                onClick={() => translateHandle(field.value, false)}
                                            >
                                                <SparklesIcon/>
                                                {t(LocalizationKeys.Actions.Translate)}
                                            </Button>
                                            <Button
                                                disabled={isPending}
                                                variant={"teal"}
                                                type={"button"}
                                                onClick={() => translateHandle(field.value, true)}
                                            >
                                                <SparklesIcon/>
                                                {t(LocalizationKeys.Actions.TranslateAndImprove)}
                                            </Button>
                                        </div>
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        ))}
                    </FieldGroup>

                    <div className={"flex justify-end mt-10 gap-3"}>
                        <Button
                            disabled={isPending}
                            variant={"outline"} onClick={() => {
                            setOpen(false)
                            form.setValue("description", data.description)
                        }} type="submit">
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

export default ChangeInstitutionDescriptionForm;