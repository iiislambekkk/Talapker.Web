import {InstitutionAdminDto} from "@/Data/models/InstitutionAdminDto";

export interface AmbassadorDto {
    id: string;

    firstName: string;
    lastName: string;
    email: string;
    userId: string;
    avatarUrl?: string | null;

    institutionId?: string | null;
    institution?: InstitutionAdminDto | null;

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