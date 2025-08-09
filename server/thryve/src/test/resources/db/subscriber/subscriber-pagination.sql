-- All Subscribers with tags
INSERT INTO subscribers (id, email, firstname, lastname, status, workspace_id, created_at,
                         updated_at,
                         attributes)
VALUES ('bbf25966-6f2d-4cc5-a6da-19e79dbaba1e', 'boethius@test.com', 'Boethius', 'Stokes', 'ENABLED',
        'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-02-18 15:44:03.616085+01',
        '2023-12-22 15:28:55.736027+01',
        '{
             "tags": ["tag1", "tag2"]
           }'),
       ('15a3f1bf-6236-40bd-83d4-69a9539ab1ea', 'jean-paul.sartre@test.com', 'Jean-Paul', 'Sartre',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-02-22 15:44:03.616085+01',
        '2024-01-22 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('5616e0ed-2305-4d6f-88f2-9ef3d6d72a69', 'jean-francois.lyotard@test.com', 'Jean-François',
        'Lyotard', 'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1',
        '2023-03-02 15:44:03.616085+01', '2023-11-20 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('30b14a48-ddf4-413d-a638-1d26beb52ae2', 'franz.brentano@test.com', 'Franz', 'Brentano',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-11 15:44:03.616085+01',
        '2023-05-10 15:28:55.736027+02',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('7b868e1e-d2d1-4b8a-9949-59bc4b775d0f', 'bonaventure@test.com', 'Bonaventure', 'Predovic',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-04 15:44:03.616085+01',
        '2024-01-13 15:28:55.736027+01',
        '{
             "tags": ["tag1", "tag2"]
           }'),
       ('a72d3adb-7f07-4837-b592-0be854d20a67', 'maurice.henry@test.com', 'Maurice',
        'Henry', 'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-13 15:44:03.616085+01',
        '2024-02-14 15:28:55.736027+01', '{
         "tags": ["tag1", "tag2"]
       }'),
       ('dd3ff9d4-aee0-4a89-930f-bdd020845f92', 'emmanuel.henry@test.com', 'Emmanuel', 'Henry',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-02 15:44:04.616085+01',
        '2024-01-03 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('b88f202b-964d-4f44-b080-3aaa6ef03052', 'rene.descartes@test.com', 'Rene', 'Descartes',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-02-28 15:44:03.616085+01',
        '2023-11-25 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('b8f2317a-686f-4ace-a218-5c98a05cb88a', 'ralph.waldo.emerson@test.com', 'Ralph',
        'Waldo Emerson', 'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1',
        '2023-02-21 15:44:03.616085+01',
        '2024-01-30 15:28:55.736027+01', '{
         "tags": ["tag1", "tag2"]
       }'),
       ('e3839fed-f18f-4461-9e86-5bf2d5868ead', 'bertrand.russell@test.com', 'Bertrand', 'Russell',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-02-22 15:44:03.616085+01',
        '2023-12-09 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }');
INSERT INTO subscribers (id, email, firstname, lastname, status, workspace_id, created_at,
                         updated_at,
                         attributes)
VALUES ('a4053f51-ddee-4abc-bf5d-767d7588b711', 'michel.henry@test.com', 'Michel', 'Henry',
        'ENABLED', 'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-16 15:44:03.616085+01',
        '2023-10-26 15:28:55.736027+02',
        '{
          "tags": ["tag1", "tag2"]
        }'),
       ('96bd3f93-7be8-4ac6-9e68-1d2a50650cc6', 'maimonides@test.com', 'Maimonides', 'Stoltenberg', 'ENABLED',
        'a0654720-35dc-49d0-b508-1f7df5d915f1', '2023-03-14 15:44:03.616085+01',
        '2024-01-04 15:28:55.736027+01',
        '{
          "tags": ["tag1", "tag2"]
        }');
