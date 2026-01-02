"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Shuffle } from "lucide-react";
import { VocabularyItem } from "@/types/session";
import { updateWordStats } from "@/lib/stats";

interface TranslationModeProps {
  sourceText: string;
  targetText: string;
  currentItem: VocabularyItem;
  onNext: () => void;
  onValidate: (isCorrect: boolean) => void;
  isValidated: boolean;
  isCorrect: boolean | null;
  canGoNext: boolean;
}

export function TranslationMode({
  sourceText,
  targetText,
  currentItem,
  onNext,
  onValidate,
  isValidated,
  isCorrect,
  canGoNext,
}: TranslationModeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [localValidated, setLocalValidated] = React.useState(false);
  const [localCorrect, setLocalCorrect] = React.useState<boolean | null>(null);

  // Réinitialiser l'état quand on change d'item
  useEffect(() => {
    setUserAnswer("");
    setLocalValidated(false);
    setLocalCorrect(null);
  }, [sourceText]);

  // Focus automatique sur l'input
  useEffect(() => {
    if (!localValidated && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [sourceText, localValidated]);

  // Normaliser les chaînes
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  };

  const handleValidate = () => {
    if (!userAnswer.trim()) return;

    const normalizedUserAnswer = normalizeString(userAnswer);
    const normalizedTarget = normalizeString(targetText);

    const correct = normalizedUserAnswer === normalizedTarget;
    setLocalCorrect(correct);
    setLocalValidated(true);

    // Mettre à jour les statistiques
    updateWordStats(currentItem.russian, currentItem.french, correct);
    onValidate(correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !localValidated) {
      e.preventDefault();
      handleValidate();
    }
  };

  // Utiliser l'état local ou les props
  const displayValidated = localValidated || isValidated;
  const displayCorrect = localCorrect !== null ? localCorrect : isCorrect;

  return (
    <div className="space-y-4 ">
      <div className="space-y-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Entrez la traduction..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={displayValidated}
          className={`text-lg h-14 ${
            displayValidated
              ? displayCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-red-500 bg-red-50 dark:bg-red-950"
              : ""
          }`}
        />
      </div>

      {!displayValidated ? (
        <Button
          onClick={handleValidate}
          disabled={!userAnswer.trim()}
          className="w-full h-12"
        >
          <Check className="h-4 w-4 mr-2" /> Valider
        </Button>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg flex items-center gap-3 ${
              displayCorrect
                ? "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100"
                : "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100"
            }`}
          >
            {displayCorrect ? (
              <Check className="w-6 h-6" />
            ) : (
              <X className="w-6 h-6" />
            )}
            <div className="flex-1">
              {displayCorrect ? (
                <div className="font-semibold">Correct !</div>
              ) : (
                <div>
                  <div className="font-semibold">Incorrect</div>
                  <div className="text-sm mt-1">
                    La bonne réponse est :{" "}
                    <span className="font-bold">{targetText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="w-full h-12"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
