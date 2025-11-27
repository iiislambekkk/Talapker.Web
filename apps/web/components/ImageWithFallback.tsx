"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {Skeleton} from "@workspace/ui/components/skeleton";
import {cn} from "@workspace/ui/lib/utils";

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fallbackSrc?: string;
    fallbackElement?: React.ReactNode;
    imageClassName?: string;
    skeletonClassName?: string;
}

export function ImageWithFallback({
                                      src,
                                      alt,
                                      width = 1280,
                                      height = 1280,
                                      fallbackSrc = "/img/placeholder.jpg",
                                      fallbackElement,
                                      imageClassName,
                                      skeletonClassName,
                                  }: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    if (hasError && fallbackElement) return <>{fallbackElement}</>;

    return (
        <>
            <Image
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                unoptimized
                className={cn("object-cover", imageClassName, isLoading && "w-0 h-0")}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    if (fallbackSrc) setImgSrc(fallbackSrc);
                    else setHasError(true);
                    setIsLoading(false);
                }}
            />

            {isLoading && (
                <Skeleton
                    className={cn(
                        "flex items-center justify-center bg-muted animate-pulse object-cover",
                        skeletonClassName
                    )}
                >
                    <Loader2 className="animate-spin size-1/4" />
                </Skeleton>
            )}
        </>
    );
}
