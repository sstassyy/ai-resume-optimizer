"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Восстановление пароля будет реализовано в следующем релизе.
    setSent(true);
  }

  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Эта функция появится в следующем релизе"
    >
      {sent ? (
        <p className="text-sm text-brand-dark">
          Если email <span className="font-medium">{email}</span> зарегистрирован,
          в будущей версии на него придёт ссылка для сброса пароля.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="w-full">
            Отправить ссылку
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-black/50">
        <Link href="/login" className="font-medium text-brand-mint hover:underline">
          Вернуться ко входу
        </Link>
      </p>
    </AuthLayout>
  );
}
