"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import { CircleUserRound } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { loading, redirectUrl, getRedirectUrl } = useGoogleAuthStore();
  const handleGoogleLogin = async () => {
    await getRedirectUrl();
  };

  useEffect(() => {
    if (redirectUrl?.startsWith("https://")) {
      document.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Увійти через Google</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-2 justify-center"
          >
            <CircleUserRound className="w-5 h-5" />
            Продовжити з Google
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Ваш обліковий запис буде використано лише для автентифікації
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
