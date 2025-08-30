export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface LogEntry extends Message {
  created_at: string;
}

// Types for the direct REST API call, replacing the SDK's Content type.
export interface ApiPart {
  text: string;
}

export interface ApiContent {
  role: 'user' | 'model';
  parts: ApiPart[];
}