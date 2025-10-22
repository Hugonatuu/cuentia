export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt: any; // Can be a server timestamp
}

export interface PredefinedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export type AnyCharacter = Character | PredefinedCharacter;

export interface CharacterWithCustomization {
  character: AnyCharacter;
  customization: string;
}

    