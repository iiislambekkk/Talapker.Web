'use client'

import {EditorContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from "@/components/richTextEditor/MenuBar";
import {cn} from "@workspace/ui/lib/utils";
import TextAlign from "@tiptap/extension-text-align";
import {useEffect} from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const RichTextEditor = ({field} : {field: any}) => {

    const editor = useEditor({
        extensions: [StarterKit,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            })
        ],
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,

        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[300px] p-4 border border-input focus:outline-none w-full",
                    "dark:bg-input/30 shadow-xs transition-[color,box-shadow]",
                    "prose prose-sm lg:prose-lg xl:prose-xl dark:prose-invert !w-full max-w-full overflow-hidden break-all"
                    )
            }
        },

        onUpdate: ({editor}) => {
            field.onChange(JSON.stringify(editor.getJSON()))
        },

        content: field.value ? JSON.parse(field.value) : "<p>Hello world!</p>",
        editable: !field.disabled
    })

    useEffect(() => {
        if (editor && field.value) {
            const currentContent = JSON.stringify(editor.getJSON());
            if (currentContent !== field.value) {
                // Add gradient background transition
                editor.view.dom.style.background = 'linear-gradient(45deg, #f0f9ff, #e0f2fe)';
                editor.view.dom.style.transition = 'background 1s ease';

                setTimeout(() => {
                    editor.commands.setContent(JSON.parse(field.value));

                    // Gradually return to normal
                    setTimeout(() => {
                        editor.view.dom.style.background = 'transparent';
                    }, 800);
                }, 150);
            }
        }
    }, [field.value, editor]);

    return (
        <div className={"w-full max-h-[80vh] overflow-y-auto"}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}

export default RichTextEditor