import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
}

async function proxyHandler(req: NextRequest, context: any) {
    // 1. Resolve path params from context
    // In Next.js 15 app router, params are resolved asynchronously
    const params = await context.params;
    const pathArray = params?.path || [];
    const path = pathArray.join("/");

    // 2. Session verification via Better Auth
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return NextResponse.json(
            { detail: "Authentication credentials were not provided." },
            { status: 401 }
        );
    }

    // 3. Construct Django API endpoint URL
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${baseUrl}/api/${path}/${searchParams ? `?${searchParams}` : ""}`;

    // 4. Set forwarding headers (cookies and session tokens)
    const headers = new Headers();
    
    // Forward the cookie header
    const cookieHeader = req.headers.get("cookie") || "";
    headers.set("Cookie", cookieHeader);
    
    // Explicitly pass the session token as a Bearer token
    const sessionToken = req.cookies.get("better-auth.session_token")?.value;
    if (sessionToken) {
        headers.set("Authorization", `Bearer ${sessionToken}`);
    }

    // Copy Content-Type if present, let browser set it automatically for multipart uploads
    const contentType = req.headers.get("content-type");
    if (contentType && !contentType.includes("multipart/form-data")) {
        headers.set("Content-Type", contentType);
    }

    // 5. Forward request body
    const method = req.method;
    let body: any = null;

    if (method !== "GET" && method !== "HEAD") {
        if (contentType && contentType.includes("multipart/form-data")) {
            // Forward multipart file uploads
            body = await req.formData();
        } else {
            body = await req.text();
        }
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body,
        });

        const resHeaders = new Headers();
        const responseContentType = response.headers.get("content-type");
        if (responseContentType) {
            resHeaders.set("Content-Type", responseContentType);
        }

        // 204 No Content, 205 Reset Content, and 304 Not Modified must not have a response body
        if ([204, 205, 304].includes(response.status)) {
            return new NextResponse(null, {
                status: response.status,
                headers: resHeaders,
            });
        }

        const data = await response.text();
        return new NextResponse(data, {
            status: response.status,
            headers: resHeaders,
        });
    } catch (error: any) {
        console.error("Proxy forwarding error:", error);
        return NextResponse.json(
            { detail: `Failed to connect to backend server: ${error.message}` },
            { status: 502 }
        );
    }
}

export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
