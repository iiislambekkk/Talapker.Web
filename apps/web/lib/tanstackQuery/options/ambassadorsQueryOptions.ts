import {queryOptions} from "@tanstack/react-query";
import {createApi} from "@/lib/axios";
import {AmbassadorDto} from "@/Data/models/AmbassadorDto";

export const ambassadorsQueryOptions = (institutionId: string) => queryOptions({
    queryKey: ['ambassadors', institutionId],
    queryFn: async () : Promise<AmbassadorDto[]> => {
        const api = createApi("")

        const response = await api.get(`/api/ambassadors/all?tenantId=${institutionId}`);
        return response.data;
    }
});