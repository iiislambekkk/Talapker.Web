import { queryOptions } from '@tanstack/react-query'
import getAccessToken from "@/lib/auth/getAccessToken";
import {createApi} from "@/lib/axios";
import {InstitutionDto} from "@/Data/models/InstitutionDto";

export const institutionByIdOptions = (id: string) =>
    queryOptions({
        queryKey: ['institution', id],
        queryFn: async () : Promise<InstitutionDto> => {
            let token = await getAccessToken()

            const api = createApi(token ?? "")
            const res = await api.get(`/institutions/${id}`);

            return res.data;
        }
});

