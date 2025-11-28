"use client";

import React, {useEffect, useTransition} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";
import {useForm, Controller, Path} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DrawerForm } from "@/components/DrawerForm";
import {
    InstitutionGeneralInfoSchemaInputType,
    InstitutionGeneralInfoSchemaOutputType,
    InstitutionGeneralInfoSchema, institutionTypes,
} from "@/app/[language]/(protected)/admin/institutions/_components/createInstitutionSchema";

import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";

import { Input } from "@workspace/ui/components/input";
import {createApi} from "@/lib/axios";
import {useLang} from "@/hooks/useLang";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@workspace/ui/components/select";
import axios from "axios";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import {allInstitutionsShortOptions} from "@/lib/tanstackQuery/options/allInstitutionsShortOptions";
import Uploader from "@/components/fileUploader/Uploader";
import {InstitutionDto} from "@/Data/models/InstitutionDto";
import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";
import LocalizationKeys from "@/i18n/messages/LocalizationKeys";
import {PenIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import {badgeVariants} from "@workspace/ui/components/badge";

export const ChangeInstitutionGeneralInfoForm = ({data} : {data: InstitutionAdminDto}) => {
    const t = useTranslations();
    const lang = useLang()
    const [isPending, startPending] = useTransition();
    const {data: session} = useSession()
    const queryClient = getQueryClient()
    const [open, setOpen] = React.useState(false);

    const form = useForm<InstitutionGeneralInfoSchemaInputType, InstitutionGeneralInfoSchemaOutputType>({
        resolver: zodResolver(InstitutionGeneralInfoSchema),
        defaultValues: {
            name: data.name,
            nationalCode: data.nationalCode,
            type: data.type,
            fileKey: data.logoKey
        },
    });

    const LANGUAGES = [
        { code: "en", label: "Name in English", placeholder: "Al-Farabi Kazakh National University" },
        { code: "kk", label: "Қазақша атауы", placeholder: "Әл-Фараби атындағы Қазақ ұлттық университеті"},
        { code: "ru", label: "Название на русском", placeholder: "Казахский Национальный Университет имени Аль-Фараби" },
    ];

    useEffect(() => {
        form.setValue("name", data.name)
        form.setValue("nationalCode", data.nationalCode ?? 0)
        form.setValue("type", data.type)
        form.setValue("fileKey", data.logoKey)
    }, [data])

    const onSubmit = async (values: InstitutionGeneralInfoSchemaOutputType) => {
        try {
            const api = createApi(session?.accessToken)

            await api.put(`/institutions/${data.id}/edit/general-info`, {id: data.id, ...values})

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
            trigger={<Button variant={"blue"}><PenIcon className={"size-4"}/> {t(LocalizationKeys.AdminDashBoard.UpdateInstitutionInfo)} </Button>}
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
                            name={`name.${lang.code}` as Path<InstitutionGeneralInfoSchemaInputType>}
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={!!fieldState.error}>
                                    <FieldLabel>{lang.label}</FieldLabel>
                                     { /* @ts-ignore */ }
                                    <Input {...field} placeholder={lang.placeholder} />
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    ))}

                    <Controller
                        name={"nationalCode"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>{t(LocalizationKeys.AdminDashBoard.NationalCode)}</FieldLabel>
                                { /* @ts-ignore */ }
                                <Input
                                    {...field}
                                    placeholder={"0"}
                                    type={"number"}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name={"type"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Type</FieldLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder={"Select type"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />


                    <Controller
                        name={"fileKey"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Institution logo</FieldLabel>
                                <Uploader value={field.value} onChange={field.onChange}
                                          fileTypeAccepted={'image'}
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                </FieldGroup>

                <div className={"flex justify-end mb-10"}>
                    <Button className={""} type="submit">{t(LocalizationKeys.AdminDashBoard.Update)}</Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default ChangeInstitutionGeneralInfoForm;