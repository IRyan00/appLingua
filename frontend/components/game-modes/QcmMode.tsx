"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Shuffle } from "lucide-react";
import { VocabularyItem } from "@/types/session";
import { updateWordStats } from "@/lib/stats";

interface QcmModeProps {
  sourceText: string;
  targetText: string;
  currentItem: VocabularyItem;
  allVocabulary: VocabularyItem[];
  direction: "ru-fr" | "fr-ru";
  onNext: () => void;
  onValidate: (isCorrect: boolean) => void;
  isValidated: boolean;
  isCorrect: boolean | null;
  canGoNext: boolean;
}

export function QcmMode({
  sourceText,
  targetText,
  currentItem,
  allVocabulary,
  direction,
  onNext,
  onValidate,
  isValidated,
  isCorrect,
  canGoNext,
}: QcmModeProps) {
  const [qcmOptions, setQcmOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [localValidated, setLocalValidated] = useState(false);
  const [localCorrect, setLocalCorrect] = useState<boolean | null>(null);

  // Normaliser les chaînes
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/\s+/g, " ");
  };

  // Fonction pour générer les options QCM
  const generateQcmOptions = (
    correctAnswer: string,
    allVocabulary: VocabularyItem[],
    direction: "ru-fr" | "fr-ru"
  ): string[] => {
    const options = [correctAnswer];
    const wrongAnswers: string[] = [];
    const usedIndices = new Set<number>();

    while (wrongAnswers.length < 3 && usedIndices.size < allVocabulary.length) {
      const randomIndex = Math.floor(Math.random() * allVocabulary.length);

      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        const randomItem = allVocabulary[randomIndex];
        const wrongAnswer =
          direction === "ru-fr" ? randomItem.french : randomItem.russian;

        if (
          wrongAnswer !== correctAnswer &&
          !wrongAnswers.includes(wrongAnswer)
        ) {
          wrongAnswers.push(wrongAnswer);
        }
      }
    }

    while (wrongAnswers.length < 3) {
      const randomIndex = Math.floor(Math.random() * allVocabulary.length);
      const randomItem = allVocabulary[randomIndex];
      const wrongAnswer =
        direction === "ru-fr" ? randomItem.french : randomItem.russian;
      if (
        wrongAnswer !== correctAnswer &&
        !wrongAnswers.includes(wrongAnswer)
      ) {
        wrongAnswers.push(wrongAnswer);
      }
    }

    options.push(...wrongAnswers);
    return options.sort(() => Math.random() - 0.5);
  };

  // Générer les options quand on change d'item
  useEffect(() => {
    const options = generateQcmOptions(targetText, allVocabulary, direction);
    setQcmOptions(options);
    setSelectedOption(null);
    setLocalValidated(false);
    setLocalCorrect(null);
  }, [targetText, allVocabulary, direction]);

  const handleQcmSelect = (option: string) => {
    if (localValidated || isValidated) return;

    setSelectedOption(option);
    const normalizedSelected = normalizeString(option);
    const normalizedTarget = normalizeString(targetText);

    const correct = normalizedSelected === normalizedTarget;
    setLocalCorrect(correct);
    setLocalValidated(true);

    // Mettre à jour les statistiques
    updateWordStats(currentItem.russian, currentItem.french, correct);
    onValidate(correct);
  };

  // Utiliser l'état local ou les props
  const displayValidated = localValidated || isValidated;
  const displayCorrect = localCorrect !== null ? localCorrect : isCorrect;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {qcmOptions.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrectOption =
            normalizeString(option) === normalizeString(targetText);
          let buttonVariant:
            | "default"
            | "outline"
            | "destructive"
            | "secondary" = "outline";

          if (displayValidated) {
            if (isCorrectOption) {
              buttonVariant = "default";
            } else if (isSelected && !isCorrectOption) {
              buttonVariant = "destructive";
            } else {
              buttonVariant = "outline";
            }
          } else if (isSelected) {
            buttonVariant = "default";
          }

          return (
            <Button
              key={index}
              onClick={() => handleQcmSelect(option)}
              disabled={displayValidated}
              variant={buttonVariant}
              className={`h-14 text-left justify-start ${
                displayValidated && isCorrectOption
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                  : displayValidated && isSelected && !isCorrectOption
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">{option}</div>
                {displayValidated && isCorrectOption && (
                  <Check className="w-5 h-5" />
                )}
                {displayValidated && isSelected && !isCorrectOption && (
                  <X className="w-5 h-5" />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {displayValidated && (
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
