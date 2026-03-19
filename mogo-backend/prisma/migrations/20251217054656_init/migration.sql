-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "student_id" VARCHAR(20) NOT NULL,
    "year" INTEGER NOT NULL,
    "school_level" VARCHAR(10),
    "school_name" VARCHAR(100),
    "grade" VARCHAR(10),
    "name" VARCHAR(50) NOT NULL,
    "school_type" VARCHAR(20),
    "phone" VARCHAR(20),
    "parent_phone" VARCHAR(20),
    "email" VARCHAR(100),
    "parent_email" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exams" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "grade" VARCHAR(10),
    "year" INTEGER,
    "month" INTEGER,
    "type" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_areas" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "subject_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_codes" (
    "id" SERIAL NOT NULL,
    "subject_area_id" INTEGER NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "subject_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_chapters" (
    "id" SERIAL NOT NULL,
    "subject_area_code" VARCHAR(10),
    "subject_code" VARCHAR(10),
    "major_name" VARCHAR(100),
    "major_code" VARCHAR(10),
    "minor_name" VARCHAR(200),
    "minor_code" VARCHAR(10),

    CONSTRAINT "subject_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" SERIAL NOT NULL,
    "mock_exam_id" INTEGER NOT NULL,
    "subject_area_code" VARCHAR(10),
    "subject_area_name" VARCHAR(50),
    "subject_code" VARCHAR(10),
    "subject_name" VARCHAR(50),
    "question_number" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "answer" INTEGER NOT NULL,
    "choice_ratio_1" DECIMAL(5,2),
    "choice_ratio_2" DECIMAL(5,2),
    "choice_ratio_3" DECIMAL(5,2),
    "choice_ratio_4" DECIMAL(5,2),
    "choice_ratio_5" DECIMAL(5,2),

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_scores" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "mock_exam_id" INTEGER NOT NULL,
    "korean_selection" VARCHAR(20),
    "korean_raw" INTEGER,
    "korean_standard" INTEGER,
    "korean_percentile" DECIMAL(5,2),
    "korean_grade" INTEGER,
    "english_raw" INTEGER,
    "english_grade" INTEGER,
    "math_selection" VARCHAR(20),
    "math_raw" INTEGER,
    "math_standard" INTEGER,
    "math_percentile" DECIMAL(5,2),
    "math_grade" INTEGER,
    "inquiry1_selection" VARCHAR(50),
    "inquiry1_raw" INTEGER,
    "inquiry1_standard" INTEGER,
    "inquiry1_percentile" DECIMAL(5,2),
    "inquiry1_grade" INTEGER,
    "inquiry2_selection" VARCHAR(50),
    "inquiry2_raw" INTEGER,
    "inquiry2_standard" INTEGER,
    "inquiry2_percentile" DECIMAL(5,2),
    "inquiry2_grade" INTEGER,
    "history_raw" INTEGER,
    "history_grade" INTEGER,
    "foreign_selection" VARCHAR(50),
    "foreign_raw" INTEGER,
    "foreign_grade" INTEGER,
    "total_standard_sum" INTEGER,
    "total_percentile_sum" DECIMAL(6,2),
    "top_cumulative_std" DECIMAL(6,2),
    "top_cumulative_raw" DECIMAL(6,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_targets" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "department_code" VARCHAR(20),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "short_name" VARCHAR(50),
    "region" VARCHAR(50),
    "total_score" DECIMAL(10,2),
    "conversion_rate" DECIMAL(10,6),
    "status" VARCHAR(20) NOT NULL DEFAULT '존립',

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "university_id" INTEGER NOT NULL,
    "department_code" VARCHAR(10),
    "name" VARCHAR(100) NOT NULL,
    "admission_type" VARCHAR(20),
    "admission_group" VARCHAR(10),
    "category" VARCHAR(20),
    "sub_category" VARCHAR(50),
    "quota" INTEGER,
    "selection_method" VARCHAR(20),
    "score_elements" VARCHAR(50),
    "score_combination" VARCHAR(50),
    "required_subjects" VARCHAR(100),
    "optional_subjects" VARCHAR(100),
    "inquiry_count" INTEGER,
    "korean_ratio" VARCHAR(20),
    "math_ratio" VARCHAR(20),
    "english_ratio" VARCHAR(20),
    "inquiry_ratio" VARCHAR(20),
    "history_ratio" VARCHAR(20),
    "foreign_ratio" VARCHAR(20),
    "korean_selection" VARCHAR(50),
    "math_selection" VARCHAR(50),
    "prob_bonus" DECIMAL(5,2),
    "calc_bonus" DECIMAL(5,2),
    "geometry_bonus" DECIMAL(5,2),
    "inquiry_type" VARCHAR(20),
    "social_bonus" DECIMAL(5,2),
    "science_bonus" DECIMAL(5,2),
    "math_science_req" VARCHAR(50),
    "english_score_type" VARCHAR(20),
    "english_grade_1" DECIMAL(6,2),
    "english_grade_2" DECIMAL(6,2),
    "english_grade_3" DECIMAL(6,2),
    "english_grade_4" DECIMAL(6,2),
    "english_grade_5" DECIMAL(6,2),
    "english_grade_6" DECIMAL(6,2),
    "english_grade_7" DECIMAL(6,2),
    "english_grade_8" DECIMAL(6,2),
    "english_grade_9" DECIMAL(6,2),
    "history_score_type" VARCHAR(20),
    "history_grade_1" DECIMAL(6,2),
    "history_grade_2" DECIMAL(6,2),
    "history_grade_3" DECIMAL(6,2),
    "history_grade_4" DECIMAL(6,2),
    "history_grade_5" DECIMAL(6,2),
    "history_grade_6" DECIMAL(6,2),
    "history_grade_7" DECIMAL(6,2),
    "history_grade_8" DECIMAL(6,2),
    "history_grade_9" DECIMAL(6,2),
    "history_min_req" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT '존립',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_cutoffs" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "mock_exam_id" INTEGER,
    "year" INTEGER,
    "score_type" VARCHAR(20),
    "first_cut_score" DECIMAL(10,4),
    "first_cut_percentile" DECIMAL(10,6),
    "final_cut_score" DECIMAL(10,4),
    "final_cut_percentile" DECIMAL(10,6),
    "risk_plus_5" DECIMAL(10,6),
    "risk_plus_4" DECIMAL(10,6),
    "risk_plus_3" DECIMAL(10,6),
    "risk_plus_2" DECIMAL(10,6),
    "risk_plus_1" DECIMAL(10,6),
    "risk_minus_1" DECIMAL(10,6),
    "risk_minus_2" DECIMAL(10,6),
    "risk_minus_3" DECIMAL(10,6),
    "risk_minus_4" DECIMAL(10,6),
    "risk_minus_5" DECIMAL(10,6),
    "competition_rate" DECIMAL(6,2),
    "additional_rate" DECIMAL(6,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_cutoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_conversion_standard" (
    "id" SERIAL NOT NULL,
    "mock_exam_id" INTEGER NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "standard_score" INTEGER NOT NULL,
    "percentile" DECIMAL(6,2),
    "grade" INTEGER,
    "cumulative_pct" DECIMAL(10,6),

    CONSTRAINT "score_conversion_standard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_conversion_raw" (
    "id" SERIAL NOT NULL,
    "mock_exam_id" INTEGER NOT NULL,
    "subject" VARCHAR(50) NOT NULL,
    "subject_type" VARCHAR(50),
    "common_score" INTEGER,
    "selection_score" INTEGER,
    "standard_score" INTEGER,

    CONSTRAINT "score_conversion_raw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentoring" (
    "id" SERIAL NOT NULL,
    "class_id" VARCHAR(30) NOT NULL,
    "grade" VARCHAR(10),
    "subject" VARCHAR(10),
    "start_date" DATE,
    "class_name" VARCHAR(100),
    "teacher_name" VARCHAR(50),
    "weekly_count" INTEGER,
    "duration" VARCHAR(10),
    "day_1" VARCHAR(10),
    "start_time_1" TIME,
    "end_time_1" TIME,
    "day_2" VARCHAR(10),
    "start_time_2" TIME,
    "end_time_2" TIME,
    "fee" INTEGER DEFAULT 0,
    "fee_type" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_results" (
    "id" SERIAL NOT NULL,
    "result_id" VARCHAR(30) NOT NULL,
    "student_id" INTEGER NOT NULL,
    "mission_id" VARCHAR(30),
    "date" DATE,
    "start_time" TIME,
    "end_time" TIME,
    "category" VARCHAR(20),
    "subject" VARCHAR(20),
    "sub_category" VARCHAR(20),
    "content" VARCHAR(100),
    "amount" INTEGER,
    "achievement_rate" DECIMAL(5,2),
    "correct_count" INTEGER,
    "total_count" INTEGER,
    "score" INTEGER,
    "focus_level" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_key" ON "students"("student_id");

-- CreateIndex
CREATE INDEX "students_student_id_idx" ON "students"("student_id");

-- CreateIndex
CREATE INDEX "students_year_grade_idx" ON "students"("year", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "mock_exams_code_key" ON "mock_exams"("code");

-- CreateIndex
CREATE INDEX "mock_exams_code_idx" ON "mock_exams"("code");

-- CreateIndex
CREATE INDEX "mock_exams_grade_year_month_idx" ON "mock_exams"("grade", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "subject_areas_code_key" ON "subject_areas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subject_codes_code_key" ON "subject_codes"("code");

-- CreateIndex
CREATE INDEX "subject_codes_subject_area_id_idx" ON "subject_codes"("subject_area_id");

-- CreateIndex
CREATE INDEX "subject_chapters_subject_area_code_subject_code_idx" ON "subject_chapters"("subject_area_code", "subject_code");

-- CreateIndex
CREATE INDEX "exam_questions_mock_exam_id_idx" ON "exam_questions"("mock_exam_id");

-- CreateIndex
CREATE INDEX "exam_questions_subject_area_code_subject_code_idx" ON "exam_questions"("subject_area_code", "subject_code");

-- CreateIndex
CREATE INDEX "student_scores_student_id_idx" ON "student_scores"("student_id");

-- CreateIndex
CREATE INDEX "student_scores_mock_exam_id_idx" ON "student_scores"("mock_exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_scores_student_id_mock_exam_id_key" ON "student_scores"("student_id", "mock_exam_id");

-- CreateIndex
CREATE INDEX "student_targets_student_id_idx" ON "student_targets"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "universities_code_key" ON "universities"("code");

-- CreateIndex
CREATE INDEX "universities_code_idx" ON "universities"("code");

-- CreateIndex
CREATE INDEX "universities_region_idx" ON "universities"("region");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_university_id_idx" ON "departments"("university_id");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_category_sub_category_idx" ON "departments"("category", "sub_category");

-- CreateIndex
CREATE INDEX "admission_cutoffs_department_id_idx" ON "admission_cutoffs"("department_id");

-- CreateIndex
CREATE INDEX "admission_cutoffs_year_idx" ON "admission_cutoffs"("year");

-- CreateIndex
CREATE INDEX "admission_cutoffs_mock_exam_id_idx" ON "admission_cutoffs"("mock_exam_id");

-- CreateIndex
CREATE INDEX "score_conversion_standard_mock_exam_id_idx" ON "score_conversion_standard"("mock_exam_id");

-- CreateIndex
CREATE INDEX "score_conversion_standard_subject_standard_score_idx" ON "score_conversion_standard"("subject", "standard_score");

-- CreateIndex
CREATE INDEX "score_conversion_raw_mock_exam_id_idx" ON "score_conversion_raw"("mock_exam_id");

-- CreateIndex
CREATE INDEX "score_conversion_raw_subject_subject_type_idx" ON "score_conversion_raw"("subject", "subject_type");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_class_id_key" ON "mentoring"("class_id");

-- CreateIndex
CREATE INDEX "mentoring_grade_idx" ON "mentoring"("grade");

-- CreateIndex
CREATE INDEX "mentoring_teacher_name_idx" ON "mentoring"("teacher_name");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_results_result_id_key" ON "achievement_results"("result_id");

-- CreateIndex
CREATE INDEX "achievement_results_student_id_idx" ON "achievement_results"("student_id");

-- CreateIndex
CREATE INDEX "achievement_results_date_idx" ON "achievement_results"("date");

-- AddForeignKey
ALTER TABLE "subject_codes" ADD CONSTRAINT "subject_codes_subject_area_id_fkey" FOREIGN KEY ("subject_area_id") REFERENCES "subject_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_targets" ADD CONSTRAINT "student_targets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cutoffs" ADD CONSTRAINT "admission_cutoffs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_cutoffs" ADD CONSTRAINT "admission_cutoffs_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_conversion_standard" ADD CONSTRAINT "score_conversion_standard_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_conversion_raw" ADD CONSTRAINT "score_conversion_raw_mock_exam_id_fkey" FOREIGN KEY ("mock_exam_id") REFERENCES "mock_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_results" ADD CONSTRAINT "achievement_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
