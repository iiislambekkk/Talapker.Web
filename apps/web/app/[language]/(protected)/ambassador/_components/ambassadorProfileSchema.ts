import { z } from "zod";

export const socialLinksSchema = z.object({
    instagram: z.string().url("Invalid URL").optional().or(z.literal('')),
    telegram: z.string().url("Invalid URL").optional().or(z.literal('')),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal('')),
    twitter: z.string().url("Invalid URL").optional().or(z.literal('')),
    facebook: z.string().url("Invalid URL").optional().or(z.literal('')),
    youtube: z.string().url("Invalid URL").optional().or(z.literal('')),
}).optional();

export const ambassadorProfileSchema = z.object({
    // Step 1: Basic Info
    fullName: z.string().min(2, "Full name is required"),
    studyYear: z.number().min(1).max(6),
    degreeType: z.string().min(1, "Degree type is required"),
    educationalProgramId: z.string().min(1, "Educational program is required"),

    // Step 2: Personal
    tagline: z.string().optional(),
    bio: z.string().min(50, "Bio should be at least 50 characters").optional(),

    // Step 3: Languages
    languages: z.array(z.string()).min(1, "At least one language is required"),

    // Step 4: Interests
    interests: z.array(z.string()).min(1, "At least one interest is required"),

    // Step 5: Social Links
    socialLinks: socialLinksSchema,

    // Media
    avatarUrl: z.string().optional(),
    wallPaperUrl: z.string().optional(),
});

export type AmbassadorProfileFormData = z.infer<typeof ambassadorProfileSchema>;