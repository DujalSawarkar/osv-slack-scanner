import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function AuthBar({
  userName,
  projectId,
}: {
  userName?: string | null;
  projectId: string;
}) {
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
      <a href="/api/auth/signout">
        <Button variant="outline" type="button">
          Sign out
        </Button>
      </a>
      <ThemeToggle />
    </div>
  );
}
