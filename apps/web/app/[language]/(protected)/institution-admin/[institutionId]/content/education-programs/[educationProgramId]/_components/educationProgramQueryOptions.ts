import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import { EducationProgramDto } from "@/Data/models/Faculty";

export const educationProgramQueryOptions = (educationProgramId: string) => queryOptions({
    queryKey: ["education-program", educationProgramId],
    queryFn: async (): Promise<EducationProgramDto> => {
        const api = createApi("");
        const response = await api.get(`/api/education-programs/id/${educationProgramId}`);
        return response.data;
    },
    enabled: !!educationProgramId
});