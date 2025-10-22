export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface PredefinedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export type AnyCharacter = Character | PredefinedCharacter;
