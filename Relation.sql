CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    phone VARCHAR(20) UNIQUE NOT NULL,

    username VARCHAR(50) UNIQUE,

    name VARCHAR(100),

    password_hash TEXT NOT NULL,

    avatar TEXT,

    dob DATE,

    gender VARCHAR(10)
        CHECK (
            gender IN (
                'male',
                'female',
                'other'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,

    balance NUMERIC(12,2) DEFAULT 0,

    icon VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_wallet_name
        UNIQUE (user_id, name)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(10) NOT NULL
        CHECK (type IN ('income', 'expense')),

    icon VARCHAR(50),

    color VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_category_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_category_per_user_type
    UNIQUE(user_id, name, type),

    CONSTRAINT unique_category_color_per_type
        UNIQUE(user_id, type, color)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    wallet_id INT NOT NULL,

    category_id INT NOT NULL,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    note TEXT,

    transaction_date TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);


CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    category_id INT NOT NULL,

    amount NUMERIC(12,2) NOT NULL
        CHECK (amount > 0),

    month INT NOT NULL
        CHECK (month BETWEEN 1 AND 12),

    year INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_budget_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_budget_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_budget_per_month
        UNIQUE(user_id, category_id, month, year)
);

CREATE TABLE saving_goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    name VARCHAR(200) NOT NULL,
    icon VARCHAR(50),
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
    saved_amount NUMERIC(12,2) DEFAULT 0,
    deadline DATE,
    color VARCHAR(20) DEFAULT 'violet',
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_goal_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_goal_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);

CREATE TABLE saving_contributions (
    id SERIAL PRIMARY KEY,
    goal_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_id INT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    note TEXT,
    contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contrib_goal
        FOREIGN KEY (goal_id)
        REFERENCES saving_goals(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_contrib_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_contrib_trans
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE SET NULL
);