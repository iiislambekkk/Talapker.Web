import Link from "next/link";
import {Badge} from "@workspace/ui/components/badge";
import {buttonVariants} from "@workspace/ui/components/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@workspace/ui/components/card";
import Image from "next/image";
import {getTranslations} from "next-intl/server";
import {getServerLang} from "@/lib/lang/getServerLang";
import {ArrowRightIcon, School2, SquareLibrary} from "lucide-react";
import {cn} from "@workspace/ui/lib/utils";

type featureProp = {
    title: string;
    description: string;
    icon: string;
}

export default async function ForStudentsPage() {
    const t = await getTranslations("HomePage");
    const lang = await getServerLang()


    const features: featureProp[] = [
        {
            title: t("estimateGrantChances"),
            description: t("searchUniversities"),
            icon: "🎯"
        },
        {
            title: t("viewOnMap"),
            description: t("chooseCity"),
            icon: "🗺️"
        },
        {
            title: t("openCareerPath"),
            description: t("takeCareerTest"),
            icon: "🚀"
        },
        {
            title: "Community Support",
            description: "Join a vibrant community of learners and instructors to collaborate and share knowledge.",
            icon: "🙎"
        }
    ]


    return (
        <div className={"space-y-10"}>
            <section className="transition-colors mt-5">
                <div className="grid grid-cols-2 xl:grid-cols-10 gap-7">
                    <Card className={"relative hover:shadow-lg transition-shadow col-span-2 xl:col-span-5 flex-col justify-between"}>
                        <div className={"grid grid-cols-10"}>
                            <div className={"col-span-5 lg:col-span-4"}/>
                            <div className={"col-span-5 lg:col-span-6 flex flex-col justify-between"}>
                                <CardHeader>
                                    <CardTitle className={"text-2xl tracking-normal md:text-5xl lg:text-4xl xl:text-5xl font-bold"}>{t("chooseBestUniversity")}</CardTitle>
                                </CardHeader>
                            </div>
                        </div>

                        <CardContent className={"flex flex-col lg:flex-row justify-end items-end gap-2 ml-5"}>
                            <Link href={`/${lang}/grant-changes`} className={buttonVariants({
                            })}>
                                <School2/> ВУЗы
                            </Link>

                            <Link href={`/${lang}/grant-changes`} className={buttonVariants({
                            })}>
                                <SquareLibrary/> Специальности
                            </Link>
                        </CardContent>

                        <Image
                            src="/img/girl-1.png"
                            alt="Student"
                            width={320}
                            height={620}
                            className="absolute bottom-0 left-0 rounded-2xl max-h-[86%] w-auto"
                        />
                    </Card>


                    <Card className="col-span-2 lg:col-span-1 xl:col-span-3 relative h-[476px] rounded-b-4xl">
                        <Image
                            src="/img/books-with-hat.png"
                            alt="books"
                            width={400}
                            height={400}
                            className="absolute top-0 right-0 h-60 w-60 rounded-2xl"
                        />

                        <CardContent className="p-0  pb-5 backdrop-blur-lg absolute bottom-0 left-0 right-0 h-[300px] flex flex-col rounded-4xl justify-between  dark:bg-primary/8">
                            <Image
                                src="/img/blue-bubbles.png"
                                alt="bubbles"
                                width={400}
                                height={200}
                                className="h-12 w-30 m-5 mb-0"
                            />

                            <CardHeader>
                                <CardTitle className={"text-xl md:text-2xl font-bold"}>
                                    {t("estimateGrantChances")}
                                </CardTitle>

                                <CardDescription className={"text-[16px]"}>
                                    {t("raschet")}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter>
                                <Link href={`/${lang}/grant-changes`} className={buttonVariants({
                                    className: cn("xl:size-10 justify-between items-center flex")
                                })}>
                                    <ArrowRightIcon className="" />
                                    <p className={"xl:hidden"}>Оценить</p>
                                </Link>
                            </CardFooter>
                        </CardContent>
                    </Card>

                    <Card className="relative col-span-2 lg:col-span-1 xl:col-span-2  group flex flex-col h-[400px] lg:h-[476px] justify-between">
                        <CardHeader className={"text-2xl md:text-3xl font-bold"}>
                            {t("openCareerPath")}
                        </CardHeader>

                        <Image
                            src="/img/buddy-1.png"
                            alt="Student"
                            width={480}
                            height={720}
                            className="absolute bottom-0 right-0 w-[276px] h-[80%] rounded-2xl"
                        />

                        <CardFooter className={"z-10"}>
                            <Link href={`/${lang}/career-guidance`} className={buttonVariants({
                                className: cn("xl:size-10 justify-between items-center flex")
                            })}>
                                <ArrowRightIcon className="" />
                                <p className={"xl:hidden"}>Профориентация</p>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            <section className="text-center">
                <p className="text-lg md:text-xl text-muted-foreground  mb-10">
                    {t("openCareerPath")}
                </p>
                <Link
                    href={`/${lang}/test`}
                    className={buttonVariants()}
                >
                    {t("takeCareerTest")}
                </Link>
            </section>

            <section className={"grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-4 mb-64"}>
                {features.map((feature, index) => (
                    <Card key={index} className={"hover:shadow-lg transition-shadow"}>
                        <CardHeader className={"flex flex-col gap-6"}>
                            <div className={"text-4xl"}>{feature.icon}</div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className={"text-muted-foreground"}>
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}
