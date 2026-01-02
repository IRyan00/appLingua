export interface WordStats {
  totalAttempts: number;
  correctAttempts: number;
  lastSeen?: number; // timestamp
}

export interface StatsData {
  [key: string]: WordStats; // key = "russian|french" pour identifier le mot/phrase
}

const STATS_STORAGE_KEY = "lingua-stats";

// Récupérer toutes les statistiques
export function getStats(): StatsData {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Sauvegarder les statistiques
export function saveStats(stats: StatsData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des stats:", error);
  }
}

// Obtenir les stats d'un mot/phrase spécifique
export function getWordStats(russian: string, french: string): WordStats {
  const stats = getStats();
  const key = `${russian}|${french}`;
  return stats[key] || { totalAttempts: 0, correctAttempts: 0 };
}

// Mettre à jour les stats après une tentative
export function updateWordStats(
  russian: string,
  french: string,
  isCorrect: boolean
): void {
  const stats = getStats();
  const key = `${russian}|${french}`;

  if (!stats[key]) {
    stats[key] = { totalAttempts: 0, correctAttempts: 0 };
  }

  stats[key].totalAttempts += 1;
  if (isCorrect) {
    stats[key].correctAttempts += 1;
  }
  stats[key].lastSeen = Date.now();

  saveStats(stats);
}

// Calculer le taux de réussite (0 = toujours raté, 1 = toujours réussi)
export function getSuccessRate(stats: WordStats): number {
  if (stats.totalAttempts === 0) return 0.5; // Par défaut, considérer comme moyen
  return stats.correctAttempts / stats.totalAttempts;
}

// Calculer un poids pour la sélection (plus bas = plus souvent sélectionné)
export function getSelectionWeight(stats: WordStats): number {
  const successRate = getSuccessRate(stats);
  // Inverser : taux faible = poids faible = sélectionné plus souvent
  // Taux élevé = poids élevé = sélectionné moins souvent
  // Poids minimum de 0.1 pour les mots jamais vus ou très difficiles
  return Math.max(0.1, 1 - successRate);
}
