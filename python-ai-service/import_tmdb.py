import requests
import psycopg2
import os

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

BASE_URL = "https://api.themoviedb.org/3"

conn = psycopg2.connect(
    dbname="filmoji_db",
    user="postgres",
    password=os.getenv("DB_PASSWORD"),
    host="localhost"
)

cur = conn.cursor()


def fetch_genres():
    url = f"{BASE_URL}/genre/movie/list"
    response = requests.get(url, params={"api_key": TMDB_API_KEY})
    response.raise_for_status()
    data = response.json()

    for genre in data["genres"]:
        cur.execute("""
            INSERT INTO genres (id, name)
            VALUES (%s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (genre["id"], genre["name"]))

    conn.commit()


def fetch_movies(page=1):
    url = f"{BASE_URL}/movie/popular"
    response = requests.get(url, params={
        "api_key": TMDB_API_KEY,
        "page": page
    })
    response.raise_for_status()
    return response.json()["results"]


def insert_movie(movie):
    cur.execute("""
        INSERT INTO movies (tmdb_id, title, overview, release_date,
                            popularity, vote_average, poster_path)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tmdb_id) DO NOTHING
        RETURNING id
    """, (
        movie["id"],
        movie["title"],
        movie.get("overview"),
        movie.get("release_date") or None,
        movie.get("popularity"),
        movie.get("vote_average"),
        movie.get("poster_path")
    ))

    result = cur.fetchone()

    if result:
        movie_db_id = result[0]

        for genre_id in movie["genre_ids"]:
            cur.execute("""
                INSERT INTO movie_genres (movie_id, genre_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (movie_db_id, genre_id))

    # conn.commit()


def main():
    fetch_genres()

    for page in range(1, 6):  # first 5 pages (~100 movies)
        movies = fetch_movies(page)
        for movie in movies:
            insert_movie(movie)
        
        conn.commit()

    print("Import complete")


if __name__ == "__main__":
    main()