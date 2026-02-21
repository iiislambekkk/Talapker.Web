"use client";

import React, {useEffect, useTransition} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useTranslations } from "next-intl";
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
import {createApi} from "@/lib/axios";
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import {getQueryClient} from "@/lib/tanstackQuery/getQueryClient";
import Uploader from "@/components/fileUploader/Uploader";
import {PenIcon} from "lucide-react";
import {handleApiError} from "@/lib/handleApiError";
import {
    facultiesQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/departments/_components/facultiesQueryOptions";
import {Faculty, FacultyDto} from "@/Data/models/Faculty";

const changeFacultySchema = z.object({
    nameKk: z.string().min(1, "Қазақша атауы міндетті"),
    nameRu: z.string().min(1, "Название на русском обязательно"),
    nameEn: z.string().min(1, "English name is required"),
    logoUrl: z.string().optional(),
    wallPaperUrl: z.string().optional(),
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
    const t = useTranslations();

    const form = useForm<ChangeFacultyFormData>({
        resolver: zodResolver(changeFacultySchema),
        defaultValues: {
            nameKk: faculty.name.kk || "",
            nameRu: faculty.name.ru || "",
            nameEn: faculty.name.en || "",
            logoUrl: faculty.logoUrl || "",
            wallPaperUrl: faculty.wallPaperUrl || "",
        },
    });

    useEffect(() => {
        form.reset({
            nameKk: faculty.name.kk || "",
            nameRu: faculty.name.ru || "",
            nameEn: faculty.name.en || "",
            logoUrl: faculty.logoUrl || "",
            wallPaperUrl: faculty.wallPaperUrl || "",
        });
    }, [faculty, form]);

    const onSubmit = async (values: ChangeFacultyFormData) => {
        const apiCall = async () => {
            try {
                const api = createApi();
                const headers = {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    }
                };

                const command = {
                    id: faculty.id,
                    name: {
                        kk: values.nameKk,
                        ru: values.nameRu,
                        en: values.nameEn
                    },
                    logoUrl: values.logoUrl,
                    wallPaperUrl: values.wallPaperUrl
                };

                await api.put("/api/faculties/change", command, headers);

                toast.success("Факультет сәтті жаңартылды!");
                setOpen(false);
                await queryClient.invalidateQueries({queryKey: facultiesQueryOptions(institutionId).queryKey});
            } catch (error: any) {
                handleApiError(error, t);
            }
        };

        startPending(apiCall);
    };

    const LANGUAGES = [
        { code: "kk", label: "Атауы (Қазақша)", placeholder: "Информатика факультеті" },
        { code: "ru", label: "Название (Русский)", placeholder: "Факультет информатики" },
        { code: "en", label: "Name (English)", placeholder: "Faculty of Computer Science" },
    ];

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
                    {LANGUAGES.map((lang) => (
                        <Controller
                            key={lang.code}
                            name={`name${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}` as any}
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={!!fieldState.error}>
                                    <FieldLabel>{lang.label}</FieldLabel>
                                    <Input {...field} placeholder={lang.placeholder} />
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    ))}

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

                    <Controller
                        name="wallPaperUrl"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Фон суреті / Wallpaper</FieldLabel>
                                <Uploader
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    fileTypeAccepted="image"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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