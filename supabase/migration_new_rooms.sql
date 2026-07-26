-- Migration: Add new positive/hopeful rooms
-- Run this in Supabase SQL editor after the main schema

INSERT INTO rooms (name, slug, description, icon, theme_colors, ambient_settings)
VALUES
  ('Small Wins', 'small-wins', 'Every step forward matters', '🎉',
    '{"primary": "#fbbf24", "secondary": "#f59e0b", "bg": "#1a1a0e", "glow": "#fde68a"}',
    '{"particleDensity": 70, "particleSpeed": 0.4, "celebratorySparkle": true}'),
  ('Dreams', 'dreams', 'Share what your heart envisions', '🌙',
    '{"primary": "#818cf8", "secondary": "#6366f1", "bg": "#0a0a2e", "glow": "#c7d2fe"}',
    '{"particleDensity": 50, "particleSpeed": 0.2, "slowDrifting": true}'),
  ('Gratitude', 'gratitude', 'The light that exists even in darkness', '🙏',
    '{"primary": "#f5d062", "secondary": "#eab308", "bg": "#1a1a0e", "glow": "#fef3c7"}',
    '{"particleDensity": 60, "particleSpeed": 0.3, "warmRising": true}'),
  ('Art & Poetry', 'art-poetry', 'Words, colors, and sounds of the soul', '🎭',
    '{"primary": "#f472b6", "secondary": "#ec4899", "bg": "#1a0a1e", "glow": "#fbcfe8"}',
    '{"particleDensity": 80, "particleSpeed": 0.4, "creativeFlowing": true}'),
  ('A Place to Breathe', 'breathe', 'A quiet space with nothing to prove', '🫧',
    '{"primary": "#5eead4", "secondary": "#2dd4bf", "bg": "#0a1a1e", "glow": "#99f6e4"}',
    '{"particleDensity": 30, "particleSpeed": 0.15, "calmMinimal": true}')
ON CONFLICT (slug) DO NOTHING;
