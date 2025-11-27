import {z} from "zod";

let description = {}


export const InstitutionDescriptionSchema = z.object({
    description: z.object({
        en: z.string().min(3, {message: "Description must be at least 3 characters"}),
        kk: z.string().min(3, {message: "Description must be at least 3 characters"}),
        ru: z.string().min(3, {message: "Description must be at least 3 characters"})
    })
})

export type InstitutionDescriptionSchemaInputType = z.input<typeof InstitutionDescriptionSchema>
export type InstitutionDescriptionSchemaOutputType = z.output<typeof InstitutionDescriptionSchema>
