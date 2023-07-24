CREATE PROCEDURE spGenerateRoundGame()
mainBlock:BEGIN
	SET @currentDate = UTC_DATE();
	SELECT @roundGameId:=id from RoundGame where @currentDate BETWEEN startDate AND endDate LIMIT 1;
    
    IF ISNULL(@roundGameId) = 0 THEN
		SELECT @roundGameId;
		LEAVE mainBlock;
	END IF;
    
    SET @startOfWeek = DATE_ADD(SUBDATE(@currentDate, WEEKDAY(@currentDate)), interval 0 second);
    SET @endOfWeek = DATE_ADD(DATE(@currentDate) + INTERVAL 6 - WEEKDAY(@currentDate) DAY, interval 24*60*60 - 1 second);
    
    INSERT INTO RoundGame (id, startDate, endDate, createdAt, updatedAt)
	VALUES (uuid(), @startOfWeek, @endOfWeek, UTC_DATE(), UTC_DATE());
END