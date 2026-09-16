"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({ username: fields.username?.[0], password: fields.password?.[0] });
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    });

    if (!result?.ok) {
      toast.error("Invalid username or password");
      setPending(false);
      return;
    }

    toast.success("Login successful");
    const callbackUrl = searchParams.get("callbackUrl");
    router.replace(callbackUrl?.startsWith("/") ? callbackUrl : "/");
    router.refresh();
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="username">Username</label>
        <input
          autoComplete="username"
          className="field"
          id="username"
          name="username"
          aria-invalid={Boolean(errors.username)}
          aria-describedby={errors.username ? "username-error" : undefined}
        />
        {errors.username && <p className="field-error" id="username-error">{errors.username}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="field pr-12"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 grid min-h-11 w-11 place-items-center text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
      </div>
      <Button className="h-11 w-full rounded-xl" disabled={pending} size="lg" type="submit">
        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        {pending ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}
