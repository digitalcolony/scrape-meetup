DROP PROCEDURE IF EXISTS `spAddCCEventQueue`;

CREATE PROCEDURE `spAddCCEventQueue`(
  IN p_EventID INT
) BEGIN
/* place unique eventid into queue */

INSERT IGNORE INTO
  cc_events_queue (
    eventID,
    processed
  )
VALUES(
    p_EventID,
    0);
END