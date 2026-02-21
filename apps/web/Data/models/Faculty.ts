import {LocalizedText} from "@/Data/models/LocalizedText";

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

// ===== UNT =====
export interface UntSubject {
    id: string;
    seedId?: number | null;
    name: LocalizedText;
}

export interface UntPair {
    id: string;
    seedId?: number | null;
    firstSubjectId: string;
    secondSubjectId: string;
    firstSubject?: UntSubject;
    secondSubject?: UntSubject;
    educationGroups?: EducationGroup[];
}

// ===== GRANT =====
export interface GrantCompetitionRecord {
    score: number;
    universityCode: number;
}

export interface GrantCompetitionStatistic {
    id: string;
    year: number;
    competitionType: GrantCompetitionType;
    educationGroupId: string;
    educationGroup?: EducationGroup;
    records: GrantCompetitionRecord[];
    minScore: number;
}

// ===== EDUCATION HIERARCHY =====
export interface EducationDirection {
    id: string;
    name: LocalizedText;
    degree: Degree;
    educationFields?: EducationField[];
}

export interface EducationField {
    id: string;
    nationalCode: string;
    name: LocalizedText;
    educationDirectionId: string;
    educationDirection?: EducationDirection;
    educationGroups?: EducationGroup[];
}

export interface EducationGroup {
    id: string;
    nationalCode: string;
    educationFieldId: string;
    educationField?: EducationField;
    name: LocalizedText;
    untSubjectsPairs: UntPair[];
    grantCompetitionStatistics: GrantCompetitionStatistic[];
    educationPrograms?: Faculty[];
}

export interface EducationProgram {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    facultyId: string;
    faculty?: Faculty; // если нужно будет включать
    educationGroupId: string;
    educationGroup?: EducationGroup; // если нужно будет включать
}

export interface EducationProgramDisciplineDto {
    name: LocalizedText;
    description: LocalizedText;
    credits: number;
    semesters: number[];
}

export interface EducationProgramPriceDto {
    year: number;
    amount: number;
    studyForm: StudyForm;
}

export type StudyForm = 'FullTime' | 'PartTime' | 'Evening' | 'Distance';

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
    facultyId: string;
    facultyName: LocalizedText;
    educationGroupId: string;
    educationGroupName: LocalizedText;
    educationGroupCode: string;
    languages: Language[];
    prices: EducationProgramPriceDto[];
    disciplines: EducationProgramDisciplineDto[];
}

export enum Language {
    Kazakh = 0,
    Russian = 1,
    English = 2
}

// ===== FACULTY & PROGRAMS =====
export interface Faculty {
    id: string;
    name: LocalizedText;
    institutionId: string;
    institution?: any; // или Institution тип
    educationPrograms: Faculty[];
    logoUrl: string
    wallPaperUrl: string
}

export interface FacultyDto {
    id: string;
    name: LocalizedText;
    institutionId: string;
    educationPrograms: EducationProgramDto[];
    logoUrl?: string | null;
    wallPaperUrl?: string | null;
}

export interface Faculty {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    facultyId: string;
    faculty?: Faculty;
    educationGroupId: string;
    educationGroup?: EducationGroup;
}