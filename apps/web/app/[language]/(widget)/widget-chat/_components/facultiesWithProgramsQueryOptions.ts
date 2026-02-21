import { createApi } from "@/lib/axios";
import {LocalizedText} from "@/Data/models/LocalizedText";
import {ApiResponse} from "@/Data/models/ApiResponse";

export interface EducationProgramSimple {
    id: string;
    code: string;
    name: LocalizedText;
}

export interface FacultyWithPrograms {
    id: string;
    name: LocalizedText;
    educationPrograms: EducationProgramSimple[];
}

export const allFacultiesWithProgramsQueryOptions = (institutionId: string) => ({
    queryKey: ['institution', institutionId, 'faculties', 'with-programs'],
    queryFn: async () => {
        const api = createApi();
        const { data } = await api.get<ApiResponse<FacultyWithPrograms[]>>(
            `/api/faculties/with-programs?institutionId=${institutionId}`,
        );
        return data.data;
    },
});