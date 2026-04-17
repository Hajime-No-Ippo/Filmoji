CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (linked to Firebase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User profiles with quiz answers and preference vector
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_answers JSONB DEFAULT '{}',
    profile_vector vector(384),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Movies table with pgvector embeddings
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    poster_url VARCHAR(500),
    trailer_key VARCHAR(100),
    release_year INTEGER,
    rating FLOAT,
    language VARCHAR(10) DEFAULT 'en',
    movie_vector vector(384),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE genres (
    id INT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE movie_genres (
    movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);
-- Curated onboarding movies with strategic tags
CREATE TABLE onboarding_movies (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER REFERENCES movies(id),
    strategic_tags TEXT[]
);

-- User interactions (likes, dislikes, watches)
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES movies(id),
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'dislike', 'watch', 'swipe_right', 'swipe_left'
    emoji_context VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX ON movies USING ivfflat (movie_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON user_profiles USING ivfflat (profile_vector vector_cosine_ops) WITH (lists = 10);

-- Standard indexes
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_movie_id ON user_interactions(movie_id);
CREATE INDEX idx_movies_tmdb_id ON movies(tmdb_id);
