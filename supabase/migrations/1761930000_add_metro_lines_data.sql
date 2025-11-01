-- Migration: add_metro_lines_data
-- Created at: 1761930000

-- Insert Delhi Metro lines data
INSERT INTO metro_lines (name, code, color, is_operational) VALUES
('Red Line', 'RL', '#D13438', true),
('Yellow Line', 'YL', '#FFB900', true),
('Blue Line', 'BL', '#0078D4', true),
('Aqua Line', 'AL', '#00B7C3', true),
('Green Line', 'GL', '#008A00', true),
('Violet Line', 'VL', '#800080', true),
('Pink Line', 'PL', '#FF69B4', true),
('Magenta Line', 'ML', '#CC338B', true),
('Grey Line', 'GRL', '#808080', true),
('Orange Line', 'OL', '#FFA500', true)
ON CONFLICT (code) DO NOTHING;