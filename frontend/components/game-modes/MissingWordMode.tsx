"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Shuffle } from "lucide-react";
import { VocabularyItem } from "@/types/session";
import { updateWordStats } from "@/lib/stats";

interface MissingWordModeProps {
  sourceText: string;
  targetText: string;
  currentItem: VocabularyItem;
  direction: "ru-fr" | "fr-ru";
  onNext: () => void;
  onValidate: (isCorrect: boolean) => void;
  isValidated: boolean;
  isCorrect: boolean | null;
  canGoNext: boolean;
}

export function MissingWordMode({
  sourceText,
  targetText,
  currentItem,
  direction,
  onNext,
  onValidate,
  isValidated,
  isCorrect,
  canGoNext,
}: MissingWordModeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [localValidated, setLocalValidated] = useState(false);
  const [localCorrect, setLocalCorrect] = useState<boolean | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [missingWord, setMissingWord] = useState("");

  // Normaliser les chaînes (pour le russe, on garde les caractères cyrilliques)
  const normalizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, " ");
  };

  // Générer le texte avec un mot manquant dans la phrase russe
  useEffect(() => {
    const words = sourceText.split(/\s+/);

    // Sélectionner un mot aléatoire à masquer (éviter les mots trop courts)
    const eligibleWords = words.filter(
      (word) => word.length > 1 && !/[.,!?;:]/.test(word)
    );

    if (eligibleWords.length === 0) {
      // Si tous les mots sont trop courts, prendre le premier mot
      if (words.length > 0) {
        const wordToHide = words[0];
        setMissingWord(wordToHide);
        setDisplayText(
          sourceText.replace(
            new RegExp(
              `\\b${wordToHide.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
              "gi"
            ),
            "_____"
          )
        );
      } else {
        setDisplayText(sourceText);
        setMissingWord("");
      }
    } else {
      const randomIndex = Math.floor(Math.random() * eligibleWords.length);
      const wordToHide = eligibleWords[randomIndex];
      setMissingWord(wordToHide);
      setDisplayText(
        sourceText.replace(
          new RegExp(
            `\\b${wordToHide.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            "gi"
          ),
          "_____"
        )
      );
    }
  }, [sourceText]);

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

  const handleValidate = () => {
    if (!userAnswer.trim() || !missingWord) return;

    // Normaliser les deux chaînes pour la comparaison (insensible à la casse)
    const normalizedUserAnswer = normalizeString(userAnswer);
    const normalizedMissing = normalizeString(missingWord);

    // Comparer le mot écrit avec le mot manquant dans la phrase russe
    const correct = normalizedUserAnswer === normalizedMissing;
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
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* Affichage de la phrase russe avec le mot manquant */}
        <div className="text-center py-4">
          <div className="text-4xl font-bold mb-4">{displayText}</div>
          <div className="text-lg text-muted-foreground mb-4">{targetText}</div>
        </div>

        <div className="space-y-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Entrez le mot manquant en russe..."
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
                      Le mot manquant est :{" "}
                      <span className="font-bold">{missingWord}</span>
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
      </CardContent>
    </Card>
  );
}
