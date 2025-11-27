"use client"

import { Editor } from '@tiptap/react';
import React from 'react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@workspace/ui/components/tooltip";
import { Toggle } from '@workspace/ui/components/toggle';
import { cn } from '@workspace/ui/lib/utils';
import {
    AlignCenterIcon,
    AlignLeftIcon,
    AlignRightIcon, BoldIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ItalicIcon,
    ListIcon,
    ListOrderedIcon,
    RedoIcon,
    Strikethrough,
    UndoIcon
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface IMenuBarProps {
    editor: Editor | null;
}

const MenuBar = ({editor} : IMenuBarProps) => {
    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    React.useEffect(() => {
        if (!editor) return;

        // update when selection changes (e.g., cursor moves)
        editor.on("selectionUpdate", forceUpdate);

        // update when content changes (optional)
        editor.on("transaction", forceUpdate);

        return () => {
            editor.off("selectionUpdate", forceUpdate);
            editor.off("transaction", forceUpdate);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div className={"border border-b-0 border-input rounded-t-lg p-2 bg-card flex flex-wrap items-center gap-1"}>

            <TooltipProvider>

                <div className={"flex flex-wrap gap-2"}>
                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("bold")}
                                onPressedChange={() => editor.chain().toggleBold().run()}
                                className={cn(
                                    editor.isActive("bold") && "bg-muted text-primary"
                                )}
                            >
                                <BoldIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Bold
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("italic")}
                                onPressedChange={() => editor.chain().toggleItalic().run()}
                                className={cn(
                                    editor.isActive("italic") && "bg-muted text-primary"
                                )}
                            >
                                <ItalicIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Italic
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("strike")}
                                onPressedChange={() => editor.chain().toggleStrike().run()}
                                className={cn(
                                    editor.isActive("strike") && "bg-muted text-primary"
                                )}
                            >
                                <Strikethrough />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Strike
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("heading", {level: 1})}
                                onPressedChange={() => editor.chain().toggleHeading({level: 1}).run()}
                                className={cn(
                                    editor.isActive("heading", {level: 1}) && "bg-muted text-primary"
                                )}
                            >
                                <Heading1Icon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Heading 1
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("heading", {level: 2})}
                                onPressedChange={() => editor.chain().toggleHeading({level: 2}).run()}
                                className={cn(
                                    editor.isActive("heading", {level: 2}) && "bg-muted text-primary"
                                )}
                            >
                                <Heading2Icon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Heading 2
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("heading", {level: 3})}
                                onPressedChange={() => editor.chain().toggleHeading({level: 3}).run()}
                                className={cn(
                                    editor.isActive("heading", {level: 3}) && "bg-muted text-primary"
                                )}
                            >
                                <Heading3Icon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Heading 3
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("bulletList")}
                                onPressedChange={() => editor.chain().toggleBulletList().run()}
                                className={cn(
                                    editor.isActive("bulletList") && "bg-muted text-primary"
                                )}
                            >
                                <ListIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Bullet List
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive("orderedList")}
                                onPressedChange={() => editor.chain().toggleOrderedList().run()}
                                className={cn(
                                    editor.isActive("orderedList") && "bg-muted text-primary"
                                )}
                            >
                                <ListOrderedIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Ordered List
                        </TooltipContent>
                    </Tooltip>
                </div>


                <div className={"w-px h-6 bg-border mx-2"}>
                </div>

                <div className={"flex flex-wrap gap-2"}>
                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive({textAlign: "left"})}
                                onPressedChange={() => editor.chain().setTextAlign("left").run()}
                                className={cn(
                                    editor.isActive({textAlign: "left"}) && "bg-muted text-primary"
                                )}
                            >
                                <AlignLeftIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Align Left
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive({textAlign: "center"})}
                                onPressedChange={() => editor.chain().setTextAlign("center").run()}
                                className={cn(
                                    editor.isActive({textAlign: "center"}) && "bg-muted text-primary"
                                )}
                            >
                                <AlignCenterIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Align Center
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Toggle
                                size={"sm"}
                                pressed={editor.isActive({textAlign: "right"})}
                                onPressedChange={() => editor.chain().setTextAlign("right").run()}
                                className={cn(
                                    editor.isActive({textAlign: "right"}) && "bg-muted text-primary"
                                )}
                            >
                                <AlignRightIcon />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            Align Right
                        </TooltipContent>
                    </Tooltip>

                </div>


                <div className={"w-px h-6 bg-border mx-2"}>
                </div>

                <div className={"flex flex-wrap gap-2"}>
                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                           <Button
                               size={"sm"}
                               variant={"ghost"}
                               type={"button"}
                               onClick={() => {
                                   editor.chain().focus().undo().run()
                               }}
                               disabled={!editor.can().undo()}
                           >
                               <UndoIcon />
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Undo
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild={true}>
                            <Button
                                size={"sm"}
                                variant={"ghost"}
                                type={"button"}
                                onClick={() => {
                                    editor.chain().focus().redo().run()
                                }}
                                disabled={!editor.can().redo()}
                            >
                                <RedoIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Redo
                        </TooltipContent>
                    </Tooltip>

                </div>
            </TooltipProvider>
        </div>
    );
};

export default MenuBar;