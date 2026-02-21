import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import {FacultyDto} from "@/Data/models/Faculty";

export const facultiesQueryOptions = (institutionId: string) => queryOptions({
    queryKey: ['faculties', institutionId],
    queryFn: async (): Promise<FacultyDto[]> => {
        const api = createApi("");
        const response = await api.get(`/api/faculties/all?institutionId=${institutionId}`);
        return response.data;
    },
    enabled: !!institutionId
});