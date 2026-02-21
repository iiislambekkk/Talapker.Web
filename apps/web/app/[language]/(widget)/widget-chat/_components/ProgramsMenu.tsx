import { Loader2, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";

type Lang = 'ru' | 'kk' | 'en';

interface Program {
    id: string;
    code: string;
    name: Record<Lang, string>;
}

interface Faculty {
    id: string;
    name: Record<Lang, string>;
    educationPrograms: Program[];
}

interface ProgramsMenuProps {
    faculties: Faculty[] | undefined;
    isLoading: boolean;
    lang: Lang;
    onProgramClick: (code: string, name: string) => void;
    onAllProgramsClick: () => void;
    programsLabel: string;
    allProgramsLabel: string;
}

export const ProgramsMenu = ({
                                 faculties,
                                 isLoading,
                                 lang,
                                 onProgramClick,
                                 onAllProgramsClick,
                                 programsLabel,
                                 allProgramsLabel,
                             }: ProgramsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openFaculties, setOpenFaculties] = useState<Record<string, boolean>>({});

    const toggleFaculty = (facultyId: string) => {
        setOpenFaculties(prev => ({ ...prev, [facultyId]: !prev[facultyId] }));
    };

    return (
        <div className="mt-2">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{programsLabel}</span>
                        </div>
                        <ChevronRight className={cn(
                            "w-4 h-4 transition-transform",
                            isOpen && "rotate-90"
                        )} />
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2 text-sm"
                                onClick={() => { onAllProgramsClick(); setIsOpen(false); }}
                            >
                                <Sparkles className="w-3 h-3" />
                                {allProgramsLabel}
                            </Button>

                            {faculties?.map((faculty) => (
                                <div key={faculty.id} className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-between gap-2 text-xs font-semibold text-muted-foreground"
                                        onClick={() => toggleFaculty(faculty.id)}
                                    >
                                        <span className="truncate">
                                            {faculty.name[lang] || faculty.name.ru}
                                        </span>
                                        <ChevronRight className={cn(
                                            "w-3 h-3 transition-transform shrink-0",
                                            openFaculties[faculty.id] && "rotate-90"
                                        )} />
                                    </Button>

                                    {openFaculties[faculty.id] && (
                                        <div className="pl-2 space-y-1">
                                            {faculty.educationPrograms.map((program) => (
                                                <Button
                                                    key={program.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start gap-2 text-xs pl-4"
                                                    onClick={() => {
                                                        onProgramClick(program.code, program.name[lang] || program.name.ru);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <span className="font-mono text-[10px] text-primary">{program.code}</span>
                                                    <span className="truncate">{program.name[lang] || program.name.ru}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};