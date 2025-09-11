-- Insert demo user for frontend testing
-- Password: "demo123" (hashed with bcrypt)

INSERT INTO "Users" (
    "id",
    "email",
    "password", 
    "name",
    "role",
    "createdAt",
    "updatedAt"
) VALUES (
    'demo-user-12345678901234567890',
    'demo@microgreens.com',
    '$2b$10$8K1p2/ZqK5YHR.xYlz.Odu5q2CZQ6Yvz3N8X3f5.1Rb7NqVW5XqGu',
    'Usuario Demo',
    'GROWER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Verify insertion
SELECT "id", "email", "name", "role", "createdAt" FROM "Users" WHERE "email" = 'demo@microgreens.com';