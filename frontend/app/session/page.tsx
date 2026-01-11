"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionConfig, VocabularyItem } from "@/types/session";
import wordsData from "@/data/words.json";
import phrasesData from "@/data/phrases.json";
import { getWordStats, getSelectionWeight } from "@/lib/stats";
import { TranslationMode } from "@/components/game-modes/TranslationMode";
import { QcmMode } from "@/components/game-modes/QcmMode";
import { ArrowLeft, Volume2 } from "lucide-react";

function SessionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<
    VocabularyItem[]
  >([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Fonction pour sélectionner le vocabulaire avec pondération
  const selectWeightedVocabulary = (
    vocabulary: VocabularyItem[]
  ): VocabularyItem[] => {
    // Créer un tableau avec les poids
    const weightedItems: Array<{ item: VocabularyItem; weight: number }> =
      vocabulary.map((item) => {
        const stats = getWordStats(item.russian, item.french);
        const weight = getSelectionWeight(stats);
        return { item, weight };
      });

    // Sélectionner les items selon leur poids (système de roulette pondérée)
    const selected: VocabularyItem[] = [];
    const totalItems = Math.min(vocabulary.length * 2, 50); // Limiter à 50 items max

    for (let i = 0; i < totalItems; i++) {
      // Calculer la somme totale des poids
      const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0);

      // Sélectionner un nombre aléatoire entre 0 et totalWeight
      let random = Math.random() * totalWeight;

      // Trouver l'item correspondant
      for (const weighted of weightedItems) {
        random -= weighted.weight;
        if (random <= 0) {
          selected.push(weighted.item);
          break;
        }
      }
    }

    // Mélanger le résultat final
    return selected.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const direction = searchParams.get("direction");
    const contentType = searchParams.get("contentType");
    const audio = searchParams.get("audio");
    const gameMode = searchParams.get("gameMode");

    if (!direction || !contentType || !audio || !gameMode) {
      router.push("/");
      return;
    }

    const sessionConfig: SessionConfig = {
      direction: direction === "1" ? "ru-fr" : "fr-ru",
      contentType: contentType as "mots" | "phrases",
      audio: audio as "avec" | "sans",
      gameMode: gameMode as "traduction" | "qcm1" | "qcm2",
    };

    setConfig(sessionConfig);

    // Charger les données appropriées
    const data = sessionConfig.contentType === "mots" ? wordsData : phrasesData;
    setVocabulary(data as VocabularyItem[]);

    // Sélectionner le vocabulaire avec pondération basée sur les stats
    const weightedVocabulary = selectWeightedVocabulary(
      data as VocabularyItem[]
    );
    setShuffledVocabulary(weightedVocabulary);
  }, [searchParams, router]);

  // Réinitialiser l'état quand on change d'item
  useEffect(() => {
    setIsValidated(false);
    setIsCorrect(null);
  }, [currentIndex]);

  // Gérer la touche Entrée pour passer au suivant après validation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        isValidated &&
        (config?.gameMode === "traduction" ||
          config?.gameMode === "qcm1" ||
          config?.gameMode === "qcm2")
      ) {
        if (currentIndex < shuffledVocabulary.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    };

    if (
      isValidated &&
      (config?.gameMode === "traduction" ||
        config?.gameMode === "qcm1" ||
        config?.gameMode === "qcm2")
    ) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isValidated, currentIndex, shuffledVocabulary.length, config?.gameMode]);

  if (!config || shuffledVocabulary.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  const currentItem = shuffledVocabulary[currentIndex];
  const sourceText =
    config.direction === "ru-fr" ? currentItem.russian : currentItem.french;
  const targetText =
    config.direction === "ru-fr" ? currentItem.french : currentItem.russian;

  const handleNext = () => {
    if (currentIndex < shuffledVocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleValidate = (isCorrect: boolean) => {
    setIsCorrect(isCorrect);
    setIsValidated(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 ">
      <Card className="w-full max-w-3xl border-1 border-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <CardTitle className="text-center text-xl">
              Session d'apprentissage
            </CardTitle>
            <div className="w-24" />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {currentIndex + 1} / {shuffledVocabulary.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Affichage du mot/phrase source */}
          <div className="text-center py-8">
            <div className="text-4xl font-bold mb-4">{sourceText}</div>
            {config.audio === "avec" && (
              <Button variant="outline" size="icon" className="mt-4">
                <Volume2 className="w-5 h-5" />
              </Button>
            )}
          </div>
          {/* Mode traduction */}
          {config.gameMode === "traduction" && (
            <TranslationMode
              sourceText={sourceText}
              targetText={targetText}
              currentItem={currentItem}
              onNext={handleNext}
              onValidate={handleValidate}
              isValidated={isValidated}
              isCorrect={isCorrect}
              canGoNext={currentIndex < shuffledVocabulary.length - 1}
            />
          )}
          {/* Mode QCM */}
          {(config.gameMode === "qcm1" || config.gameMode === "qcm2") && (
            <QcmMode
              sourceText={sourceText}
              targetText={targetText}
              currentItem={currentItem}
              allVocabulary={vocabulary}
              direction={config.direction}
              onNext={handleNext}
              onValidate={handleValidate}
              isValidated={isValidated}
              isCorrect={isCorrect}
              canGoNext={currentIndex < shuffledVocabulary.length - 1}
            />
          )}
          {/* Autres modes de jeu (à implémenter) */}
          {config.gameMode !== "traduction" &&
            config.gameMode !== "qcm1" &&
            config.gameMode !== "qcm2" && (
              <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  Mode: {config.gameMode}
                  <br />
                  (À implémenter)
                </div>
              </div>
            )}
          {/* Navigation (seulement si pas en mode traduction/QCM ou si pas validé) */}
          {config.gameMode !== "traduction" &&
            config.gameMode !== "qcm1" &&
            config.gameMode !== "qcm2" && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1"
                >
                  Précédent
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === shuffledVocabulary.length - 1}
                  className="flex-1"
                >
                  Suivant
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div>Chargement...</div>
        </div>
      }
    >
      <SessionPageContent />
    </Suspense>
  );
}
