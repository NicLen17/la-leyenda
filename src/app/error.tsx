"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="border-destructive/40 bg-card/50">
      <CardHeader>
        <CardTitle>Algo salió mal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {error.message || "Error inesperado en La Leyenda."}
        </p>
        <Button type="button" onClick={reset}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}
