"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MessageSquare,
  Volume2,
  VolumeX,
  ListChecks,
  Shuffle,
  Play,
  ArrowLeftRight,
  Languages,
  AudioLines,
  GamepadDirectional,
  TableOfContents,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [direction, setDirection] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<string | null>(null);

  const handleStartSession = () => {
    // Vérifier que tous les paramètres sont sélectionnés
    if (!direction || !contentType || !audio || !gameMode) {
      alert("Veuillez sélectionner tous les paramètres avant de commencer");
      return;
    }

    // Construire l'URL avec les paramètres
    const params = new URLSearchParams({
      direction,
      contentType,
      audio,
      gameMode,
    });

    // Rediriger vers la page de session
    router.push(`/session?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl border-1 border-accent">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🇷🇺 Русский - Français 🇫🇷
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Configurer la session d'apprentissage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Direction */}
          <CardTitle className="text-lg flex items-center">
            <ArrowLeftRight className="w-4 h-4 mr-2" /> Direction
          </CardTitle>
          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={direction === "1" ? "default" : "outline"}
              onClick={() => setDirection("1")}
            >
              <span className="mr-2">🇷🇺</span>
              <ArrowLeftRight className="h-4 w-4 mx-1" />
              <span className="ml-2">🇫🇷</span>
            </Button>
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={direction === "2" ? "default" : "outline"}
              onClick={() => setDirection("2")}
            >
              <span className="mr-2">🇫🇷</span>
              <ArrowLeftRight className="h-4 w-4 mx-1" />
              <span className="ml-2">🇷🇺</span>
            </Button>
          </div>

          {/* Type de contenu */}
          <CardTitle className="text-lg flex items-center">
            <TableOfContents className="w-4 h-4 mr-2" /> Type de contenu
          </CardTitle>
          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={contentType === "mots" ? "default" : "outline"}
              onClick={() => setContentType("mots")}
            >
              <BookOpen className="w-4 h-4" /> Mots
            </Button>
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={contentType === "phrases" ? "default" : "outline"}
              onClick={() => setContentType("phrases")}
            >
              <MessageSquare className="w-4 h-4" /> Phrases
            </Button>
          </div>

          {/* Audio */}
          <CardTitle className="text-lg flex items-center">
            {" "}
            <AudioLines className="w-4 h-4 mr-2" /> Audio
          </CardTitle>
          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={audio === "avec" ? "default" : "outline"}
              onClick={() => setAudio("avec")}
            >
              <Volume2 className="w-4 h-4" /> Avec audio
            </Button>
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={audio === "sans" ? "default" : "outline"}
              onClick={() => setAudio("sans")}
            >
              <VolumeX className="w-4 h-4" /> Sans audio
            </Button>
          </div>

          {/* Modes de jeu */}
          <CardTitle className="text-lg flex items-center">
            <GamepadDirectional className="w-4 h-4 mr-2" /> Mode de jeu
          </CardTitle>
          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={gameMode === "traduction" ? "default" : "outline"}
              onClick={() => setGameMode("traduction")}
            >
              <Languages className="w-4 h-4" /> Traduction
            </Button>
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={gameMode === "qcm1" ? "default" : "outline"}
              onClick={() => setGameMode("qcm1")}
            >
              <ListChecks className="w-4 h-4" /> QCM
            </Button>
          </div>
          {/* <div className="flex gap-4">
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={gameMode === "mot-manquant" ? "default" : "outline"}
              onClick={() => setGameMode("mot-manquant")}
              disabled={true}
            >
              <BookOpen className="w-4 h-4" /> Mot manquant
            </Button>
            <Button
              className="flex-1 h-14 border-1 border-accent"
              variant={gameMode === "qcm2" ? "default" : "outline"}
              onClick={() => setGameMode("qcm2")}
              disabled={true}
            >
              <Shuffle className="w-4 h-4" /> Remettre en ordre
            </Button>
          </div> */}

          {/* Bouton "jouer" */}
          <div className="pt-2">
            <Button
              className="w-full h-14 border-2 border-accent"
              onClick={handleStartSession}
            >
              <Play className="w-4 h-4" /> Commencer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
