-- Filmoji Database Initialization Script
-- Requires pgvector extension

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
    genres TEXT,
    poster_url VARCHAR(500),
    trailer_key VARCHAR(100),
    release_year INTEGER,
    rating FLOAT,
    language VARCHAR(10) DEFAULT 'en',
    movie_vector vector(384),
    created_at TIMESTAMP DEFAULT NOW()
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

-- Seed the 20 curated onboarding movies (without vectors - vectors are populated by MovieSeeder on startup)
INSERT INTO movies (tmdb_id, title, synopsis, genres, release_year, rating, language) VALUES
(155, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'Action,Crime,Drama,Thriller', 2008, 9.0, 'en'),
(194, 'Amélie', 'At a tiny Parisian café, the adorable yet painfully shy Amélie accidentally discovers a gift for helping others.', 'Comedy,Romance', 2001, 8.3, 'fr'),
(496243, 'Parasite', 'All unemployed, Ki-taek''s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.', 'Comedy,Thriller,Drama', 2019, 8.5, 'ko'),
(120467, 'The Grand Budapest Hotel', 'The adventures of Gustave H, a legendary concierge at a famous hotel from the fictional Republic of Zubrowka between the first and second World Wars.', 'Adventure,Comedy,Crime', 2014, 8.1, 'en'),
(157336, 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.', 'Adventure,Drama,Science Fiction', 2014, 8.6, 'en'),
(27578, 'Mamma Mia!', 'The story of a bride trying to find out which of three men is her father, told using the music of the Swedish pop group ABBA.', 'Comedy,Romance,Music', 2008, 6.9, 'en'),
(419430, 'Get Out', 'A young African-American visits his white girlfriend''s parents for the weekend, where his simmering unease about their reception of him eventually reaches a boiling point.', 'Mystery,Thriller,Horror', 2017, 7.7, 'en'),
(129, 'Spirited Away', 'A sullen 10-year-old girl wanders into a world ruled by gods, witches, and monsters; where humans are changed into beasts.', 'Animation,Family,Fantasy', 2001, 8.5, 'ja'),
(76341, 'Mad Max: Fury Road', 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.', 'Action,Adventure,Science Fiction', 2015, 7.8, 'en'),
(38, 'Eternal Sunshine of the Spotless Mind', 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.', 'Drama,Romance,Science Fiction', 2004, 8.1, 'en'),
(546554, 'Knives Out', 'When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Blanc is enlisted to investigate.', 'Comedy,Crime,Drama,Mystery', 2019, 7.9, 'en'),
(545611, 'Everything Everywhere All at Once', 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.', 'Action,Adventure,Comedy,Science Fiction', 2022, 7.8, 'en'),
(598, 'City of God', 'In the slums of Rio, two kids'' paths diverge as one struggles to become a photographer and the other a kingpin.', 'Drama,Crime', 2002, 8.6, 'pt'),
(376867, 'Moonlight', 'A young man''s life story as he experiences the everyday struggles of childhood, adolescence, and burgeoning adulthood in a rough neighborhood of Miami.', 'Drama', 2016, 7.4, 'en'),
(2493, 'The Princess Bride', 'While home sick in bed, a young boy''s grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies and allies in his quest to be reunited with his true love.', 'Adventure,Comedy,Fantasy,Romance', 1987, 8.0, 'en'),
(438631, 'Dune', 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.', 'Science Fiction,Adventure', 2021, 7.8, 'en'),
(399055, 'The Shape of Water', 'At a top secret research facility in the 1960s, a lonely janitor forms a unique relationship with an amphibious creature that is being held in captivity.', 'Drama,Fantasy,Romance', 2017, 7.3, 'en'),
(9603, 'Clueless', 'Shallow, rich and socially successful Cher is at the top of her Beverly Hills high school''s social pecking order. Seeing herself as a matchmaker, Cher first coaxes two teachers into dating each other.', 'Comedy,Romance', 1995, 6.8, 'en'),
(1417, 'Pan''s Labyrinth', 'In the Falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.', 'Drama,Fantasy,Thriller', 2006, 7.9, 'es'),
(372058, 'Your Name', 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?', 'Animation,Drama,Romance', 2016, 8.4, 'ja');

-- Seed onboarding_movies with strategic tags
INSERT INTO onboarding_movies (movie_id, strategic_tags)
SELECT m.id, tags.strategic_tags
FROM movies m
JOIN (VALUES
    (155, ARRAY['dark', 'intense', 'thriller', 'action', 'complex_narrative']),
    (194, ARRAY['whimsical', 'romantic', 'feel_good', 'non_english', 'quirky']),
    (496243, ARRAY['dark_comedy', 'thriller', 'non_english', 'social_commentary', 'suspense']),
    (120467, ARRAY['quirky', 'comedy', 'colorful', 'fast_paced', 'witty']),
    (157336, ARRAY['sci_fi', 'emotional', 'epic', 'slow_burn', 'cerebral']),
    (27578, ARRAY['musical', 'light_hearted', 'fun', 'feel_good', 'romance']),
    (419430, ARRAY['horror', 'thriller', 'social_commentary', 'suspense', 'dark']),
    (129, ARRAY['animation', 'fantasy', 'magical', 'non_english', 'family']),
    (76341, ARRAY['action', 'high_energy', 'visceral', 'fast_paced', 'dystopian']),
    (38, ARRAY['romance', 'sci_fi', 'melancholic', 'cerebral', 'emotional']),
    (546554, ARRAY['mystery', 'comedy', 'witty', 'fast_paced', 'ensemble']),
    (545611, ARRAY['sci_fi', 'comedy', 'chaotic', 'emotional', 'family']),
    (598, ARRAY['crime', 'drama', 'intense', 'non_english', 'gritty']),
    (376867, ARRAY['drama', 'quiet', 'emotional', 'lgbtq', 'slow_burn']),
    (2493, ARRAY['fantasy', 'comedy', 'classic', 'romance', 'fun']),
    (438631, ARRAY['sci_fi', 'epic', 'serious', 'slow_burn', 'visually_stunning']),
    (399055, ARRAY['fantasy', 'romance', 'unusual', 'emotional', 'visually_stunning']),
    (9603, ARRAY['comedy', 'light_hearted', 'nostalgic', 'romance', 'feel_good']),
    (1417, ARRAY['fantasy', 'dark', 'non_english', 'emotional', 'visually_stunning']),
    (372058, ARRAY['animation', 'romance', 'emotional', 'non_english', 'fantasy'])
) AS tags(tmdb_id, strategic_tags) ON m.tmdb_id = tags.tmdb_id;
