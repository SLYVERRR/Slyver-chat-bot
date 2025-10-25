export interface TextPart {
  text: string;
  inlineData?: never;
}

export interface InlineDataPart {
  text?: never;
  inlineData: {
    mimeType: string;
    data: string; // base64 string
  };
}

export type Part = TextPart | InlineDataPart;

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Part[];
}
