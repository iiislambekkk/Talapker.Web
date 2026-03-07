import { LocalizedText } from "@/Data/models/LocalizedText";

// ===== ENUMS =====

export enum GrantCompetitionType {
    General = "General",
    Rural = "Rural"
}

export enum Degree {
    Bachelor = "Bachelor",
    Magistracy = "Magistracy",
    Doctor = "Doctor"
}

export enum Language {
    Kazakh = 0,
    Russian = 1,
    English = 2
}

export type StudyForm = "FullTime" | "PartTime" | "Evening" | "Distance";

// ===== UNT =====

export interface UntSubjectDto {
    id: string;
    name: LocalizedText;
}

export interface UntPairDto {
    id: string;
    firstSubject: UntSubjectDto;
    secondSubject: UntSubjectDto;
}

// ===== GRANT =====

export interface GrantCompetitionRecordDto {
    score: number;
    frequency: number;
}

export interface GrantCompetitionStatisticDto {
    id: string;
    year: number;
    competitionType: GrantCompetitionType;
    minScore: number;
    totalGrants: number;
    records: GrantCompetitionRecordDto[];
}

// ===== EDUCATION HIERARCHY =====

export interface EducationGroupDto {
    id: string;
    nationalCode: string;
    educationFieldId: string;
    name: LocalizedText;
    untSubjectsPairs: UntPairDto[];
    grantCompetitionStatistics: GrantCompetitionStatisticDto[];
}

// ===== FACULTY =====

export interface FacultyDto {
    id: string;
    name: LocalizedText;
    institutionId: string;
    logoUrl?: string | null;
    color: string;
    educationPrograms: EducationProgramDto[];
}

// ===== EDUCATION PROGRAM =====

export interface EducationProgramPriceDto {
    year: number;
    amount: number;
    studyForm: StudyForm;
}

export interface EducationProgramDisciplineDto {
    name: LocalizedText;
    description: LocalizedText;
    credits: number;
    semesters: number[];
}

export interface EducationProgramDto {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    workPlaces: LocalizedText;
    practiseBases: LocalizedText;
    minimumUntScore: number;
    code: string;
    studyForm: StudyForm;
    durationYears: number;
    languages: Language[];
    faculty?: FacultySlimDto | null;
    educationGroup?: EducationGroupDto | null;
    prices: EducationProgramPriceDto[];
    disciplines: EducationProgramDisciplineDto[];
}

export interface FacultySlimDto {
    id: string;
    name: LocalizedText;
    institutionId: string;
    logoUrl?: string | null;
    wallPaperUrl?: string | null;
}