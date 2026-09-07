export interface LibraryVideo {
  name: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export type LibraryKind = 'image' | 'video';

export interface LibraryImage {
  kind: LibraryKind;
  name: string;
  path: string;
  url: string;
  folder: string;
  extension: string;
  size: number;
  modifiedAt: string;
}

