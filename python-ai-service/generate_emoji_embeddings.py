import psycopg2
from sentence_transformers import SentenceTransformer
import os

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

conn = psycopg2.connect(
    dbname="filmoji_db",
    user="postgres",
    password=os.getenv("DB_PASSWORD"),
    host="localhost"
)

cur = conn.cursor()


def generate_emoji_embeddings():

    cur.execute("""
        SELECT id, emoji, name, description
        FROM emojis
    """)

    emojis = cur.fetchall()

    texts = []
    ids = []

    for row in emojis:
        emoji_id = row[0]
        emoji_char = row[1]
        name = row[2]
        description = row[3] or ""

        text = f"{emoji_char} {name} {description}"

        texts.append(text)
        ids.append(emoji_id)

    # Generate all embeddings at once
    vectors = model.encode(texts)

    # Update database
    for i in range(len(ids)):
        cur.execute("""
            UPDATE emojis
            SET embedding = %s
            WHERE id = %s
        """, (vectors[i].tolist(), ids[i]))

    conn.commit()

    print("Emoji embeddings generated successfully")


if __name__ == "__main__":
    generate_emoji_embeddings()