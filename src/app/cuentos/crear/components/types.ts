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
  description: Record<string, string>;
  visual_description: Record<string, string>;
  imageUrl: string;
  species: Record<string, string>;
  gender: Record<string, string>;
  age: string;
  imageHint: string;
}

export type AnyCharacter = Character | PredefinedCharacter;

export interface CharacterWithCustomization {
  character: AnyCharacter;
  visual_description: string;
}
