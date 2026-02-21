export interface AmbassadorDto {
    id: string;
    hasCompletedOnboarding: boolean;

    fullName: string;
    email: string;
    avatarUrl?: string | null;
    wallPaperUrl?: string | null;

    institutionId: string;

    educationalProgramId?: string | null;
    educationalProgramName?: string | null;

    studyYear: number;
    degreeType?: string | null;

    tagline?: string | null;
    bio?: string | null;
    languages: string[];
    interests: string[];
    socialLinks?: Record<string, string> | null;

    totalChats: number;
    totalReplies: number;
    averageResponseTime: number;
    helpfulVotes: number;
    rating: number;

    isActive: boolean;
    dateJoined: string;
    lastActiveAt?: string | null;
}