UPDATE mama_survey
SET $1 = $2
WHERE phone = $3
RETURNING *;