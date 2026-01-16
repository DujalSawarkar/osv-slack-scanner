"use client";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthBar({
  userName,
  projectId,
}: {
  userName?: string | null;
  projectId: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 md:flex">
        <span className="text-sm text-muted-foreground">Signed in</span>
        <span className="text-sm font-medium">{userName || "GitHub user"}</span>
      </div>
      <a href="/import">
        <Button variant="outline" type="button">
          Import
        </Button>
      </a>
      <Button
        variant="outline"
        type="button"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => setShowModal(true)}
      >
        Sign out
      </Button>
      <ThemeToggle />
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-xl shadow-2xl p-8 w-full max-w-sm animate-fade-in">
            <h2 className="text-xl font-bold mb-2 text-foreground">Sign out</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="min-w-[90px]"
                disabled={signingOut}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500/10 min-w-[90px] flex items-center justify-center"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  await signOut({ callbackUrl: "/login" });
                  setSigningOut(false);
                  setShowModal(false);
                }}
              >
                {signingOut ? <Spinner size={18} className="mr-2" /> : null}
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
