"use client";

import React, {useState, useEffect, useTransition} from 'react';
import { Button } from "@workspace/ui/components/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getQueryClient } from "@/lib/tanstackQuery/getQueryClient";
import { createApi } from "@/lib/axios";
import { useLang } from "@/hooks/useLang";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import Uploader from "@/components/fileUploader/Uploader";

import {
    User,
    GraduationCap,
    Sparkles,
    Languages,
    Heart,
    Link as LinkIcon,
    Image,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from "lucide-react";
import {
    educationProgramsQueryOptions
} from "@/app/[language]/(protected)/institution-admin/[institutionId]/content/education-programs/_components/educationProgramsQueryOptions";
import {AmbassadorDto} from "@/Data/models/AmbassadorDto";


// Schema
const socialLinksSchema = z.object({
    instagram: z.string().url("Invalid URL").optional().or(z.literal('')),
    telegram: z.string().url("Invalid URL").optional().or(z.literal('')),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal('')),
    twitter: z.string().url("Invalid URL").optional().or(z.literal('')),
    facebook: z.string().url("Invalid URL").optional().or(z.literal('')),
}).optional();

const ambassadorProfileSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    studyYear: z.number().min(1).max(6),
    degreeType: z.string().min(1, "Degree type is required"),
    educationalProgramId: z.string().min(1, "Educational program is required"),
    tagline: z.string().optional(),
    bio: z.string().min(50, "Bio should be at least 50 characters").optional(),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    interests: z.array(z.string()).min(1, "At least one interest is required"),
    socialLinks: socialLinksSchema,
    avatarUrl: z.string().optional(),
    wallPaperUrl: z.string().optional(),
});

type AmbassadorProfileFormData = z.infer<typeof ambassadorProfileSchema>;

// Predefined options
const DEGREE_TYPES = [
    { value: "bachelor", label: "Bachelor's", icon: "🎓" },
    { value: "master", label: "Master's", icon: "📚" },
    { value: "phd", label: "PhD", icon: "🔬" },
];

const STUDY_YEARS = [1, 2, 3, 4, 5, 6];

const LANGUAGES_OPTIONS = [
    { value: "english", label: "English", flag: "🇬🇧" },
    { value: "kazakh", label: "Kazakh", flag: "🇰🇿" },
    { value: "russian", label: "Russian", flag: "🇷🇺" },
    { value: "turkish", label: "Turkish", flag: "🇹🇷" },
    { value: "chinese", label: "Chinese", flag: "🇨🇳" },
    { value: "german", label: "German", flag: "🇩🇪" },
    { value: "french", label: "French", flag: "🇫🇷" },
    { value: "spanish", label: "Spanish", flag: "🇪🇸" },
    { value: "korean", label: "Korean", flag: "🇰🇷" },
    { value: "japanese", label: "Japanese", flag: "🇯🇵" },
];

const INTERESTS_OPTIONS = [
    { value: "technology", label: "Technology", icon: "💻", category: "Tech" },
    { value: "programming", label: "Programming", icon: "👨‍💻", category: "Tech" },
    { value: "gaming", label: "Gaming", icon: "🎮", category: "Entertainment" },
    { value: "music", label: "Music", icon: "🎵", category: "Arts" },
    { value: "movies", label: "Movies", icon: "🎬", category: "Entertainment" },
    { value: "sports", label: "Sports", icon: "⚽", category: "Sports" },
    { value: "fitness", label: "Fitness", icon: "💪", category: "Sports" },
    { value: "reading", label: "Reading", icon: "📚", category: "Arts" },
    { value: "photography", label: "Photography", icon: "📸", category: "Arts" },
    { value: "travel", label: "Travel", icon: "✈️", category: "Lifestyle" },
    { value: "cooking", label: "Cooking", icon: "🍳", category: "Lifestyle" },
    { value: "art", label: "Art", icon: "🎨", category: "Arts" },
    { value: "business", label: "Business", icon: "💼", category: "Professional" },
    { value: "science", label: "Science", icon: "🔬", category: "Academic" },
    { value: "volunteering", label: "Volunteering", icon: "🤝", category: "Social" },
];

const SOCIAL_PLATFORMS = [
    { value: "instagram", label: "Instagram", icon: "📷", placeholder: "https://instagram.com/username" },
    { value: "telegram", label: "Telegram", icon: "✈️", placeholder: "https://t.me/username" },
    { value: "linkedin", label: "LinkedIn", icon: "💼", placeholder: "https://linkedin.com/in/username" },
    { value: "twitter", label: "Twitter", icon: "🐦", placeholder: "https://twitter.com/username" },
    { value: "facebook", label: "Facebook", icon: "📘", placeholder: "https://facebook.com/username" },
];

interface AmbassadorProfileFormProps {
    ambassador: AmbassadorDto;
    institutionId: string;
    onSuccess?: () => void;
}

export const AmbassadorProfileForm = ({ ambassador, institutionId, onSuccess }: AmbassadorProfileFormProps) => {
    const [isPending, startPending] = useTransition();
    const { data: session } = useSession();
    const queryClient = getQueryClient();
    const [step, setStep] = useState(1);
    const [lang] = useLang();
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(ambassador.languages || []);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(ambassador.interests || []);

    const { data: programs } = useQuery(educationProgramsQueryOptions(institutionId));
    console.log(institutionId)

    const form = useForm<AmbassadorProfileFormData>({
        resolver: zodResolver(ambassadorProfileSchema),
        defaultValues: {
            fullName: ambassador.fullName || "",
            studyYear: ambassador.studyYear || 1,
            degreeType: ambassador.degreeType || "",
            educationalProgramId: ambassador.educationalProgramId || "",
            tagline: ambassador.tagline || "",
            bio: ambassador.bio || "",
            languages: ambassador.languages || [],
            interests: ambassador.interests || [],
            socialLinks: ambassador.socialLinks || {},
            avatarUrl: ambassador.avatarUrl || "",
            wallPaperUrl: ambassador.wallPaperUrl || "",
        },
    });

    useEffect(() => {
        form.setValue("languages", selectedLanguages);
    }, [selectedLanguages, form]);

    useEffect(() => {
        form.setValue("interests", selectedInterests);
    }, [selectedInterests, form]);

    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;

    const nextStep = async () => {
        const fields = getFieldsForStep(step);
        const isValid = await form.trigger(fields as any);
        if (isValid) {
            setStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const getFieldsForStep = (step: number) => {
        switch(step) {
            case 1: return ['fullName', 'educationalProgramId', 'studyYear', 'degreeType'];
            case 2: return ['tagline', 'bio'];
            case 3: return ['languages'];
            case 4: return ['interests'];
            case 5: return ['socialLinks'];
            case 6: return ['avatarUrl', 'wallPaperUrl'];
            default: return [];
        }
    };

    const toggleLanguage = (langValue: string) => {
        setSelectedLanguages(prev =>
            prev.includes(langValue)
                ? prev.filter(l => l !== langValue)
                : [...prev, langValue]
        );
    };

    const toggleInterest = (interestValue: string) => {
        setSelectedInterests(prev =>
            prev.includes(interestValue)
                ? prev.filter(i => i !== interestValue)
                : [...prev, interestValue]
        );
    };

    const onSubmit = async (values: AmbassadorProfileFormData) => {
        const apiCall = async () => {
            try {
                const api = createApi();
                const headers = {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                };

                await api.put(`/api/ambassadors/change-info`, {
                    id: ambassador.id,
                    ...values
                }, headers);

                toast.success("Profile updated successfully!");
                await queryClient.invalidateQueries({
                    queryKey: ['ambassador', ambassador.id]
                });
                onSuccess?.();
            } catch (error: any) {
                toast.error(error.message || "Error occurred");
            }
        };

        startPending(apiCall);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <div
                            key={s}
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm
                                ${s === step ? 'bg-primary text-primary-foreground' :
                                s < step ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                            {s < step ? <Check className="w-4 h-4" /> : s}
                        </div>
                    ))}
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Basic</span>
                    <span>Personal</span>
                    <span>Lang</span>
                    <span>Interests</span>
                    <span>Social</span>
                    <span>Media</span>
                </div>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        {step === 1 && <><User className="w-5 h-5" /> Basic Information</>}
                        {step === 2 && <><Sparkles className="w-5 h-5" /> Personal Touch</>}
                        {step === 3 && <><Languages className="w-5 h-5" /> Languages</>}
                        {step === 4 && <><Heart className="w-5 h-5" /> Interests</>}
                        {step === 5 && <><LinkIcon className="w-5 h-5" /> Social Links</>}
                        {step === 6 && <><Image className="w-5 h-5" /> Media</>}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Tell us about your academic background"}
                        {step === 2 && "Add a personal touch to your profile"}
                        {step === 3 && "Select languages you speak"}
                        {step === 4 && "Choose your interests and hobbies"}
                        {step === 5 && "Add your social media links"}
                        {step === 6 && "Upload your profile picture and wallpaper"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <Controller
                                        name="fullName"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Full Name</FieldLabel>
                                                <Input {...field} placeholder="John Doe" />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="educationalProgramId"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Educational Program</FieldLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select program" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {programs?.map((program) => (
                                                            <SelectItem key={program.id} value={program.id}>
                                                                {program.name[lang] || program.name.ru}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller
                                            name="studyYear"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={!!fieldState.error}>
                                                    <FieldLabel>Study Year</FieldLabel>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(parseInt(v))}
                                                        value={field.value.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STUDY_YEARS.map((year) => (
                                                                <SelectItem key={year} value={year.toString()}>
                                                                    {year} {year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                </Field>
                                            )}
                                        />

                                        <Controller
                                            name="degreeType"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={!!fieldState.error}>
                                                    <FieldLabel>Degree Type</FieldLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select degree" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DEGREE_TYPES.map((degree) => (
                                                                <SelectItem key={degree.value} value={degree.value}>
                                                                    {degree.icon} {degree.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Personal */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <Controller
                                        name="tagline"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Tagline</FieldLabel>
                                                <Input {...field} placeholder="e.g., Future Tech Lead, Coffee & Code Enthusiast" />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="bio"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Bio</FieldLabel>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Tell your story, why you love your university, your experiences..."
                                                    rows={5}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {field.value?.length || 0}/500 characters
                                                </p>
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Step 3: Languages */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {LANGUAGES_OPTIONS.map((lang) => (
                                            <div
                                                key={lang.value}
                                                onClick={() => toggleLanguage(lang.value)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all
                                                    ${selectedLanguages.includes(lang.value)
                                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                                    : 'border-muted hover:border-primary/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <span className="font-medium">{lang.label}</span>
                                                    {selectedLanguages.includes(lang.value) && (
                                                        <Check className="w-4 h-4 text-primary ml-auto" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {form.formState.errors.languages && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.languages.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Interests */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    {['Tech', 'Arts', 'Sports', 'Entertainment', 'Academic', 'Professional', 'Lifestyle', 'Social'].map((category) => {
                                        const categoryInterests = INTERESTS_OPTIONS.filter(i => i.category === category);
                                        if (categoryInterests.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h3 className="text-sm font-medium mb-3 text-muted-foreground">{category}</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {categoryInterests.map((interest) => (
                                                        <Badge
                                                            key={interest.value}
                                                            variant={selectedInterests.includes(interest.value) ? "default" : "outline"}
                                                            className="cursor-pointer text-sm py-2 px-3 gap-2 hover:bg-primary/10 transition-colors"
                                                            onClick={() => toggleInterest(interest.value)}
                                                        >
                                                            <span>{interest.icon}</span>
                                                            {interest.label}
                                                            {selectedInterests.includes(interest.value) && (
                                                                <X className="w-3 h-3 ml-1" />
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {form.formState.errors.interests && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.interests.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 5: Social Links */}
                            {step === 5 && (
                                <div className="space-y-4">
                                    {SOCIAL_PLATFORMS.map((platform) => (
                                        <Controller
                                            key={platform.value}
                                            // @ts-ignore
                                            name={`socialLinks.${platform.value}`}
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={!!fieldState.error}>
                                                    <FieldLabel className="flex items-center gap-2">
                                                        <span>{platform.icon}</span>
                                                        {platform.label}
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        // @ts-ignore
                                                        value={field.value || ''}
                                                        placeholder={platform.placeholder}
                                                    />
                                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                                </Field>
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Step 6: Media */}
                            {step === 6 && (
                                <div className="space-y-6">
                                    <Controller
                                        name="avatarUrl"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={!!fieldState.error}>
                                                <FieldLabel>Profile Picture</FieldLabel>
                                                <Uploader
                                                    value={field.value || ''}
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
                                                <FieldLabel>Wallpaper / Cover Photo</FieldLabel>
                                                <Uploader
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    fileTypeAccepted="image"
                                                />
                                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                            </Field>
                                        )}
                                    />
                                </div>
                            )}
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    {step < totalSteps ? (
                        <Button type="button" onClick={nextStep}>
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={isPending}
                            onClick={form.handleSubmit(onSubmit)}
                        >
                            {isPending ? "Saving..." : "Save Profile"}
                            <Check className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};