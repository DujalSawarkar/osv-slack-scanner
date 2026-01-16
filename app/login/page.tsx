"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Terminal, Github, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">OSV Scanner</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Github className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Sign in with GitHub
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
            Access your dashboard to claim CLI projects, import repositories,
            and monitor vulnerabilities across all your projects
          </p>

          {/* Sign in card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mx-auto max-w-md border border-border/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Get Started</CardTitle>
                <CardDescription>
                  Connect with your GitHub account to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  size="lg"
                  className="w-full gap-2 shadow-lg shadow-primary/20 flex items-center justify-center"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    signIn("github", { callbackUrl: "/dashboard" });
                  }}
                >
                  {loading ? (
                    <Spinner size={18} className="mr-2" />
                  ) : (
                    <Github className="h-5 w-5" />
                  )}
                  Continue with GitHub
                </Button>
                <p className="text-xs text-muted-foreground">
                  You will be redirected back after authentication
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* What you can do section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid gap-6 md:grid-cols-2"
          >
            <Card className="border border-border/40 text-left shadow-md">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Claim CLI Projects</CardTitle>
                <CardDescription className="text-sm">
                  Already ran a CLI scan? Enter your Project ID to claim it and
                  view detailed scan history and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      View complete scan history
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Track vulnerability trends
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Manage multiple projects
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/40 text-left shadow-md">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Github className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Import GitHub Repos</CardTitle>
                <CardDescription className="text-sm">
                  Connect your GitHub repositories for continuous monitoring and
                  automated vulnerability scanning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Auto-scan on code changes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Instant Slack notifications
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Manual scan triggers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
