-- Supabase数据库初始化脚本
-- 在Supabase Dashboard的SQL编辑器中运行此脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    credits_remaining INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建模型表
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_url TEXT NOT NULL,
    thumbnail_url TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    format VARCHAR(10) DEFAULT 'glb',
    file_size BIGINT DEFAULT 0,
    generation_options JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为users表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为models表添加更新时间触发器
DROP TRIGGER IF EXISTS update_models_updated_at ON models;
CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建减少用户积分的函数
CREATE OR REPLACE FUNCTION decrement_credits(user_id UUID, credits INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    SELECT credits_remaining INTO current_credits FROM users WHERE id = user_id;
    
    IF current_credits IS NULL THEN
        RETURN 0;
    END IF;
    
    IF current_credits >= credits THEN
        UPDATE users SET credits_remaining = credits_remaining - credits WHERE id = user_id;
        RETURN credits_remaining - credits;
    ELSE
        RETURN current_credits;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 启用Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户只能查看和修改自己的数据
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own models" ON models
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own models" ON models
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models" ON models
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own models" ON models
    FOR DELETE USING (auth.uid() = user_id);

-- 插入示例用户（可选）
INSERT INTO users (id, email, name, subscription_plan, credits_remaining) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'free', 100)
ON CONFLICT (email) DO NOTHING;

-- 插入示例模型（可选）
INSERT INTO models (name, description, model_url, thumbnail_url, user_id, tags, format, file_size)
VALUES 
    ('可爱的卡通猫咪', '一只橙色毛发，绿色眼睛的卡通风格猫咪，坐着的姿势', '/api/placeholder-model.glb', '/cute-cartoon-cat.png', '00000000-0000-0000-0000-000000000001', ARRAY['动物', '卡通', '可爱'], 'glb', 2048576),
    ('现代简约椅子', '现代简约风格的椅子设计，木质材质，人体工学设计', '/api/placeholder-model.glb', '/modern-minimalist-chair.jpg', '00000000-0000-0000-0000-000000000001', ARRAY['家具', '现代', '简约'], 'glb', 3145728),
    ('科幻宇宙飞船', '未来主义风格的宇宙飞船，金属质感，流线型设计', '/api/placeholder-model.glb', '/sci-fi-spaceship.jpg', '00000000-0000-0000-0000-000000000001', ARRAY['科幻', '太空', '未来'], 'glb', 5242880)
ON CONFLICT DO NOTHING;

