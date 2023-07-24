CREATE PROCEDURE spGenerateAllGenreUserGames(IN genres VARCHAR(500))
mainBlock:BEGIN		
    DROP TABLE IF EXISTS userIds;
	CREATE TEMPORARY TABLE userIds(id VARCHAR(191));
    
    INSERT INTO userIds(id)
    SELECT id
	FROM User;
	
	SELECT @userId := id FROM userIds LIMIT 1;
	loop_user: 
	WHILE ISNULL(@userId) = 0 DO    
		CALL spGenerateGenreUserGame(genres, @userId);
		DELETE FROM userIds WHERE id = @userId;
        SET @userId = NULL;
    END 
	WHILE loop_user;
END