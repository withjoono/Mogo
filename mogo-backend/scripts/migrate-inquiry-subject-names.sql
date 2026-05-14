-- 탐구 과목명 공백 제거 마이그레이션
-- "물리학 I" → "물리학I" 형식으로 통일
-- 실행 전: cloud-sql-proxy 실행 필요

-- ============================================================
-- 1. StudentScore: inquiry1Selection / inquiry2Selection 정규화
-- ============================================================
UPDATE mogo."StudentScore"
SET "inquiry1Selection" = REPLACE(REPLACE("inquiry1Selection", ' II', 'II'), ' I', 'I')
WHERE "inquiry1Selection" ~ ' (I|II)$';

UPDATE mogo."StudentScore"
SET "inquiry2Selection" = REPLACE(REPLACE("inquiry2Selection", ' II', 'II'), ' I', 'I')
WHERE "inquiry2Selection" ~ ' (I|II)$';

-- ============================================================
-- 2. ScoreConversion2015: subject 컬럼 정규화 (탐구 과목만)
-- ============================================================
UPDATE mogo."ScoreConversion2015"
SET subject = REPLACE(REPLACE(subject, ' II', 'II'), ' I', 'I')
WHERE subject ~ ' (I|II)$';

-- ============================================================
-- 3. ScoreConversionRaw2015: subjectType 컬럼 정규화
-- ============================================================
UPDATE mogo."ScoreConversionRaw2015"
SET "subjectType" = REPLACE(REPLACE("subjectType", ' II', 'II'), ' I', 'I')
WHERE "subjectType" ~ ' (I|II)$';

-- ============================================================
-- 확인 쿼리 (위 UPDATE 이후 실행하여 검증)
-- ============================================================
-- SELECT DISTINCT "inquiry1Selection", "inquiry2Selection" FROM mogo."StudentScore" WHERE "inquiry1Selection" IS NOT NULL;
-- SELECT DISTINCT subject FROM mogo."ScoreConversion2015" WHERE subject NOT IN ('국어','수학','영어','한국사') ORDER BY subject;
-- SELECT DISTINCT subject, "subjectType" FROM mogo."ScoreConversionRaw2015" WHERE subject NOT IN ('국어','수학','영어','한국사') ORDER BY subject, "subjectType";
