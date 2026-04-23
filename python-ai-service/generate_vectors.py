import os
import urllib.parse
import psycopg2
import argparse
from transformers import AutoTokenizer, AutoModel
import numpy as np
import torch


def get_db_connection_from_env():
    db_url = os.getenv("DB_URL") or os.getenv("DATABASE_URL")
    if db_url:
        parsed = urllib.parse.urlparse(db_url)
        dbname = parsed.path.lstrip("/") or os.getenv("DB_NAME", "filmoji")
        user = parsed.username or os.getenv("DB_USER", "DB_USER")
        password = parsed.password or os.getenv("DB_PASSWORD", "DB_PASSWORD")
        host = parsed.hostname or os.getenv("DB_HOST", "DB_HOST")
        port = parsed.port or int(os.getenv("DB_PORT", 5432))
    else:
        dbname = os.getenv("DB_NAME", "filmoji")
        user = os.getenv("DB_USER", "DB_USER")
        password = os.getenv("DB_PASSWORD", "DB_PASSWORD")
        host = os.getenv("DB_HOST", "DB_HOST")
        port = int(os.getenv("DB_PORT", 5432))

    return psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)


def find_vector_columns(cur):
    cur.execute("""
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE udt_name = 'vector' AND table_schema = 'public'
    """)
    return cur.fetchall()


def generate_movie_vectors(cur, model, batch_size=64, force=False):
    # select rows that need vectors
    if force:
        cur.execute("SELECT id, title, synopsis FROM movies")
    else:
        cur.execute("SELECT id, title, synopsis FROM movies WHERE movie_vector IS NULL")

    rows = cur.fetchall()
    if not rows:
        print("No movies to process.")
        return

    ids = []
    texts = []
    for r in rows:
        mid, title, synopsis = r
        text = f"{title or ''} {synopsis or ''}".strip()
        ids.append(mid)
        texts.append(text)

    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        vectors = model(batch_texts)
        # L2-normalize rows
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        vectors = vectors / norms

        for j, vec in enumerate(vectors):
            vec_list = vec.tolist()
            vec_str = '[' + ','.join(map(str, vec_list)) + ']'
            cur.execute("UPDATE movies SET movie_vector = %s::vector WHERE id = %s", (vec_str, batch_ids[j]))

    print(f"Updated {len(ids)} movie vectors")


def generate_user_profile_vectors(cur, model, batch_size=64, force=False):
    # Attempt to use quiz_answers JSONB to build text
    if force:
        cur.execute("SELECT id, quiz_answers FROM user_profiles")
    else:
        cur.execute("SELECT id, quiz_answers FROM user_profiles WHERE profile_vector IS NULL")

    rows = cur.fetchall()
    if not rows:
        print("No user_profiles to process.")
        return

    ids = []
    texts = []
    for r in rows:
        uid, quiz = r
        text = ''
        try:
            if quiz:
                # Flatten JSON values into a single string
                if isinstance(quiz, dict):
                    text = ' '.join([str(v) for v in quiz.values()])
                else:
                    text = str(quiz)
        except Exception:
            text = ''

        ids.append(uid)
        texts.append(text)

    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        vectors = model(batch_texts)
        # L2-normalize rows
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        vectors = vectors / norms

        for j, vec in enumerate(vectors):
            vec_list = vec.tolist()
            vec_str = '[' + ','.join(map(str, vec_list)) + ']'
            cur.execute("UPDATE user_profiles SET profile_vector = %s::vector WHERE id = %s", (vec_str, batch_ids[j]))

    print(f"Updated {len(ids)} user profile vectors")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--table', help='Run only for a specific table (movies|user_profiles)')
    parser.add_argument('--force', action='store_true', help='Recompute vectors even if present')
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--model', default=os.getenv('HF_MODEL', 'sentence-transformers/all-MiniLM-L6-v2'))
    args = parser.parse_args()

    conn = get_db_connection_from_env()
    cur = conn.cursor()

    # Initialize tokenizer and HF model, expose a simple batch encoder function
    tokenizer = AutoTokenizer.from_pretrained(args.model, use_fast=True)
    hf_model = AutoModel.from_pretrained(args.model)
    hf_model.eval()

    def encode_batch_fn(texts):
        inputs = tokenizer(texts, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            outputs = hf_model(**inputs)
            token_emb = outputs.last_hidden_state
            attention_mask = inputs['attention_mask'].unsqueeze(-1)
            summed = (token_emb * attention_mask).sum(1)
            counts = attention_mask.sum(1).clamp(min=1e-9)
            batch_emb = (summed / counts).cpu().numpy()
            return batch_emb

    model = encode_batch_fn

    # If specific table requested, call its handler
    if args.table:
        if args.table == 'movies':
            generate_movie_vectors(cur, model, batch_size=args.batch_size, force=args.force)
        elif args.table == 'user_profiles':
            generate_user_profile_vectors(cur, model, batch_size=args.batch_size, force=args.force)
        else:
            print(f"No handler for table {args.table}")
        conn.commit()
        return

    # Otherwise detect vector columns and run handlers for known tables
    vector_cols = find_vector_columns(cur)
    table_names = {t for (t, c) in vector_cols}

    if 'movies' in table_names:
        generate_movie_vectors(cur, model, batch_size=args.batch_size, force=args.force)
    if 'user_profiles' in table_names:
        generate_user_profile_vectors(cur, model, batch_size=args.batch_size, force=args.force)

    conn.commit()


if __name__ == '__main__':
    main()
