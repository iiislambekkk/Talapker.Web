import { NextResponse, NextRequest } from "next/server";

const SUPPORTED_LANGS : string[] = ["kk", "en", "ru"];
const DEFAULT_LANG = "kk";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const res = NextResponse.next();

    const pathLang = SUPPORTED_LANGS.find((lang) =>
        pathname.startsWith(`/${lang}`)
    );

    const cookieLang = req.cookies.get("lang")?.value;

    if (pathLang) {
        if (cookieLang !== pathLang) {
            res.cookies.set("lang", pathLang, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365 * 10,
            });
        }
        return res;
    }

    const lang = SUPPORTED_LANGS.includes(cookieLang ?? "")
        ? cookieLang!
        : DEFAULT_LANG;

    const url = req.nextUrl.clone();
    url.pathname = `/${lang}${pathname.startsWith('/') ? pathname : '/' + pathname}`;

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("lang", lang, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10,
    });

    return redirectResponse;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|img/|fonts/|firebase-messaging-sw\\.js|img).*)",
    ],
};