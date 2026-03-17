import {InstitutionShortDto} from "@/Data/models/InstitutionShortDto";
import React, {useState} from "react";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {Card, CardContent} from "@workspace/ui/components/card";
import {Badge} from "@workspace/ui/components/badge";
import Link from "next/link";
import {ImageWithFallback} from "@/components/ImageWithFallback";
import {Skeleton} from "@workspace/ui/components/skeleton";

const InstitutionCard = ({ institution, isForProspect = false }: { institution: InstitutionShortDto, isForProspect?: boolean }) => {
    const basePath = isForProspect ? "/prospect" : "/admin";

    return (
        <Link href={`${basePath}/institutions/${institution.id}`}
              className={"group cursor-pointer relative"}
        >
            <Card className={"py-0 gap-0 h-full"}>
                <Badge className={"absolute top-2 right-2 z-10"}>
                    {institution.type}
                </Badge>

                <ImageWithFallback
                    src={generateS3UrlFromKey(institution.logoKey)}
                    alt={`${institution.name} logo`}
                    width={200}
                    height={200}
                    imageClassName="rounded-xl aspect-square w-full p-3"
                    skeletonClassName={"aspect-square w-full"}
                />


                <CardContent className={"p-4"}>
                    <p className={"font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary"}>
                        {institution.name}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}

const InstitutionCardSkeleton = () => {
    return (
        <Card className={"py-0 gap-0 h-full"}>
            {/* Badge placeholder */}
            <Skeleton className="absolute top-2 right-2 z-10" />

            {/* Image placeholder */}
            <Skeleton className="rounded-xl aspect-square w-full" />

            <CardContent className={"p-4"}>
                {/* Name placeholder */}
                <Skeleton className="h-6 w-3/4 mb-2 rounded-md" />
                <Skeleton className="h-6 w-1/2 rounded-md" />
            </CardContent>
        </Card>

    );
};

export {InstitutionCardSkeleton};
export default InstitutionCard;