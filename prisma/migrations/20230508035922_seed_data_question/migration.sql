INSERT INTO Questionaire (id, isWatched, isLiked, active, createdAt, updatedAt)
VALUES ('1c2ba3f2-e584-428f-95ea-b5377864e8d0', 1, 1, 1, CURDATE(), CURDATE()),
		('313270ab-7e08-4dc0-904b-e1aecadc2498', 1, 0, 1, CURDATE(), CURDATE()),
        ('deb12c8e-251a-4a27-b028-7e3e1150d3fb', 0, 1, 1, CURDATE(), CURDATE()),
        ('fb431fee-9ca5-46fb-af67-0406037fd2d6', 0, 0, 1, CURDATE(), CURDATE());
        
INSERT INTO Question (id, questionaireId, title, description, type, active, point, displayOrder, createdAt, updatedAt)
VALUES ('ab5514d9-359d-4477-b5d0-e51212cdf005', '1c2ba3f2-e584-428f-95ea-b5377864e8d0', 'Rate Willow', '', 'multiple', 1, NULL, 0, CURDATE(), CURDATE()),
		('198bb14d-187d-4d45-b57c-8bddfe0223fe', '313270ab-7e08-4dc0-904b-e1aecadc2498', 'What didn’t you like?', '', 'multiple', 1, NULL, 1, CURDATE(), CURDATE()),
        ('fa83e900-5346-4528-a598-7b43da757bcb', 'deb12c8e-251a-4a27-b028-7e3e1150d3fb', 'What interested you?', '', 'multiple', 1, NULL, 2, CURDATE(), CURDATE()),
        ('d6caa6a8-c902-4838-9c17-2d2c1c5132c6', 'fb431fee-9ca5-46fb-af67-0406037fd2d6', 'Rate Willow', '', 'multiple', 1, NULL, 3, CURDATE(), CURDATE());

INSERT INTO QuestionOption (id, questionId, title, description, type, active, point, displayOrder, createdAt, updatedAt)
VALUES ('fbd9164f-d922-4dce-a716-566d1847e4d5', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Plot', '', 'input-indicator', 1, 20, 0, CURDATE(), CURDATE()),
		('bd3bb292-9e5b-4e2d-b329-2c0df00fde0e', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Characters', '', 'input-indicator', 1, 20, 1, CURDATE(), CURDATE()),
        ('688bb86f-8059-41b1-868c-65294f3dc508', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Acting', '', 'input-indicator', 1, 20, 2, CURDATE(), CURDATE()),
        ('f893adea-23ed-4a89-96b6-2acc5009a91d', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Visuals', '', 'input-indicator', 1, 20, 3, CURDATE(), CURDATE()),
        ('226b9716-c9f3-4429-ab5a-5ab7b65e0d48', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Sound', '', 'input-indicator', 1, 20, 4, CURDATE(), CURDATE()),
        ('a6b30497-590a-4b1d-8e8d-e444bf96063a', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Pace & Editing', '', 'input-indicator', 1, 20, 5, CURDATE(), CURDATE()),
        ('58f727e6-f83b-4b27-9997-9c7793eec522', 'ab5514d9-359d-4477-b5d0-e51212cdf005', 'Overall Enjoyment', '', 'input-indicator', 1, 20, 6, CURDATE(), CURDATE()),
        
        ('0ec0bd77-e37e-4064-8aad-276c86d6e13a', '198bb14d-187d-4d45-b57c-8bddfe0223fe', 'Story', '', 'input-indicator', 1, 20, 7, CURDATE(), CURDATE()),
        ('da5b9b15-c576-4466-9d48-69dabab0f5a0', '198bb14d-187d-4d45-b57c-8bddfe0223fe', 'Cast', '', 'input-indicator', 1, 20, 8, CURDATE(), CURDATE()),
        ('e0c8f4a8-5b6b-4d9d-9307-8d0b40747350', '198bb14d-187d-4d45-b57c-8bddfe0223fe', 'Director', '', 'input-indicator', 1, 20, 9, CURDATE(), CURDATE()),
        ('38f16f14-73f0-4307-88c3-cb01d052778b', '198bb14d-187d-4d45-b57c-8bddfe0223fe', 'Just didn’t like it', '', 'input-indicator', 1, 20, 10, CURDATE(), CURDATE()),
        
        ('9d2abbdc-d064-4c8e-910c-388b8f2d1a67', 'fa83e900-5346-4528-a598-7b43da757bcb', 'Story', '', 'input-select', 1, 20, 11, CURDATE(), CURDATE()),
        ('9331bac0-944d-4300-b251-3ae00508cd42', 'fa83e900-5346-4528-a598-7b43da757bcb', 'Cast', '', 'input-select', 1, 20, 12, CURDATE(), CURDATE()),
        ('8c9662a2-7bbc-478d-af40-bf4b7432236a', 'fa83e900-5346-4528-a598-7b43da757bcb', 'Director', '', 'input-select', 1, 20, 13, CURDATE(), CURDATE()),
        ('d26eda4c-ce5e-4363-b3d2-b01101c85e05', 'fa83e900-5346-4528-a598-7b43da757bcb', 'Just didn’t like it', '', 'input-select', 1, 20, 14, CURDATE(), CURDATE()),
        
        ('b94a5f27-e25a-4681-9455-fecd01a34624', 'd6caa6a8-c902-4838-9c17-2d2c1c5132c6', 'No subscription/access', '', 'input-select', 1, 20, 15, CURDATE(), CURDATE()),
        ('57c9010a-8b1f-4adc-ac5b-a32cbae5f6c6', 'd6caa6a8-c902-4838-9c17-2d2c1c5132c6', 'Story', '', 'input-select', 1, 20, 16, CURDATE(), CURDATE()),
        ('cbd5c50a-c649-4cbf-90ce-53a623e2453c', 'd6caa6a8-c902-4838-9c17-2d2c1c5132c6', 'Cast', '', 'input-select', 1, 20, 17, CURDATE(), CURDATE()),
        ('2ee3b664-9566-4d17-b25d-b9dd83c4bf19', 'd6caa6a8-c902-4838-9c17-2d2c1c5132c6', 'Director', '', 'input-select', 1, 20, 18, CURDATE(), CURDATE());


