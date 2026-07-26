-- Migration: Add new positive/hopeful rooms
-- Run this in Supabase SQL editor after the main schema

INSERT INTO rooms (slug, name, description, icon, primary_color, secondary_color, glow_color)
VALUES
  ('small-wins', 'Small Wins', 'Every step forward matters', '🎉', '#fbbf24', '#f59e0b', '#fde68a'),
  ('dreams', 'Dreams', 'Share what your heart envisions', '🌙', '#818cf8', '#6366f1', '#c7d2fe'),
  ('gratitude', 'Gratitude', 'The light that exists even in darkness', '🙏', '#f5d062', '#eab308', '#fef3c7'),
  ('art-poetry', 'Art & Poetry', 'Words, colors, and sounds of the soul', '🎭', '#f472b6', '#ec4899', '#fbcfe8'),
  ('breathe', 'A Place to Breathe', 'A quiet space with nothing to prove', '🫧', '#5eead4', '#2dd4bf', '#99f6e4')
ON CONFLICT (slug) DO NOTHING;
