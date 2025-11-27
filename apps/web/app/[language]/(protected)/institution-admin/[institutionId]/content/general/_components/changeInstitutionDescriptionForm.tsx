"use client";

import React, {useEffect, useTransition} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";
import {useForm, Controller, Path} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DrawerForm } from "@/components/DrawerForm";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {createApi} from "@/lib/axios";
import {useLang} from "@/hooks/useLang";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import {allInstitutionsShortOptions} from "@/lib/tanstackQuery/options/allInstitutionsShortOptions";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {PenIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import {
    InstitutionDescriptionSchema,
    InstitutionDescriptionSchemaInputType, InstitutionDescriptionSchemaOutputType
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/general/_components/changeInstitutionDescriptionSchema";
import createMultiLingualFormConfig from "@/lib/lang/createMultiLingualFormConfig";
import RichTextEditor from "@/components/richTextEditor/Editor";

export const ChangeInstitutionDescriptionForm = ({data} : {data: InstitutionAdminDto}) => {
    const t = useTranslations();
    const lang = useLang()
    const [isPending, startPending] = useTransition();
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
        try {
            const api = createApi(session?.accessToken)
            console.log({id: data.id, ...values})

            await api.put(`/institutions/${data.id}/edit/description`, {id: data.id, ...values})

            toast.success(t(LocalizationKeys.AdminDashBoard.UniversityCreated));
            form.reset()
            setOpen(false);

            await queryClient.invalidateQueries({queryKey: allInstitutionsShortOptions.queryKey})
        }
        catch (error : any) {
            handleApiError(error, t, LocalizationKeys.Prefixes.AdminDashBoard)
        }
    }


    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button className={"h-12 px-2"}><PenIcon className={"size-6"}/> {t(LocalizationKeys.AdminDashBoard.UpdateInstitutionInfo)} </Button>}
            title={t(LocalizationKeys.AdminDashBoard.UpdateInstitutionInfo)}
            description={t(LocalizationKeys.AdminDashBoard.UpdateInstitutionInfoDescription)}
        >
            <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    {LANGUAGES.map((lang) => (
                    <Controller
                            key={lang.code}
                            name={`description.${lang.code}` as Path<InstitutionDescriptionSchemaInputType>}
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={!!fieldState.error}>
                                    <FieldLabel>{lang.label}</FieldLabel>
                                    <RichTextEditor field={field} />
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    ))}
                </FieldGroup>

                <div className={"flex justify-end mb-10"}>
                    <Button className={""} type="submit">{t(LocalizationKeys.AdminDashBoard.Update)}</Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default ChangeInstitutionDescriptionForm;