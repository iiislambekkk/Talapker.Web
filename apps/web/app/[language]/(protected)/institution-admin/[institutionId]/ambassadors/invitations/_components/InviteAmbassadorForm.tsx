"use client";

import React, { useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DrawerForm } from "@/components/DrawerForm";
import {
    inviteAmbassadorSchema,
    InviteAmbassadorSchemaInput,
    InviteAmbassadorSchemaOutput,
} from "./inviteAmbassadorSchema";

import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";

import { Input } from "@workspace/ui/components/input";
import { createApi } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { ambassadorsQueryOptions } from "@/lib/tanstackQuery/options/ambassadorsQueryOptions";
import { BaseApiResponse } from "@/Data/models/ApiResponse";
import { handleApiError } from "@/lib/handleApiError";
import { useTranslations } from "next-intl";
import { logger } from "@/lib/logger";
import {
    invitationsQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/ambassadors/invitations/page";

interface InviteAmbassadorFormProps {
    institutionId: string;
}

export const InviteAmbassadorForm = ({ institutionId }: InviteAmbassadorFormProps) => {
    const [isPending, startPending] = useTransition();
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [open, setOpen] = React.useState(false);
    const t = useTranslations();

    const form = useForm<InviteAmbassadorSchemaInput, unknown, InviteAmbassadorSchemaOutput>({
        resolver: zodResolver(inviteAmbassadorSchema),
        defaultValues: {
            email: "",
            tenantId: institutionId,
            role: "TenantAmbassador",
        },
    });

    const onSubmit = async (values: InviteAmbassadorSchemaOutput) => {
        const apiCall = async () => {
            try {
                const api = createApi();

                const payload = {
                    ...values,
                    invitedByUserId: session?.user?.sub,
                };

                logger.log("[InviteAmbassadorForm] submitting", payload);

                await api.post<BaseApiResponse>(
                    "/api/user/invite",
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                        },
                    }
                );

                toast.success("Амбассадор сәтті шақырылды!");
                form.reset();
                setOpen(false);

                await queryClient.invalidateQueries({
                    queryKey: invitationsQueryOptions(institutionId).queryKey,
                });
            } catch (error: any) {
                logger.error("[InviteAmbassadorForm] invite failed", error);
                handleApiError(error, t);
            }
        };

        startPending(apiCall);
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={<Button>Амбассадор шақыру</Button>}
            title="Амбассадор шақыру"
            description="Амбассадор болуға шақыру жіберу"
        >
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={!!fieldState.error}>
                                <FieldLabel>Email</FieldLabel>
                                <Input
                                    {...field}
                                    placeholder="ambassador@university.edu"
                                    type="email"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.error && (
                                    <FieldError>{fieldState.error.message}</FieldError>
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Болдырмау
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Жіберілуде..." : "Шақыру жіберу"}
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
};

export default InviteAmbassadorForm;