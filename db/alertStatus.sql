UPDATE mama_survey 
SET alert = TRUE
WHERE phone = $1
RETURNING phone;
