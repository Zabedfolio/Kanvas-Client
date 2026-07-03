import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { ToastContainer } from "@/components/ui/toast";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Server-side route protection
    if (!session) {
        redirect("/login");
    }

    return (
        <AppShell>
            <ToastContainer />
            {children}
        </AppShell>
    );
}
