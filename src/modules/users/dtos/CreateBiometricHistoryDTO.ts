export interface CreateBiometricHistoryDTO {
  userId: string;
  weight: number;
  height: number;
  anthropometry: {
    torax: number;
    cintura: number;
    quadril: number;
    braco_esquerdo?: number;
    braco_direito?: number;
    coxa_esquerda?: number;
    coxa_direita?: number;
    panturrilha_esquerda?: number;
    panturrilha_direita?: number;
  };
  evolutionPhotos: {
    frontalUrl: string;
    perfilUrl: string;
    costasUrl: string;
  };
}