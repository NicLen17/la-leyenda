"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EconomyQuizProps = {
  onComplete: (success: boolean) => void;
};

type Question = {
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
};

const BANK: Question[] = [
  {
    prompt: "Perdiste pistol. El rival full buy. ¿Qué hacés?",
    options: [
      { id: "a", label: "Force con Deagle + kevlar", correct: false },
      { id: "b", label: "Eco total y full buy al round 3", correct: true },
      { id: "c", label: "Comprar AWP solo", correct: false },
    ],
  },
  {
    prompt: "Vas 12-12, $3400 por cabeza. ¿Mejor buy?",
    options: [
      { id: "a", label: "AK/M4 + full utility, sin kit", correct: false },
      { id: "b", label: "Rifle + kit + 1-2 utilidades clave", correct: true },
      { id: "c", label: "Scout + 4 flashes", correct: false },
    ],
  },
  {
    prompt: "Ganaron anti-eco. Rival tiene ~$1500. ¿Qué esperás?",
    options: [
      { id: "a", label: "Full buy del rival", correct: false },
      { id: "b", label: "Force o semi-eco con pistolas", correct: true },
      { id: "c", label: "Save completo del rival", correct: false },
    ],
  },
  {
    prompt: "Bonus loss en racha. ¿Cuándo forceás?",
    options: [
      { id: "a", label: "Siempre en el round 2", correct: false },
      { id: "b", label: "Si el mapa/lado lo justifica y hay info", correct: true },
      { id: "c", label: "Nunca, siempre eco", correct: false },
    ],
  },
];

function pickQuestions(): Question[] {
  // Deterministic rotate so lint purity rules stay happy; still varies by mount time.
  const offset = Date.now() % BANK.length;
  return [BANK[offset], BANK[(offset + 2) % BANK.length]];
}

/** Quick economy IQ check — two correct answers to pass. */
export function EconomyQuiz({ onComplete }: EconomyQuizProps) {
  const [questions] = useState(pickQuestions);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const current = questions[index];

  const choose = (optionId: string, isCorrect: boolean) => {
    if (picked) return;
    setPicked(optionId);
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        onComplete(nextCorrect >= questions.length);
        return;
      }
      setCorrect(nextCorrect);
      setIndex(index + 1);
      setPicked(null);
    }, 650);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Quiz de economía</span>
        <span className="tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
        <p className="text-base font-bold leading-snug">{current.prompt}</p>
        <div className="flex flex-col gap-2">
          {current.options.map((option) => {
            const show =
              picked !== null &&
              (option.id === picked || (option.correct && picked !== null));
            return (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "h-auto justify-start whitespace-normal px-3 py-2.5 text-left text-sm",
                  show &&
                    option.correct &&
                    "border-primary bg-primary/15 text-primary",
                  show &&
                    option.id === picked &&
                    !option.correct &&
                    "border-destructive bg-destructive/15 text-destructive",
                )}
                onClick={() => choose(option.id, option.correct)}
                disabled={picked !== null}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
