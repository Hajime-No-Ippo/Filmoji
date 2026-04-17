import requests
import psycopg2
import os
import urllib.parse

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

BASE_URL = "https://api.themoviedb.org/3"


def get_db_connection_from_env():
    # Support full DB URL in DB_URL or DATABASE_URL (postgresql://user:pass@host:port/db)
    db_url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if db_url:
        parsed = urllib.parse.urlparse(db_url)
        dbname = parsed.path.lstrip("/") or os.getenv("DB_NAME", "filmoji")
        user = parsed.username or os.getenv("DB_USER", "postgres")
        password = parsed.password or os.getenv("DB_PASSWORD", "ice37377")
        host = parsed.hostname or os.getenv("DB_HOST", "localhost")
        port = parsed.port or int(os.getenv("DB_PORT", 5432))
    else:
        dbname = os.getenv("DB_NAME", "filmoji")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASSWORD", "ice37377")
        host = os.getenv("DB_HOST", "db")
        port = int(os.getenv("DB_PORT", 5432))

    return psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)


conn = get_db_connection_from_env()
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
    genres = movie.get("genre_ids", [])

    cur.execute("""
        INSERT INTO movies (
            tmdb_id,
            title,
            synopsis,
            poster_url,
            release_year,
            rating,
            language
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (tmdb_id) DO NOTHING
        RETURNING id
    """, (
        movie["id"],
        movie.get("title"),
        movie.get("overview"),
        f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get("poster_path") else None,
        int(movie.get("release_date", "0")[:4]) if movie.get("release_date") else None,
        movie.get("vote_average"),
        movie.get("original_language", "en")
    ))

    result = cur.fetchone()

    # If the insert returned nothing, the row already exists — fetch its id
    if result:
        movie_db_id = result[0]
    else:
        cur.execute("SELECT id FROM movies WHERE tmdb_id = %s", (movie["id"],))
        row = cur.fetchone()
        movie_db_id = row[0] if row else None

    if movie_db_id:
        for genre_id in genres:
            cur.execute("""
                INSERT INTO movie_genres (movie_id, genre_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (movie_db_id, genre_id))

    conn.commit()


def main():
    fetch_genres()

    pages = int(os.getenv("TMDB_PAGES", "5"))
    for page in range(1, pages + 1):  # configurable number of pages
        movies = fetch_movies(page)
        for movie in movies:
            insert_movie(movie)

    conn.commit()

    print("Import complete")


if __name__ == "__main__":
    main()

# Run it separately
# docker exec -it filmoji-ai python import_tmdb.py