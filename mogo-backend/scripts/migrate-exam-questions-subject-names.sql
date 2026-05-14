-- mg_exam_questions subject_area_name, subject_name 채우기
-- mock_exam_id=53 (H32211, 2023 수능)에만 데이터가 있음
-- 실행: docker exec hub-postgres psql -U tsuser -d geobukschool_dev -f /path/to/this.sql

-- 한국사
UPDATE mogo.mg_exam_questions SET subject_area_name = '한국사' WHERE subject_area_code = '50';

-- 국어 (화법과작문=64, 언어와매체=63)
UPDATE mogo.mg_exam_questions SET subject_area_name = '국어', subject_name = '화법과작문' WHERE subject_area_code = '60' AND subject_code = '64';
UPDATE mogo.mg_exam_questions SET subject_area_name = '국어', subject_name = '언어와매체' WHERE subject_area_code = '60' AND subject_code = '63';

-- 수학 (미적분=73, 확률과통계=74, 기하=75)
-- Q1-15: 5지선다, Q16-22: 단답형(공통), Q23-28: 5지선다(선택), Q29-30: 단답형(선택)
UPDATE mogo.mg_exam_questions SET subject_area_name = '수학', subject_name = '미적분' WHERE subject_area_code = '70' AND subject_code = '73';
UPDATE mogo.mg_exam_questions SET subject_area_name = '수학', subject_name = '확률과통계' WHERE subject_area_code = '70' AND subject_code = '74';
UPDATE mogo.mg_exam_questions SET subject_area_name = '수학', subject_name = '기하' WHERE subject_area_code = '70' AND subject_code = '75';

-- 영어
UPDATE mogo.mg_exam_questions SET subject_area_name = '영어' WHERE subject_area_code = '80';

-- 사회탐구 (area 10)
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '생활과윤리' WHERE subject_area_code = '10' AND subject_code = '11';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '윤리와사상' WHERE subject_area_code = '10' AND subject_code = '12';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '한국지리' WHERE subject_area_code = '10' AND subject_code = '13';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '세계지리' WHERE subject_area_code = '10' AND subject_code = '14';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '동아시아사' WHERE subject_area_code = '10' AND subject_code = '15';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '세계사' WHERE subject_area_code = '10' AND subject_code = '16';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '경제' WHERE subject_area_code = '10' AND subject_code = '17';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '정치와법' WHERE subject_area_code = '10' AND subject_code = '18';
UPDATE mogo.mg_exam_questions SET subject_area_name = '사회탐구', subject_name = '사회문화' WHERE subject_area_code = '10' AND subject_code = '19';

-- 과학탐구 (area 20)
-- 2023 수능 정답으로 과목 확인됨
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '물리학I' WHERE subject_area_code = '20' AND subject_code = '22';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '화학I' WHERE subject_area_code = '20' AND subject_code = '23';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '생명과학I' WHERE subject_area_code = '20' AND subject_code = '24';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '지구과학I' WHERE subject_area_code = '20' AND subject_code = '25';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '물리학II' WHERE subject_area_code = '20' AND subject_code = '26';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '화학II' WHERE subject_area_code = '20' AND subject_code = '27';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '생명과학II' WHERE subject_area_code = '20' AND subject_code = '28';
UPDATE mogo.mg_exam_questions SET subject_area_name = '과학탐구', subject_name = '지구과학II' WHERE subject_area_code = '20' AND subject_code = '29';

-- 제2외국어 (area 90, 30문항)
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '독일어' WHERE subject_area_code = '90' AND subject_code = '91';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '프랑스어' WHERE subject_area_code = '90' AND subject_code = '92';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '스페인어' WHERE subject_area_code = '90' AND subject_code = '93';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '중국어' WHERE subject_area_code = '90' AND subject_code = '94';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '일본어' WHERE subject_area_code = '90' AND subject_code = '95';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '러시아어' WHERE subject_area_code = '90' AND subject_code = '96';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '아랍어' WHERE subject_area_code = '90' AND subject_code = '97';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '베트남어' WHERE subject_area_code = '90' AND subject_code = '98';
UPDATE mogo.mg_exam_questions SET subject_area_name = '제2외국어', subject_name = '한문' WHERE subject_area_code = '90' AND subject_code = '99';
