import { Metadata } from 'next';
import {TalapkerChatWidget} from "@/app/[language]/(widget)/widget-chat/_components/TalapkerChatWidget";

export const metadata: Metadata = {
    title: 'Talapker Chat Widget',
    description: 'Консультант университета',
};

interface WidgetPageProps {
    searchParams: { institutionId?: string; lang?: string };
}

export default function WidgetPage({ searchParams }: WidgetPageProps) {
    const institutionId = searchParams.institutionId ?? '';
    const lang = (searchParams.lang ?? 'ru') as 'ru' | 'kk' | 'en';

    return (
        <div className="h-[100vh] bg-transparent flex items-center justify-center p-1">
            <TalapkerChatWidget
                embedded={true}
                institutionId={institutionId}
                lang={lang}
            />
        </div>
    );
}