# from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import List

# app = FastAPI()

# class UserData(BaseModel):
#     personality: str
#     watched_genres: List[str]
#     clicked_genres: List[str]

# @app.post("/recommend")
# def recommend(user: UserData):

#     recommendations = []

#     genre_map = {
#         "Adventurous": ["Action", "Thriller"],
#         "Romantic": ["Romance", "Drama"],
#         "Analytical": ["Sci-Fi", "Mystery"]
#     }

#     preferred = genre_map.get(user.personality, [])

#     for genre in preferred:
#         score = 0.5

#         if genre in user.watched_genres:
#             score += 0.3

#         if genre in user.clicked_genres:
#             score += 0.2

#         recommendations.append({
#             "genre": genre,
#             "score": score
#         })

#     recommendations.sort(key=lambda x: x["score"], reverse=True)

#     return {"recommendations": recommendations}

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import psycopg2
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Load HuggingFace embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Database connection (Supabase PostgreSQL)
conn = psycopg2.connect(
    host="YOUR_SUPABASE_HOST",
    database="postgres",
    user="postgres",
    password="YOUR_PASSWORD",
    port=5432
)

cur = conn.cursor()


class UserData(BaseModel):
    emojis: List[str]
    watched_movies: List[str]


def load_movies():
    """
    Load movies from database
    """

    cur.execute("""
        SELECT id, title, overview
        FROM movies
        WHERE overview IS NOT NULL
        LIMIT 500
    """)

    rows = cur.fetchall()

    movies = []

    for r in rows:
        movies.append({
            "id": r[0],
            "title": r[1],
            "overview": r[2]
        })

    return movies


def compute_movie_vectors(movies):
    """
    Convert movie text into vectors
    """

    movie_vectors = {}

    for movie in movies:

        text = movie["title"] + " " + movie["overview"]

        vector = model.encode(text)

        movie_vectors[movie["id"]] = vector

    return movie_vectors


@app.post("/recommend")
def recommend(user: UserData):

    # Load movies from database
    movies = load_movies()

    # Precompute movie vectors
    movie_vectors = compute_movie_vectors(movies)

    # Build user preference text
    user_text = " ".join(user.emojis + user.watched_movies)

    # Encode user vector
    user_vector = model.encode(user_text)

    results = []

    for movie in movies:

        mv = movie_vectors[movie["id"]]

        score = cosine_similarity([user_vector], [mv])[0][0]

        results.append({
            "movie_id": movie["id"],
            "title": movie["title"],
            "score": float(score)
        })

    # Sort by similarity score
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "recommendations": results[:10]
    }