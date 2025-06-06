export interface Movie {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string;
  release_date: string;
  original_language: string;
}

export interface MovieDocument {
  $id: string;
  count: number;
  poster_url: string;
  movie_id: string;
  title: string;
}