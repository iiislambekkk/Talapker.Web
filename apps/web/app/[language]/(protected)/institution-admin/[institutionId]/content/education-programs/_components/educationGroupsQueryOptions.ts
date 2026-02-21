import { queryOptions } from "@tanstack/react-query";
import { createApi } from "@/lib/axios";
import {EducationGroup} from "@/Data/models/Faculty";

export const educationGroupsQueryOptions = () => queryOptions({
    queryKey: ['education-groups'],
    queryFn: async (): Promise<EducationGroup[]> => {
        const api = createApi("");
        const response = await api.get("/api/education-programs/education-groups");
        return response.data;
    }
});