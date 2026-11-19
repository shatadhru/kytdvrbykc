import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { authClient } from "@/payload/auth/client";
import { toast } from "@/components/ui/toast";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormdata] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      console.error("Google sign in error:", err);
      toast.add({
        type: "error",
        title: "Google Sign-In Failed",
        description: err?.message || "Failed to sign in with Google",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(formData);
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard",
        rememberMe: true,
      });

      if (data) {
        console.log(data);
        toast.add({
          type: "success",
          title: "Login Success",
          description: "You are logged in successfully",
        });
      } else {
        console.log(error);
        toast.add({
          type: "error",
          title: "Login Failed",
          description: error?.message || "You are not logged in successfully",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.add({
        type: "error",
        title: "Error",
        description: err?.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl border-2 border-emerald-500/25 border-b-4 border-b-emerald-600 bg-card shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            স্বাগতম! একাউন্টে প্রবেশ করুন
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            গুগল একাউন্ট অথবা আপনার ইমেইল দিয়ে সহজে লগইন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading || isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 rounded-xl font-semibold border-border/80 hover:bg-muted/80 cursor-pointer shadow-xs"
                >
                  {isGoogleLoading ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin text-primary" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="mr-2 size-4"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  {isGoogleLoading ? "গুগলে যুক্ত হচ্ছে..." : "Google দিয়ে প্রবেশ করুন"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs text-muted-foreground">
                অথবা ইমেইল দিয়ে প্রবেশ করুন
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-semibold">ইমেইল ঠিকানা</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormdata({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                  className="rounded-xl h-10"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-xs font-semibold">পাসওয়ার্ড</FieldLabel>
                  <Link
                    href="/auth/forget"
                    className="ml-auto text-xs text-primary font-medium hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>

                <InputGroup className="rounded-xl overflow-hidden">
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormdata({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                    className="h-10"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"
                      }
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
                >
                  {isLoading && (
                    <Loader2Icon className="mr-2 size-4 animate-spin text-white" />
                  )}
                  {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                </Button>
                <FieldDescription className="text-center text-xs mt-3">
                  নতুন শিক্ষার্থী?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    নতুন একাউন্ট তৈরি করুন
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-[11px] text-muted-foreground">
        প্রবেশের মাধ্যমে আপনি আমাদের{" "}
        <Link href="/auth/terms" className="underline underline-offset-4 hover:text-primary">
          ব্যবহারের শর্তাবলী
        </Link>{" "}
        ও{" "}
        <Link href="/auth/privacy" className="underline underline-offset-4 hover:text-primary">
          গোপনীয়তা নীতি
        </Link>{" "}
        মেনে নিচ্ছেন।
      </FieldDescription>
    </div>
  );
}
