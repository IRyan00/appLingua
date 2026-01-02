export interface VocabularyItem {
  russian: string;
  french: string;
}

export interface SessionConfig {
  direction: "ru-fr" | "fr-ru"; // "1" = ru->fr, "2" = fr->ru
  contentType: "mots" | "phrases";
  audio: "avec" | "sans";
  gameMode: "traduction" | "qcm1" | "mot-manquant" | "qcm2";
}
