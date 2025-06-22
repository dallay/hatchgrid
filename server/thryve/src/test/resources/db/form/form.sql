-- This file is part of the Thryve project.
-- Seeds a single test form for detail-fetch scenarios. This form represents a newsletter
-- subscription with customized styling and text content for testing purposes.
INSERT INTO forms (id, name, header, description, input_placeholder, button_text,
                   button_color, background_color, text_color, button_text_color,
                   workspace_id, created_at, updated_at)
VALUES ('1659d4ae-402a-4172-bf8b-0a5c54255587', 'Programming newsletter v1', 'Juan''s Newsletter',
        '🟢 Some description 🔴', 'Enter your email', 'Subscribe', '2C81E5', 'DFD150', '222222',
        'FFFFFF', 'a0654720-35dc-49d0-b508-1f7df5d915f1',
        '2024-04-21 19:56:07.632', '2024-04-21 19:56:07.711');
