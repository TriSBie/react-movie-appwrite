import { Client, Databases, ID, Query } from "appwrite";
import type { Movie, MovieDocument } from "../types";

const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);


export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
    // 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.contains('searchTerm', searchTerm.trim()),
        ])

        // 2. If it does, update the count
        if (result.documents.length > 0) {
            const doc = result.documents[0];
            if (doc) {
                await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                    count: doc.count + 1,
                })
            }
            // 3. If it doesn't, create a new document with the search term and count as 1
        } else {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id.toString(),
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                title: movie.title,
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export const getTrendingMovies = async (): Promise<MovieDocument[] | []> => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents as unknown as MovieDocument[] || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}
