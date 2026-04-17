import psycopg2
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

conn = psycopg2.connect(
    dbname="filmoji",
    user="postgres",
    password="postgres_password",
    host="db",
    port=5432
)

cur = conn.cursor()

def generate_movie_embeddings():

    cur.execute("""
        SELECT id, title, synopsis
        FROM movies
    """)

    movies = cur.fetchall()

    texts = []
    ids = []

    for row in movies:
        movie_id = row[0]
        title = row[1]
        synopsis = row[2] or ""

        text = f"{title} {synopsis}"

        texts.append(text)
        ids.append(movie_id)

    # Generate embeddings AFTER texts are ready
    vectors = model.encode(texts)

    # Normalize (important for cosine similarity)
    vectors = normalize(vectors)

    for i in range(len(ids)):
        cur.execute("""
            UPDATE movies
            SET movie_vector = %s::vector
            WHERE id = %s
        """, (vectors[i].tolist(), ids[i]))

    conn.commit()
    print("Movie embeddings generated successfully")


if __name__ == "__main__":
    generate_movie_embeddings()