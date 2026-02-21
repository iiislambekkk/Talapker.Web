"use client"
import React from 'react';
import {useParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {useLang} from "@/hooks/useLang";
import {generateS3UrlFromKey} from "@/lib/generateS3UrlFromKey";
import {Badge} from "@workspace/ui/components/badge";
import {Skeleton} from "@workspace/ui/components/skeleton";
import {Card, CardContent} from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    MessageCircle,
    Star,
    ThumbsUp,
    Clock,
    GraduationCap,
    Calendar,
    Languages,
    Heart,
    CheckCircle,
    XCircle, Users
} from 'lucide-react';
import {ambassadorsQueryOptions} from "@/lib/tanstackQuery/options/ambassadorsQueryOptions";
import InviteAmbassadorForm
    from "@/app/[language]/(protected)/institution-admin/[institutionId]/ambassadors/manage/_components/InviteAmbassadorForm";

const Page = () => {
    const {institutionId} = useParams() as {institutionId: string};
    const t = useTranslations();
    const [lang] = useLang();
    const { data: ambassadors, status } = useQuery(ambassadorsQueryOptions(institutionId));

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (status === "success") {
        return (
            <div className="container mx-auto py-8">
                {/* Header */}


                <div className="mb-8">
                    <div className={"flex justify-between"}>
                        <h1 className="text-3xl font-bold text-foreground">
                            Campus Ambassadors
                        </h1>

                        <InviteAmbassadorForm institutionId={institutionId}/>
                    </div>

                    <p className="text-muted-foreground mt-2">
                        Meet our student representatives ready to answer your questions
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Ambassadors</p>
                                    <p className="text-2xl font-bold">{ambassadors.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <MessageCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Chats</p>
                                    <p className="text-2xl font-bold">
                                        {ambassadors.reduce((acc, a) => acc + a.totalChats, 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active ambassadors</p>
                                    <p className="text-2xl font-bold">
                                        {(ambassadors.reduce((acc, a) => acc + (a.isActive ? 1 : 0), 0))}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ambassadors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ambassadors.map((ambassador) => (
                        <Card key={ambassador.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <CardContent className="p-0">
                                {/* Header with Avatar */}
                                <div
                                    className="relative h-32 bg-cover bg-center mb-16"
                                    style={ambassador.wallPaperUrl ? { backgroundImage: `url(${generateS3UrlFromKey(ambassador.wallPaperUrl)})` } : { backgroundColor: '#f0f0f0' }}
                                >
                                    <div className="absolute -bottom-12 left-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-background rounded-full">
                                                <Avatar className="w-24 h-24 border-4 border-background relative">
                                                    <AvatarImage
                                                        src={generateS3UrlFromKey(ambassador.avatarUrl)}
                                                        alt={ambassador.fullName}
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-semibold">
                                                        {getInitials(ambassador.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            {ambassador.isActive ? (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
                                            ) : (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full border-2 border-background" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-16 p-6">
                                    {/* Name and Status */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{ambassador.email}</h3>
                                            <p className="text-sm text-muted-foreground">Major: {ambassador.educationalProgramName}</p>
                                        </div>
                                        {ambassador.hasCompletedOnboarding ? (
                                            <Badge variant="green" className="gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="yellow" className="gap-1">
                                                <XCircle className="w-3 h-3" />
                                                Boarding
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Tagline */}
                                    {ambassador.tagline && (
                                        <p className="text-sm italic text-muted-foreground mb-4">
                                            "{ambassador.tagline}"
                                        </p>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-accent/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                <span>Year {ambassador.studyYear}</span>
                                            </div>
                                        </div>
                                        <div className="bg-accent/50 rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span>{ambassador.rating}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    {ambassador.languages && ambassador.languages.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Languages className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Languages</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {ambassador.languages.map((lang, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Interests */}
                                    {ambassador.interests && ambassador.interests.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Interests</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {ambassador.interests.map((interest, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            Joined {new Date(ambassador.dateJoined).toLocaleDateString()}
                                        </div>
                                        {ambassador.lastActiveAt && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ambassador.lastActiveAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {ambassadors.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Ambassadors Yet</h3>
                            <p className="text-muted-foreground">
                                Start by inviting students to become ambassadors for your institution.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return <AmbassadorsPageSkeleton />;
};

const AmbassadorsPageSkeleton = () => {
    return (
        <div className="container mx-auto py-8">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1,2,3].map(i => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <Card key={i}>
                        <CardContent className="p-0">
                            <Skeleton className="h-32 w-full" />
                            <div className="p-6">
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-24 mb-4" />
                                <Skeleton className="h-20 w-full mb-4" />
                                <div className="grid grid-cols-2 gap-2">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Page;