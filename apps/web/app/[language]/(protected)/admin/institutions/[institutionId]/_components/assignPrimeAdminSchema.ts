import {z} from "zod";

export const institutionTypes = ["University", "College"]

export const assignPrimeAdminSchema = z.object({
    email: z.email()
})

export type AssignPrimeAdminSchemaInput = z.input<typeof assignPrimeAdminSchema>
export type AssignPrimeAdminSchemaOutput = z.output<typeof assignPrimeAdminSchema>