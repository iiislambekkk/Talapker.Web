import { Loader2, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import { cn } from "@workspace/ui/lib/utils";
import { useState, memo, useCallback } from "react";
import React from "react";

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

export const ProgramsMenu = memo(({
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

    const toggleFaculty = useCallback((facultyId: string) => {
        setOpenFaculties(prev => ({ ...prev, [facultyId]: !prev[facultyId] }));
    }, []);

    const handleAllPrograms = useCallback(() => {
        onAllProgramsClick();
        setIsOpen(false);
    }, [onAllProgramsClick]);

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
                                onClick={handleAllPrograms}
                            >
                                <Sparkles className="w-3 h-3" />
                                {allProgramsLabel}
                            </Button>

                            {faculties?.map((faculty) => (
                                <FacultyItem
                                    key={faculty.id}
                                    faculty={faculty}
                                    lang={lang}
                                    isOpen={!!openFaculties[faculty.id]}
                                    onToggle={toggleFaculty}
                                    onProgramClick={onProgramClick}
                                    onCloseMenu={setIsOpen}
                                />
                            ))}
                        </>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
});
ProgramsMenu.displayName = "ProgramsMenu";

// Вынесен отдельно чтобы не ре-рендерить весь список при открытии одного факультета
interface FacultyItemProps {
    faculty: Faculty;
    lang: Lang;
    isOpen: boolean;
    onToggle: (id: string) => void;
    onProgramClick: (code: string, name: string) => void;
    onCloseMenu: (open: boolean) => void;
}

const FacultyItem = memo(({ faculty, lang, isOpen, onToggle, onProgramClick, onCloseMenu }: FacultyItemProps) => {
    const handleToggle = useCallback(() => onToggle(faculty.id), [faculty.id, onToggle]);

    return (
        <div className="space-y-1">
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between gap-2 text-xs font-semibold text-muted-foreground"
                onClick={handleToggle}
            >
                <span className="truncate">{faculty.name[lang] || faculty.name.ru}</span>
                <ChevronRight className={cn(
                    "w-3 h-3 transition-transform shrink-0",
                    isOpen && "rotate-90"
                )} />
            </Button>

            {isOpen && (
                <div className="pl-2 space-y-1">
                    {faculty.educationPrograms.map((program) => (
                        <ProgramButton
                            key={program.id}
                            program={program}
                            lang={lang}
                            onProgramClick={onProgramClick}
                            onCloseMenu={onCloseMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
FacultyItem.displayName = "FacultyItem";

interface ProgramButtonProps {
    program: Program;
    lang: Lang;
    onProgramClick: (code: string, name: string) => void;
    onCloseMenu: (open: boolean) => void;
}

const ProgramButton = memo(({ program, lang, onProgramClick, onCloseMenu }: ProgramButtonProps) => {
    const handleClick = useCallback(() => {
        onProgramClick(program.code, program.name[lang] || program.name.ru);
        onCloseMenu(false);
    }, [program.code, program.name, lang, onProgramClick, onCloseMenu]);

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs pl-4"
            onClick={handleClick}
        >
            <span className="font-mono text-[10px] text-primary">{program.code}</span>
            <span className="truncate">{program.name[lang] || program.name.ru}</span>
        </Button>
    );
});
ProgramButton.displayName = "ProgramButton";