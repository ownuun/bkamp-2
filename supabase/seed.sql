-- MeetLink 테스트 데이터 Seed
-- Supabase SQL Editor에서 실행

-- 테스트 사용자 삽입 (10명)
INSERT INTO users (linkedin_url, linkedin_id, name, headline, photo_url, company) VALUES
('https://www.linkedin.com/in/johndoe', 'johndoe', 'John Doe', 'Founder & CEO at TechStartup | Y Combinator W24', 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe', 'TechStartup'),
('https://www.linkedin.com/in/janesmith', 'janesmith', 'Jane Smith', 'Product Manager at Google | Ex-Meta', 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith', 'Google'),
('https://www.linkedin.com/in/kimminsu', 'kimminsu', '김민수', 'Software Engineer at Stripe | Open Source Contributor', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimminsu', 'Stripe'),
('https://www.linkedin.com/in/leejiyoung', 'leejiyoung', '이지영', 'Partner at Sequoia Capital | Investing in AI/ML', 'https://api.dicebear.com/7.x/avataaars/svg?seed=leejiyoung', 'Sequoia Capital'),
('https://www.linkedin.com/in/parkhyunwoo', 'parkhyunwoo', '박현우', 'CTO at AI Company | Stanford CS PhD', 'https://api.dicebear.com/7.x/avataaars/svg?seed=parkhyunwoo', 'AI Company'),
('https://www.linkedin.com/in/sarahlee', 'sarahlee', 'Sarah Lee', 'Design Lead at Figma | Previously Airbnb', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahlee', 'Figma'),
('https://www.linkedin.com/in/alexchen', 'alexchen', 'Alex Chen', 'Founder at FinTech Startup | Forbes 30 Under 30', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexchen', 'FinTech Startup'),
('https://www.linkedin.com/in/choiyuna', 'choiyuna', '최유나', 'Head of Engineering at Toss | Building payments infra', 'https://api.dicebear.com/7.x/avataaars/svg?seed=choiyuna', 'Toss'),
('https://www.linkedin.com/in/mikejohnson', 'mikejohnson', 'Mike Johnson', 'Senior Engineer at OpenAI | GPT Team', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikejohnson', 'OpenAI'),
('https://www.linkedin.com/in/songjihye', 'songjihye', '송지혜', 'Growth Lead at Coupang | Data-driven marketer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=songjihye', 'Coupang')
ON CONFLICT (linkedin_url) DO NOTHING;

-- 이벤트 ID 조회 후 참여자 등록
DO $$
DECLARE
    event_uuid UUID;
    user_record RECORD;
BEGIN
    -- 이벤트 ID 가져오기
    SELECT id INTO event_uuid FROM events WHERE slug = 'vibe-coding-sf-2025';

    IF event_uuid IS NULL THEN
        RAISE NOTICE 'Event not found. Please run schema.sql first.';
        RETURN;
    END IF;

    -- 각 사용자를 참여자로 등록
    FOR user_record IN SELECT id, linkedin_id FROM users LOOP
        INSERT INTO participants (event_id, user_id, visibility, qr_code_data, is_organizer)
        VALUES (
            event_uuid,
            user_record.id,
            'public',
            'meetlink:' || event_uuid || ':' || user_record.id || ':' || extract(epoch from now())::bigint,
            user_record.linkedin_id = 'johndoe'  -- johndoe를 운영자로 설정
        )
        ON CONFLICT (event_id, user_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Seed data inserted successfully!';
END $$;

-- 확인 쿼리
SELECT u.name, u.headline, u.company, p.visibility, p.is_organizer
FROM participants p
JOIN users u ON p.user_id = u.id
JOIN events e ON p.event_id = e.id
WHERE e.slug = 'vibe-coding-sf-2025'
ORDER BY p.created_at;
