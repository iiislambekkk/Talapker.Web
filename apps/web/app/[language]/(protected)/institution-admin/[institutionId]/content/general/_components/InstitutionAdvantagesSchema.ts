import {z} from "zod";

export const InstitutionAdvantagesSchema = z.object({
    advantages: z.array(z.object(
        {
            title: z.object({
                en: z.string().min(3, {message: "Description must be at least 3 characters"}),
                kk: z.string().min(3, {message: "Description must be at least 3 characters"}),
                ru: z.string().min(3, {message: "Description must be at least 3 characters"})
            }),
            description: z.object({
                en: z.string().min(3, {message: "Description must be at least 3 characters"}),
                kk: z.string().min(3, {message: "Description must be at least 3 characters"}),
                ru: z.string().min(3, {message: "Description must be at least 3 characters"})
            })
        }
    ))
})


export type InstitutionAdvantagesSchemaInputType = z.input<typeof InstitutionAdvantagesSchema>
export type InstitutionAdvantagesSchemaOutputType = z.output<typeof InstitutionAdvantagesSchema>
