"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function DeleteAccountButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось удалить аккаунт");
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Удалить аккаунт
      </Button>
    );
  }

  return (
    <form onSubmit={onConfirm} className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        Это действие необратимо: будут удалены все ваши резюме, вакансии,
        анализы и адаптации. Введите пароль, чтобы подтвердить.
      </p>
      <div>
        <Label htmlFor="deletePassword">Пароль</Label>
        <Input
          id="deletePassword"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" variant="danger" size="sm" disabled={loading}>
          {loading ? "Удаляем…" : "Подтвердить удаление"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
