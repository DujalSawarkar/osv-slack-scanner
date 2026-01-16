"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  Bell,
  Github,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="container relative mx-auto px-4 pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Automated Security Monitoring
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Secure Your
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                {" "}
                Dependencies
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
            >
              Real-time vulnerability scanning for npm packages. Get instant
              Slack alerts powered by Google's OSV database.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="group h-11 px-7 text-sm font-medium shadow-lg shadow-primary/20"
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#install">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-7 text-sm font-medium shadow-sm"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Quick Start
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>OSV Powered</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <Badge className="mb-4" variant="outline">
                How It Works
              </Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Two Ways to Get Started
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                Choose the workflow that fits your needs
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              {/* CLI Path */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border border-border/40 bg-gradient-to-br from-primary/5 to-background shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      CLI Package (Local Scanning)
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Install and scan your local projects instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          1
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Install via npm and run scan command
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          2
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Get instant Slack notifications for vulnerabilities
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          3
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Receive unique <strong>Project ID</strong> and
                          dashboard link
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          4
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Login to claim your project and view full history
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                      <p className="text-xs font-mono text-muted-foreground">
                        $ osv-slack-scanner scan
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        ✅ Scan complete!
                        <br />
                        📊 Project ID:{" "}
                        <span className="font-semibold">osv-abc123</span>
                        <br />
                        🔗 Dashboard link provided
                      </p>
                    </div>
                    <Link href="#install">
                      <Button className="w-full">
                        <Terminal className="mr-2 h-4 w-4" />
                        Install CLI Package
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Web Dashboard Path */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border border-border/40 bg-gradient-to-br from-primary/5 to-background shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                      <Github className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      Web Dashboard (GitHub Integration)
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Connect GitHub repos for continuous monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          1
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sign in with your GitHub account
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          2
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enter your <strong>Project ID</strong> to claim CLI
                          project
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          3
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Or import GitHub repositories for auto-scanning
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          4
                        </div>
                        <p className="text-sm text-muted-foreground">
                          View history, trends, and trigger manual scans
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">
                        <strong>After Login:</strong>
                        <br />
                        • Claim CLI projects with Project ID
                        <br />
                        • Import unlimited GitHub repos
                        <br />
                        • Track vulnerability history
                        <br />• Trigger scans on-demand
                      </p>
                    </div>
                    <Link href="/login">
                      <Button className="w-full">
                        <Github className="mr-2 h-4 w-4" />
                        Sign in with GitHub
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Project ID Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-12 max-w-3xl"
            >
              <Card className="border border-primary/20 bg-primary/5 shadow-sm dark:border-primary/20 dark:bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">What is a Project ID?</h3>
                      <p className="text-sm text-muted-foreground">
                        When you run a CLI scan, we generate a unique{" "}
                        <strong>Project ID</strong> (like{" "}
                        <code className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                          osv-abc123
                        </code>
                        ). This ID lets you view scan results on our web
                        dashboard even before logging in. Once you sign in, you
                        can <strong>claim the project</strong> to link it to
                        your account and access full history, trends, and manage
                        all your projects in one place.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-y bg-muted/50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <Badge className="mb-4" variant="outline">
                Features
              </Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything You Need
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                Comprehensive security monitoring with real-time alerts and
                detailed analytics
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
            >
              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Real-time Scanning
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Automatically monitors package.json changes and scans
                      dependencies instantly using OSV API
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Slack Integration
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Receive instant DM notifications in Slack when
                      vulnerabilities are detected in your dependencies
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      OSV Database
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Powered by Google's comprehensive Open Source
                      Vulnerabilities database for accurate results
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Github className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      GitHub Sync
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Import and monitor repositories directly from GitHub with
                      automatic permission management
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Terminal className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      CLI Support
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Full command-line interface for CI/CD integration and
                      automated scanning workflows
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full border border-border/40 shadow-md transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Dashboard Analytics
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track vulnerability trends and history with detailed
                      dashboards and MongoDB storage
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Installation Section */}
        <section id="install" className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <Badge className="mb-4" variant="outline">
                Installation
              </Badge>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Get Started in Minutes
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                Install the CLI package for automated scanning with Slack
                notifications
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-4xl space-y-8"
            >
              <Card className="border border-border/40 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                      1
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      Install Package
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/50 p-4">
                    <code className="text-sm font-mono">
                      npm install -g metron-osv-scanner
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                      2
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      Configure Slack Bot
                    </CardTitle>
                  </div>
                  <CardDescription className="ml-11 text-sm">
                    Create a{" "}
                    <code className="rounded bg-muted px-2 py-1">
                      .env.local
                    </code>{" "}
                    file in your project with Slack credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/50 p-4">
                      <pre className="text-sm font-mono">
                        {`SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_USER_ID="U01234567"
PACKAGE_JSON_PATH="./package.json"`}
                      </pre>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/5">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        <strong>Note:</strong> Only these Slack variables are
                        needed for CLI scanning. The other environment variables
                        (NextAuth, MongoDB, GitHub) are only required if you're
                        setting up the web dashboard.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/40 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                      3
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      Run Scanner
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-lg border border-border/40 bg-muted/50 p-4">
                      <code className="text-sm font-mono">
                        osv-slack-scanner scan
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The scanner will automatically detect vulnerabilities and
                      send Slack notifications
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Dashboard CTA */}
        <section className="border-y bg-muted/50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-center"
            >
              <Badge className="mb-4" variant="outline">
                Web Dashboard
              </Badge>
              <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                Track Your Security Posture
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Access our web dashboard to view vulnerability history, track
                trends over time, and manage multiple projects from GitHub
              </p>
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base">
                  <Github className="mr-2 h-5 w-5" />
                  Sign in with GitHub
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/30 py-8 md:py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-none">
                    OSV Slack Scanner
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Open Source Security
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 md:items-end">
                <p className="text-sm text-muted-foreground">
                  © 2026 OSV Slack Scanner. Powered by Google OSV Database.
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <a
                    href="https://github.com"
                    className="transition-colors hover:text-primary"
                  >
                    GitHub
                  </a>
                  <span>•</span>
                  <a href="#" className="transition-colors hover:text-primary">
                    Documentation
                  </a>
                  <span>•</span>
                  <a href="#" className="transition-colors hover:text-primary">
                    Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
