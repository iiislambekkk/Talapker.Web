import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@workspace/ui/lib/utils";

const MessageContent = ({ content, isUser }: { content: string; isUser: boolean }) => (
    <div className={cn(
        "text-sm leading-relaxed break-words",
        isUser ? "text-primary-foreground" : "text-foreground"
    )}>
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                    <ul className="my-2 ml-4 space-y-1 list-disc marker:text-primary/60">{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol className="my-2 ml-4 space-y-1 list-decimal marker:text-primary/60">{children}</ol>
                ),
                li: ({ children }) => (
                    <li className="leading-relaxed pl-1">{children}</li>
                ),
                strong: ({ children }) => (
                    <strong className={cn(
                        "font-semibold",
                        isUser ? "text-primary-foreground" : "text-foreground"
                    )}>{children}</strong>
                ),
                em: ({ children }) => (
                    <em className="italic opacity-90">{children}</em>
                ),
                h1: ({ children }) => (
                    <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>
                ),
                code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    return isBlock ? (
                        <code className={cn(
                            "block rounded-lg p-3 text-xs font-mono my-2 overflow-x-auto",
                            isUser
                                ? "bg-black/20 text-primary-foreground"
                                : "bg-muted text-foreground"
                        )}>
                            {children}
                        </code>
                    ) : (
                        <code className={cn(
                            "rounded px-1.5 py-0.5 text-xs font-mono",
                            isUser
                                ? "bg-black/20 text-primary-foreground"
                                : "bg-muted text-foreground"
                        )}>
                            {children}
                        </code>
                    );
                },
                pre: ({ children }) => (
                    <pre className="my-2 overflow-x-auto rounded-lg">{children}</pre>
                ),
                hr: () => (
                    <hr className={cn(
                        "my-3 border-t",
                        isUser ? "border-primary-foreground/20" : "border-border"
                    )} />
                ),
                blockquote: ({ children }) => (
                    <blockquote className={cn(
                        "my-2 pl-3 border-l-2 italic opacity-80",
                        isUser ? "border-primary-foreground/40" : "border-primary/40"
                    )}>
                        {children}
                    </blockquote>
                ),
                a: ({ href, children }) => (
                <a
                    href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    "underline underline-offset-2 transition-opacity hover:opacity-100",
                    isUser ? "opacity-80" : "text-primary opacity-90"
                )}
                >
            {children}
                </a>
                ),
                table: ({ children }) => (
                <div className="my-2 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">{children}</table>
            </div>
            ),
            thead: ({ children }) => (
                <thead className="bg-muted/50">{children}</thead>
            ),
                th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold border-b border-border">{children}</th>
            ),
                td: ({ children }) => (
                <td className="px-3 py-2 border-b border-border/50 last:border-0">{children}</td>
            ),
            }}
            >
            {content}
        </ReactMarkdown>
    </div>
);

export default MessageContent;