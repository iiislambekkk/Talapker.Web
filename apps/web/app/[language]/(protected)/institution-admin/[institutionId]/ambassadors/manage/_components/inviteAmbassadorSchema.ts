import {z} from "zod";

export const inviteAmbassadorSchema = z.object({
    email: z.string().email("Invalid email address"),
    tenantId: z.string().uuid()
})

export type InviteAmbassadorSchemaInput = z.input<typeof inviteAmbassadorSchema>
export type InviteAmbassadorSchemaOutput = z.output<typeof inviteAmbassadorSchema>