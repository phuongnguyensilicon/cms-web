DROP PROCEDURE IF EXISTS spGenerateGenreUserGame;
CREATE PROCEDURE spGenerateGenreUserGame(IN genres VARCHAR(500), IN userId VARCHAR(191))
mainBlock:BEGIN	
	DECLARE genreVal VARCHAR(191) ;

	DROP TABLE IF EXISTS genre_table;
	CREATE TEMPORARY TABLE genre_table(genre VARCHAR(191));
    
    INSERT INTO genre_table(genre)
	SELECT genre
	FROM
	  JSON_TABLE(CONCAT(genres), "$[*]"
			  COLUMNS(
				  genre VARCHAR(191) PATH "$"
				  )
		  ) AS tt;
	
	SET @currentDate = UTC_DATE();
    SET @userId = userId COLLATE utf8mb4_unicode_ci;
	SELECT @roundGameId:=id from RoundGame where @currentDate BETWEEN startDate AND endDate LIMIT 1;
    
    IF ISNULL(@roundGameId) = 1 THEN
		LEAVE mainBlock;
	END IF;
    
    IF EXISTS (
		SELECT * FROM UserRoundGame ur WHERE ur.userId = @userId AND (ur.roundGameId = @roundGameId OR ur.status = 'pending') 
    ) THEN
		LEAVE mainBlock;
	END IF;        
	
    SET @userRoundGameId = uuid();
    SELECT @userRoundGameId;
    INSERT INTO UserRoundGame (id, roundGameId, userId, status, createdAt, updatedAt)
	VALUES 					(@userRoundGameId, @roundGameId, @userId, 'pending', UTC_DATE(), UTC_DATE());
	
    
	SET @displayOrder = 0; 
    SET @userGenreRoundGameId = uuid(); 
    
	SELECT @genreVal:=genre FROM genre_table LIMIT 1;
    loop_genre: 
	WHILE ISNULL(@genreVal) = 0 DO    
		SET @genreLower = LOWER(CONCAT('%"', @genreVal, '"%') )  COLLATE utf8mb4_unicode_ci;
		SELECT @genreLower ;
		SET @userGenreRoundGameId = uuid();
		INSERT INTO UserGenreRoundGame (id, userRoundGameId, genre, createdAt, updatedAt)
        VALUES	(@userGenreRoundGameId, @userRoundGameId, @genreVal, UTC_DATE(), UTC_DATE());
        
        INSERT INTO UserGenreMediaRoundGame(id, userGenreRoundGameId, mediaItemId, status, displayOrder, createdAt, updatedAt)
		SELECT uuid(), @userGenreRoundGameId, m.id, 'pending', @displayOrder := @displayOrder + 1 , UTC_DATE(), UTC_DATE()    
		FROM MediaItem m
		LEFT JOIN (
			SELECT urg.userId, ugmrg.mediaItemId
			FROM UserRoundGame urg
			JOIN UserGenreRoundGame ugrg ON ugrg.userRoundGameId = urg.id
			JOIN UserGenreMediaRoundGame ugmrg ON ugmrg.userGenreRoundGameId = ugrg.id
			WHERE urg.userId = @userId
		) urgCombine ON m.id = urgCombine.mediaItemId
		WHERE m.active = 1 
			AND LOWER(m.genres) like @genreLower
			AND urgCombine.userId IS NULL
            AND IFNULL(m.posterPath, '') <> ''
            AND EXISTS(
				SELECT *
                FROM MediaAdditionalItem ma
                WHERE ma.mediaItemId = m.id AND ma.active = 1
                LIMIT 1
            )
		order by rand() 
		LIMIT 10;
        
		DELETE FROM genre_table WHERE genre = @genreVal;
        SET @genreVal = NULL;
        SELECT @genreVal:=genre FROM genre_table LIMIT 1; 
        SET @displayOrder = 0; 
	  END 
	WHILE loop_genre;
END