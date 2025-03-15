// App Store API types
export interface AppData {
  id: string;
  appId: string;
  title: string;
  description: string;
  icon: string;
  developer: string;
  score: number;
  reviews: number;
  price: number;
  free: boolean;
  genres: string[];
  url: string;
  [key: string]: any; // For other properties returned by the API
}

export interface ReviewData {
  id: string;
  userName: string;
  score: number;
  title: string;
  text: string;
  version: string;
  updated: string;
  appId?: string;
  appTitle?: string;
  app?: AppData;
  [key: string]: any; // For other properties returned by the API
}

export interface AnalysisResult {
  suggestions: string[];
  commonIssues: string[];
}

// Country and language options
export interface CountryOption {
  value: string;
  label: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

// App state
export interface AppState {
  searchTerm: string;
  country: string;
  language: string;
  searchResults: AppData[];
  selectedApps: AppData[];
  reviews: ReviewData[];
  isLoading: boolean;
  error: string | null;
  analysis: AnalysisResult | null;
} 