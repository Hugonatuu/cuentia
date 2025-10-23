export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  species: string;
  gender: string;
  age: string;
  createdAt: any; // Can be a server timestamp
}

export interface PredefinedCharacter {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  species: string;
  gender: string;
  age: string;
  imageHint: string;
}

export type AnyCharacter = Character | PredefinedCharacter;

export interface CharacterWithCustomization {
  character: AnyCharacter;
  visual_description: string;
}

    