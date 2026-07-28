export interface SearchResultItem {
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  artworkUrl: string | null;
  price: number | null;
  viewUrl: string | null;
}

export interface LibraryItemResponse {
  id: number;
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  artworkUrl: string | null;
  price: number | null;
  userRating: number | null;
  userNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface GenreCount {
  genre: string;
  count: number;
}
export interface YearCount {
  year: number;
  count: number;
}
export interface TrackCountBucket {
  bucketLabel: string;
  count: number;
}
export interface ArtistCount {
  artist: string;
  count: number;
}
export interface RatingBreakdown {
  rating: number;
  count: number;
}

export interface AnalyticsResponse {
  totalAlbums: number;
  averageRating: number;
  averagePrice: number;
  genreDistribution: GenreCount[];
  releasesByYear: YearCount[];
  trackCountHistogram: TrackCountBucket[];
  topArtists: ArtistCount[];
  ratingBreakdown: RatingBreakdown[];
}

export interface Recommendation {
  reason: string;
  genre: string;
}

export interface InsightResponse {
  trendSummary: string;
  observations: string[];
  recommendations: Recommendation[];
  generatedBy: "heuristic" | "llm";
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}
