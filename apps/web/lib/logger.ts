const isDev = process.env.NEXT_PUBLIC_MODE === "development";

export const logger = {
    log: (...args: unknown[]) => isDev && console.log(...args),
    warn: (...args: unknown[]) => isDev && console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
};