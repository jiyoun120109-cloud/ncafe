-- 문의 유형 및 첨부파일 경로
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(50);
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(500);
