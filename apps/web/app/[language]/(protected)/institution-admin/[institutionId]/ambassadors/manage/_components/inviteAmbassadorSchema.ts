import { z } from "zod";

export const inviteAmbassadorSchema = z.object({
    email: z.string().email("Жарамды email енгізіңіз"),
    tenantId: z.string().uuid(),
    role: z.literal("TenantAmbassador").default("TenantAmbassador"),
});

export type InviteAmbassadorSchemaInput = z.input<typeof inviteAmbassadorSchema>;
export type InviteAmbassadorSchemaOutput = z.output<typeof inviteAmbassadorSchema>;