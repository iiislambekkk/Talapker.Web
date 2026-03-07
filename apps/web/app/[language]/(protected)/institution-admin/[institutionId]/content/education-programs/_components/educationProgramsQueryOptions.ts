import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import {EducationProgramDto} from "@/Data/models/Faculty";

export const educationProgramsQueryOptions = (institutionId: string, facultyId?: string | null) => queryOptions({
    queryKey: ['education-programs', institutionId, facultyId],
    queryFn: async (): Promise<EducationProgramDto[]> => {
        const api = createApi("");
        const url = facultyId
            ? `/api/education-programs/list?institutionId=${institutionId}&facultyId=${facultyId}`
            : `/api/education-programs/list?institutionId=${institutionId}`;
        const response = await api.get(url);
        return response.data;
    },
    enabled: !!institutionId
});