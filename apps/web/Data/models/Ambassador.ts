export interface Ambassador {
    id: string;
    hasCompletedOnboarding: boolean;

    fullName: string;
    email: string;
    avatarUrl?: string | null;

    universityName: string;
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
    dateJoined: string; // ISO date string
    lastActiveAt?: string | null; // ISO date string
}