"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "cn";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result?.error) {
        setErrorMessage(result.error.message || "Failed to sign in. Please try again.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-8">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center pb-2">
            <Link
              href="/"
              className="flex items-center gap-2 group mb-2"
            >
              <div className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground group-hover:border-foreground/40 transition-colors">
                <ShieldAlert className="size-4.5" />
              </div>
              <span className="font-semibold text-foreground text-sm tracking-tight font-sans">ProjectRescue</span>
            </Link>
            <h1 className="text-2xl font-normal tracking-tight text-foreground font-sans">Welcome back</h1>
            <FieldDescription className="text-xs font-sans text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-foreground underline underline-offset-4 hover:text-foreground/80 font-medium">
                Sign up
              </Link>
            </FieldDescription>
          </div>

          {errorMessage && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs font-mono text-destructive">
              {errorMessage}
            </div>
          )}

          <Field className="space-y-1.5">
            <FieldLabel htmlFor="email" className="text-xs font-sans">Work Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="engineer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs font-sans h-8"
              required
              disabled={isLoading}
            />
          </Field>

          <Field className="space-y-1.5">
            <FieldLabel htmlFor="password" className="text-xs font-sans">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs font-sans h-8"
              required
              disabled={isLoading}
            />
          </Field>

          <Field className="pt-2">
            <Button type="submit" disabled={isLoading} className="w-full text-xs font-mono h-8 shadow-none">
              {isLoading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
              Sign In to ProjectRescue
            </Button>
          </Field>

          <FieldSeparator className="text-xs font-mono text-muted-foreground my-2">Or continue with</FieldSeparator>

          <Field className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialSignIn("github")}
              className="text-xs font-mono h-8 shadow-none"
            >
              <svg className="mr-2 size-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => handleSocialSignIn("google")}
              className="text-xs font-mono h-8 shadow-none"
            >
              <svg className="mr-2 size-3.5" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <p className="text-center text-[11px] font-mono text-muted-foreground">
        Secure OAuth 2.0 with cryptographic session tokens.
      </p>
    </div>
  );
}
