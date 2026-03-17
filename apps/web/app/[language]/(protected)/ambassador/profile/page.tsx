"use client";

import React, { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApi } from "@/lib/axios";
import { logger } from "@/lib/logger";
import { AmbassadorDto } from "@/Data/models/AmbassadorDto";
import { DrawerForm } from "@/components/DrawerForm";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field";
import {
    Check, Loader2, PenIcon, Star, MessageSquare,
    Clock, ThumbsUp, Globe, Heart, GraduationCap, X,
} from "lucide-react";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEGREE_TYPES = [
    { value: "bachelor", label: "Bachelor's", icon: "🎓" },
    { value: "master",   label: "Master's",   icon: "📚" },
    { value: "phd",      label: "PhD",        icon: "🔬" },
];

const LANGUAGES = [
    { value: "english",  label: "English",  flag: "🇬🇧" },
    { value: "kazakh",   label: "Kazakh",   flag: "🇰🇿" },
    { value: "russian",  label: "Russian",  flag: "🇷🇺" },
    { value: "turkish",  label: "Turkish",  flag: "🇹🇷" },
    { value: "chinese",  label: "Chinese",  flag: "🇨🇳" },
    { value: "german",   label: "German",   flag: "🇩🇪" },
    { value: "french",   label: "French",   flag: "🇫🇷" },
    { value: "spanish",  label: "Spanish",  flag: "🇪🇸" },
    { value: "korean",   label: "Korean",   flag: "🇰🇷" },
    { value: "japanese", label: "Japanese", flag: "🇯🇵" },
];

const INTERESTS = [
    { value: "technology",   label: "Technology",   icon: "💻" },
    { value: "programming",  label: "Programming",  icon: "👨‍💻" },
    { value: "gaming",       label: "Gaming",       icon: "🎮" },
    { value: "music",        label: "Music",        icon: "🎵" },
    { value: "movies",       label: "Movies",       icon: "🎬" },
    { value: "sports",       label: "Sports",       icon: "⚽" },
    { value: "fitness",      label: "Fitness",      icon: "💪" },
    { value: "reading",      label: "Reading",      icon: "📚" },
    { value: "photography",  label: "Photography",  icon: "📸" },
    { value: "travel",       label: "Travel",       icon: "✈️" },
    { value: "cooking",      label: "Cooking",      icon: "🍳" },
    { value: "art",          label: "Art",          icon: "🎨" },
    { value: "business",     label: "Business",     icon: "💼" },
    { value: "science",      label: "Science",      icon: "🔬" },
    { value: "volunteering", label: "Volunteering", icon: "🤝" },
];

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    avatarUrl:            z.string().optional(),
    educationalProgramId: z.string().optional(),
    studyYear:            z.number().min(1).max(6),
    degreeType:           z.string().optional(),
    tagline:              z.string().optional(),
    bio:                  z.string().optional(),
    languages:            z.array(z.string()).min(1, "Select at least one language"),
    interests:            z.array(z.string()).min(1, "Select at least one interest"),
    socialLinks:          z.record(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Query ────────────────────────────────────────────────────────────────────

const ambassadorByUserQueryOptions = (userId: string) => ({
    queryKey: ["ambassador", "by-user", userId],
    queryFn: async (): Promise<AmbassadorDto> => {
        const api = createApi();
        const response = await api.get(`/api/ambassadors/by-user/${userId}`);
        return response.data;
    },
    enabled: !!userId,
});

// ─── Edit Drawer ──────────────────────────────────────────────────────────────

function EditAmbassadorDrawer({ ambassador }: { ambassador: AmbassadorDto }) {
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            avatarUrl:            ambassador.avatarUrl ?? "",
            educationalProgramId: ambassador.educationalProgramId ?? "",
            studyYear:            ambassador.studyYear,
            degreeType:           ambassador.degreeType ?? "",
            tagline:              ambassador.tagline ?? "",
            bio:                  ambassador.bio ?? "",
            languages:            ambassador.languages ?? [],
            interests:            ambassador.interests ?? [],
            socialLinks:          ambassador.socialLinks ?? {},
        },
    });

    const languages = form.watch("languages");
    const interests  = form.watch("interests");

    const toggle = (field: "languages" | "interests", value: string) => {
        const cur = form.getValues(field);
        form.setValue(
            field,
            cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value],
            { shouldValidate: true }
        );
    };

    const onSubmit = (values: FormData) => {
        startTransition(async () => {
            try {
                const api = createApi();
                await api.put("/api/ambassadors/change-info", {
                    id:                   ambassador.id,
                    avatarUrl:            values.avatarUrl || null,
                    educationalProgramId: values.educationalProgramId || null,
                    studyYear:            values.studyYear,
                    degreeType:           values.degreeType || null,
                    tagline:              values.tagline || null,
                    bio:                  values.bio || null,
                    languages:            values.languages,
                    interests:            values.interests,
                    socialLinks:          values.socialLinks || null,
                });
                logger.log("[AmbassadorProfilePage] profile updated");
                toast.success("Profile updated successfully");
                setOpen(false);
                await queryClient.invalidateQueries({ queryKey: ["ambassador", "by-user"] });
            } catch (err: any) {
                logger.error("[AmbassadorProfilePage] update error", err);
                toast.error(err?.response?.data?.message ?? "Something went wrong");
            }
        });
    };

    return (
        <DrawerForm
            open={open}
            setOpen={setOpen}
            trigger={
                <Button variant="outline" size="sm" className="gap-1.5">
                    <PenIcon className="w-3.5 h-3.5" />
                    Edit Profile
                </Button>
            }
            title="Edit Profile"
            description="Update your ambassador profile information"
        >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
                <FieldGroup className="space-y-4">

                    {/* Avatar URL */}
                    <Controller name="avatarUrl" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Avatar URL <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                                        <Input {...field} placeholder="https://..." />
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                    />

                    {/* Tagline */}
                    <Controller name="tagline" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Tagline <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                                        <Input {...field} placeholder="e.g. Future engineer & coffee addict" />
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                    />

                    {/* Bio */}
                    <Controller name="bio" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Bio <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
                                        <Textarea {...field} rows={4} placeholder="Tell your story..." />
                                        <p className="text-xs text-muted-foreground mt-1">{field.value?.length ?? 0} characters</p>
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                    />

                    <Separator />

                    {/* Degree */}
                    <Controller name="degreeType" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Degree</FieldLabel>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {DEGREE_TYPES.map(d => (
                                                <button key={d.value} type="button" onClick={() => field.onChange(d.value)}
                                                        className={`p-4 rounded-xl border text-center transition-all duration-150
                                                ${field.value === d.value
                                                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                            : "border-border bg-muted/40 hover:bg-muted"}`}>
                                                    <div className="text-2xl mb-1">{d.icon}</div>
                                                    <div className="text-xs font-medium">{d.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                    />

                    {/* Study Year */}
                    <Controller name="studyYear" control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Study Year</FieldLabel>
                                        <div className="flex gap-2">
                                            {[1,2,3,4,5,6].map(y => (
                                                <button key={y} type="button" onClick={() => field.onChange(y)}
                                                        className={`w-11 h-11 rounded-lg border text-sm font-semibold transition-all duration-150
                                                ${field.value === y
                                                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                                                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                        {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                    />

                    <Separator />

                    {/* Languages */}
                    <Field data-invalid={!!form.formState.errors.languages}>
                        <FieldLabel>Languages</FieldLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {LANGUAGES.map(lang => {
                                const selected = languages.includes(lang.value);
                                return (
                                    <button key={lang.value} type="button" onClick={() => toggle("languages", lang.value)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150
                                            ${selected
                                                ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                                                : "border-border bg-muted/30 hover:bg-muted"}`}>
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="text-sm font-medium flex-1">{lang.label}</span>
                                        {selected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </div>
                        {form.formState.errors.languages && (
                            <FieldError>{form.formState.errors.languages.message}</FieldError>
                        )}
                    </Field>

                    {/* Interests */}
                    <Field data-invalid={!!form.formState.errors.interests}>
                        <FieldLabel>Interests</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS.map(item => {
                                const selected = interests.includes(item.value);
                                return (
                                    <Badge key={item.value}
                                           variant={selected ? "default" : "outline"}
                                           className="cursor-pointer gap-1.5 py-2 px-3 text-sm hover:opacity-80 transition-opacity"
                                           onClick={() => toggle("interests", item.value)}>
                                        <span>{item.icon}</span>
                                        {item.label}
                                        {selected && <X className="w-3 h-3 ml-0.5" />}
                                    </Badge>
                                );
                            })}
                        </div>
                        {form.formState.errors.interests && (
                            <FieldError>{form.formState.errors.interests.message}</FieldError>
                        )}
                    </Field>

                </FieldGroup>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isPending} className="gap-1.5">
                        {isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                            : <><Check className="w-4 h-4" strokeWidth={2.5} />Save Changes</>
                        }
                    </Button>
                </div>
            </form>
        </DrawerForm>
    );
}

// ─── Profile Display ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <div className="flex flex-col gap-1 p-4 rounded-xl border bg-muted/30">
            <div className="text-muted-foreground">{icon}</div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

function AmbassadorProfileDisplay({ ambassador }: { ambassador: AmbassadorDto }) {
    const initials = `${ambassador.firstName?.[0] ?? ""}${ambassador.lastName?.[0] ?? ""}`.toUpperCase();

    const spokenLanguages = LANGUAGES.filter(l => ambassador.languages?.includes(l.value));
    const hobbies         = INTERESTS.filter(i => ambassador.interests?.includes(i.value));
    const degree          = DEGREE_TYPES.find(d => d.value === ambassador.degreeType);

    return (
        <div className="space-y-6">

            {/* Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16 text-lg">
                                <AvatarImage src={generateS3UrlFromKey(ambassador.avatarUrl ?? "")} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight">
                                        {ambassador.firstName} {ambassador.lastName}
                                    </h2>
                                    {ambassador.isActive && (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                            Active
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{ambassador.email}</p>
                                {ambassador.tagline && (
                                    <p className="text-sm text-foreground/70 mt-1 italic">"{ambassador.tagline}"</p>
                                )}
                            </div>
                        </div>
                        <EditAmbassadorDrawer ambassador={ambassador} />
                    </div>

                    {ambassador.bio && (
                        <>
                            <Separator className="my-4" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{ambassador.bio}</p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Total Chats"   value={ambassador.totalChats}   />
                <StatCard icon={<ThumbsUp      className="w-4 h-4" />} label="Helpful Votes" value={ambassador.helpfulVotes} />
                <StatCard icon={<Star          className="w-4 h-4" />} label="Rating"        value={ambassador.rating.toFixed(1)} />
                <StatCard icon={<Clock         className="w-4 h-4" />} label="Avg. Response" value={`${ambassador.averageResponseTime}m`} />
            </div>

            {/* Academic */}
            <Card>
                <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <GraduationCap className="w-4 h-4" />
                        Academic
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {degree && (
                            <Badge variant="secondary" className="gap-1.5">
                                <span>{degree.icon}</span> {degree.label}
                            </Badge>
                        )}
                        <Badge variant="secondary">Year {ambassador.studyYear}</Badge>
                        {ambassador.educationalProgramName && (
                            <Badge variant="outline">{ambassador.educationalProgramName}</Badge>
                        )}
                        {ambassador.institution && (
                            <Badge variant="outline">{ambassador.institution.name["kk"]}</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Languages */}
            {spokenLanguages.length > 0 && (
                <Card>
                    <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Globe className="w-4 h-4" />
                            Languages
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {spokenLanguages.map(l => (
                                <Badge key={l.value} variant="secondary" className="gap-1.5 py-1.5 px-3">
                                    <span>{l.flag}</span> {l.label}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Interests */}
            {hobbies.length > 0 && (
                <Card>
                    <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <Heart className="w-4 h-4" />
                            Interests
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {hobbies.map(i => (
                                <Badge key={i.value} variant="outline" className="gap-1.5 py-1.5 px-3">
                                    <span>{i.icon}</span> {i.label}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Page = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user?.sub;

    const { data: ambassador, isLoading, error } = useQuery({
        ...ambassadorByUserQueryOptions(userId!),
        enabled: !!userId && sessionStatus === "authenticated",
    });

    if (sessionStatus === "loading" || isLoading) {
        return (
            <div className="container max-w-2xl mx-auto py-8 space-y-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-destructive">Error loading ambassador profile</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!ambassador) {
        return (
            <div className="container max-w-2xl mx-auto py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Ambassador profile not found</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <AmbassadorProfileDisplay ambassador={ambassador} />
        </div>
    );
};

export default Page;