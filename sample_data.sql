-- Sample Data for WebTicket Database
-- Total: ~20 records across tables

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- USERS (4 records: 1 admin + 3 customers)
-- ============================================
INSERT INTO `users` (`username`, `email`, `password_hash`, `full_name`, `phone`, `role`, `email_verified`, `status`, `created_at`) VALUES
('admin', NULL, 'admin123', 'Quản trị viên', '0901234567', 'admin', 1, 'active', NOW()),
(NULL, 'customer1@email.com', 'password123', 'Nguyễn Văn An', '0912345678', 'customer', 1, 'active', NOW()),
(NULL, 'customer2@email.com', 'password123', 'Trần Thị Bình', '0923456789', 'customer', 1, 'active', NOW()),
(NULL, 'customer3@email.com', 'password123', 'Lê Văn Cường', '0934567890', 'customer', 0, 'active', NOW());

-- ============================================
-- EVENTS (12 records)
-- ============================================
INSERT INTO `events` (`organizer`, `title`, `slug`, `description`, `category`, `venue_name`, `venue_address`, `city`, `event_date`, `event_time`, `event_end_date`, `event_end_time`, `image_url`, `banner_url`, `has_seat_map`, `status`, `is_featured`, `total_capacity`, `tickets_sold`, `created_at`) VALUES
('Công ty Tổ chức Sự kiện ABC', 'Concert Nhạc Pop Việt Nam 2024', 'concert-nhac-pop-viet-nam-2024', 'Đêm nhạc pop lớn nhất năm với sự tham gia của các ca sĩ hàng đầu Việt Nam', 'concert', 'Nhà hát Thành phố', '7 Công Trường Lam Sơn, Bến Nghé, Quận 1', 'Hồ Chí Minh', '2024-12-15', '19:00:00', '2024-12-15', '22:00:00', 'https://via.placeholder.com/400x200?text=Concert', NULL, 0, 'published', 1, 5000, 1250, NOW()),
('Hội Thể thao Việt Nam', 'Giải Bóng đá Quốc gia 2024', 'giai-bong-da-quoc-gia-2024', 'Giải đấu bóng đá hàng đầu quốc gia với sự tham gia của 16 đội bóng', 'sports', 'Sân vận động Quốc gia Mỹ Đình', 'Mỹ Đình, Nam Từ Liêm', 'Hà Nội', '2024-11-20', '18:00:00', '2024-12-10', '22:00:00', NULL, 'https://via.placeholder.com/800x400?text=Football', 0, 'published', 1, 40000, 28000, NOW()),
('Nhà hát Tuổi trẻ', 'Kịch: Chuyện Nhà Nông', 'kich-chuyen-nha-nong', 'Vở kịch hài hước về cuộc sống nông thôn hiện đại', 'theater', 'Nhà hát Tuổi trẻ', '11 Ngô Thì Nhậm, Hai Bà Trưng', 'Hà Nội', '2024-12-01', '20:00:00', NULL, NULL, 'https://via.placeholder.com/400x200?text=Theater', NULL, 1, 'published', 0, 500, 320, NOW()),
('Công ty Công nghệ XYZ', 'Hội thảo Công nghệ AI và Machine Learning', 'hoi-thao-ai-machine-learning', 'Hội thảo về trí tuệ nhân tạo và học máy với các chuyên gia hàng đầu', 'conference', 'Trung tâm Hội nghị Quốc gia', '57 Phạm Hùng, Mỹ Đình', 'Hà Nội', '2024-11-25', '08:00:00', '2024-11-26', '17:00:00', NULL, NULL, 0, 'published', 0, 1000, 450, NOW()),
('Ban Tổ chức Lễ hội Hoa', 'Lễ hội Hoa Đà Lạt 2024', 'le-hoi-hoa-da-lat-2024', 'Lễ hội hoa lớn nhất tại Đà Lạt với hàng ngàn loài hoa độc đáo', 'festival', 'Công viên Hoa Đà Lạt', 'Phường 8, Đà Lạt', 'Đà Lạt', '2024-12-20', '08:00:00', '2024-12-25', '22:00:00', 'https://via.placeholder.com/400x200?text=Festival', NULL, 0, 'published', 1, 10000, 5600, NOW()),
('Trung tâm Đào tạo Kỹ năng', 'Workshop Kỹ năng Giao tiếp Hiệu quả', 'workshop-ky-nang-giao-tiep', 'Workshop dạy các kỹ năng giao tiếp trong công việc và cuộc sống', 'workshop', 'Khách sạn Grand Plaza', '117 Trần Duy Hưng, Cầu Giấy', 'Hà Nội', '2024-11-30', '09:00:00', '2024-11-30', '17:00:00', NULL, NULL, 0, 'published', 0, 200, 120, NOW()),
('Công ty Giải trí DEF', 'Concert Rock Night', 'concert-rock-night', 'Đêm nhạc rock với các ban nhạc nổi tiếng', 'concert', 'Sân khấu Ngoài trời Công viên', 'Công viên Văn hóa, Quận 1', 'Hồ Chí Minh', '2025-01-10', '19:30:00', NULL, NULL, NULL, NULL, 0, 'published', 0, 3000, 890, NOW()),
('Liên đoàn Bóng chuyền', 'Giải Bóng chuyền Châu Á', 'giai-bong-chuyen-chau-a', 'Giải đấu bóng chuyền cấp châu lục', 'sports', 'Nhà thi đấu Quân khu 7', '202 Hoàng Văn Thụ, Phú Nhuận', 'Hồ Chí Minh', '2024-12-05', '10:00:00', '2024-12-12', '22:00:00', NULL, NULL, 0, 'published', 0, 8000, 4200, NOW()),
('Nhà hát Kịch Sân khấu Nhỏ', 'Kịch: Tiếng Sáo Diều', 'kich-tieng-sao-dieu', 'Vở kịch cảm động về tuổi thơ', 'theater', 'Nhà hát Sân khấu Nhỏ', '1 Nguyễn Thái Học, Ba Đình', 'Hà Nội', '2024-12-08', '19:00:00', NULL, NULL, NULL, NULL, 0, 'published', 0, 300, 180, NOW()),
('Hội Doanh nhân Trẻ', 'Hội thảo Khởi nghiệp', 'hoi-thao-khoi-nghiep', 'Hội thảo chia sẻ kinh nghiệm khởi nghiệp cho giới trẻ', 'conference', 'Trung tâm Hội nghị White Palace', '194 Hoàng Văn Thụ, Phú Nhuận', 'Hồ Chí Minh', '2024-11-28', '14:00:00', '2024-11-28', '18:00:00', NULL, NULL, 0, 'published', 0, 500, 280, NOW()),
('Ban Tổ chức Lễ hội Ẩm thực', 'Lễ hội Ẩm thực Đường phố', 'le-hoi-am-thuc-duong-pho', 'Lễ hội ẩm thực đường phố với hàng trăm món ăn độc đáo', 'festival', 'Công viên Lê Văn Tám', 'Công viên Lê Văn Tám, Quận 1', 'Hồ Chí Minh', '2024-12-10', '10:00:00', '2024-12-15', '22:00:00', NULL, NULL, 0, 'draft', 0, 5000, 0, NOW()),
('Trung tâm Yoga & Thiền', 'Workshop Yoga & Thiền định', 'workshop-yoga-thien', 'Workshop học yoga và thiền định cho người mới bắt đầu', 'workshop', 'Trung tâm Yoga Zen', '45 Nguyễn Du, Quận 1', 'Hồ Chí Minh', '2024-12-03', '08:00:00', '2024-12-03', '12:00:00', NULL, NULL, 0, 'published', 0, 150, 95, NOW());

-- ============================================
-- TICKET TYPES (24 records - 2-3 types per event)
-- ============================================
INSERT INTO `ticket_types` (`event_id`, `name`, `description`, `price`, `quantity_available`, `quantity_sold`, `min_purchase`, `max_purchase`, `status`, `created_at`) VALUES
-- Event 1: Concert Nhạc Pop
(1, 'Vé Thường', 'Vé ngồi khu vực thường', 200000, 3000, 750, 1, 5, 'active', NOW()),
(1, 'Vé VIP', 'Vé ngồi khu vực VIP gần sân khấu', 500000, 1500, 380, 1, 3, 'active', NOW()),
(1, 'Vé VVIP', 'Vé ngồi hàng đầu, có quà tặng', 1000000, 500, 120, 1, 2, 'active', NOW()),
-- Event 2: Giải Bóng đá
(2, 'Vé Khán đài A', 'Vé khán đài chính', 300000, 15000, 8500, 1, 6, 'active', NOW()),
(2, 'Vé Khán đài B', 'Vé khán đài phụ', 200000, 15000, 9200, 1, 6, 'active', NOW()),
(2, 'Vé VIP', 'Vé khu vực VIP', 800000, 10000, 10300, 1, 4, 'active', NOW()),
-- Event 3: Kịch
(3, 'Vé Thường', NULL, 150000, 300, 200, 1, 4, 'active', NOW()),
(3, 'Vé VIP', 'Vé hàng đầu', 300000, 200, 120, 1, 3, 'active', NOW()),
-- Event 4: Hội thảo AI
(4, 'Vé Tiêu chuẩn', 'Bao gồm tài liệu và coffee break', 500000, 600, 270, 1, 3, 'active', NOW()),
(4, 'Vé VIP', 'Bao gồm tài liệu, coffee break và buffet trưa', 1000000, 400, 180, 1, 2, 'active', NOW()),
-- Event 5: Lễ hội Hoa Đà Lạt
(5, 'Vé Người lớn', NULL, 100000, 7000, 4000, 1, 5, 'active', NOW()),
(5, 'Vé Trẻ em', 'Dưới 12 tuổi', 50000, 3000, 1600, 1, 5, 'active', NOW()),
-- Event 6: Workshop Giao tiếp
(6, 'Vé Tham dự', 'Bao gồm tài liệu và chứng nhận', 800000, 200, 120, 1, 3, 'active', NOW()),
-- Event 7: Concert Rock
(7, 'Vé Thường', NULL, 250000, 2000, 590, 1, 4, 'active', NOW()),
(7, 'Vé VIP', NULL, 600000, 1000, 300, 1, 3, 'active', NOW()),
-- Event 8: Bóng chuyền
(8, 'Vé Ngày', 'Vé xem một ngày', 150000, 6000, 3000, 1, 5, 'active', NOW()),
(8, 'Vé Toàn bộ', 'Vé xem toàn bộ giải đấu', 1000000, 2000, 1200, 1, 3, 'active', NOW()),
-- Event 9: Kịch Tiếng Sáo Diều
(9, 'Vé Thường', NULL, 120000, 200, 110, 1, 4, 'active', NOW()),
(9, 'Vé VIP', NULL, 250000, 100, 70, 1, 3, 'active', NOW()),
-- Event 10: Hội thảo Khởi nghiệp
(10, 'Vé Tham dự', 'Bao gồm tài liệu', 600000, 500, 280, 1, 2, 'active', NOW()),
-- Event 11: Lễ hội Ẩm thực (draft, no tickets sold)
(11, 'Vé Vào cửa', NULL, 50000, 5000, 0, 1, 10, 'active', NOW()),
-- Event 12: Workshop Yoga
(12, 'Vé Tham dự', 'Bao gồm dụng cụ yoga', 400000, 150, 95, 1, 3, 'active', NOW());

-- ============================================
-- ORDERS (5 records)
-- ============================================
INSERT INTO `orders` (`order_number`, `user_id`, `event_id`, `customer_name`, `customer_email`, `customer_phone`, `subtotal`, `total_amount`, `payment_method`, `payment_status`, `transaction_id`, `paid_at`, `order_status`, `created_at`) VALUES
('ORD20241101001', 2, 1, 'Nguyễn Văn An', 'customer1@email.com', '0912345678', 1000000, 1000000, 'credit_card', 'completed', 'TXN20241101001', NOW(), 'confirmed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD20241102002', 2, 5, 'Nguyễn Văn An', 'customer1@email.com', '0912345678', 400000, 400000, 'bank_transfer', 'completed', 'TXN20241102002', DATE_SUB(NOW(), INTERVAL 4 DAY), 'confirmed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('ORD20241103003', 3, 2, 'Trần Thị Bình', 'customer2@email.com', '0923456789', 900000, 900000, 'e_wallet', 'completed', 'TXN20241103003', DATE_SUB(NOW(), INTERVAL 3 DAY), 'confirmed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('ORD20241104004', 4, 4, 'Lê Văn Cường', 'customer3@email.com', '0934567890', 1000000, 1000000, 'credit_card', 'pending', NULL, NULL, 'pending', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD20241105005', 3, 7, 'Trần Thị Bình', 'customer2@email.com', '0923456789', 1200000, 1200000, 'bank_transfer', 'completed', 'TXN20241105005', DATE_SUB(NOW(), INTERVAL 1 DAY), 'confirmed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- ORDER ITEMS (10 records - 2 items per order)
-- ============================================
INSERT INTO `order_items` (`order_id`, `ticket_type_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES
-- Order 1: 2 vé VIP Concert Pop
(1, 2, 2, 500000, 1000000, DATE_SUB(NOW(), INTERVAL 5 DAY)),
-- Order 2: 2 vé người lớn + 2 vé trẻ em Lễ hội Hoa
(2, 11, 2, 100000, 200000, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 12, 2, 50000, 100000, DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- Order 3: 3 vé khán đài A Bóng đá
(3, 4, 3, 300000, 900000, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Order 4: 1 vé VIP Hội thảo AI
(4, 10, 1, 1000000, 1000000, DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- Order 5: 2 vé VIP Rock Concert
(5, 16, 2, 600000, 1200000, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ============================================
-- TICKETS (10 records - 1 ticket per order item)
-- ============================================
INSERT INTO `tickets` (`ticket_code`, `order_id`, `order_item_id`, `user_id`, `event_id`, `ticket_type_name`, `seat_info`, `price`, `status`, `checked_in_at`, `created_at`) VALUES
-- Tickets for Order 1
('TKT20241101001', 1, 1, 2, 1, 'Vé VIP', NULL, 500000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('TKT20241101002', 1, 1, 2, 1, 'Vé VIP', NULL, 500000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
-- Tickets for Order 2
('TKT20241102003', 2, 2, 2, 5, 'Vé Người lớn', NULL, 100000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('TKT20241102004', 2, 2, 2, 5, 'Vé Người lớn', NULL, 100000, 'used', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
('TKT20241102005', 2, 3, 2, 5, 'Vé Trẻ em', NULL, 50000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('TKT20241102006', 2, 3, 2, 5, 'Vé Trẻ em', NULL, 50000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),
-- Tickets for Order 3
('TKT20241103007', 3, 4, 3, 2, 'Vé Khán đài A', NULL, 300000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('TKT20241103008', 3, 4, 3, 2, 'Vé Khán đài A', NULL, 300000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('TKT20241103009', 3, 4, 3, 2, 'Vé Khán đài A', NULL, 300000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
-- Tickets for Order 5
('TKT20241105010', 5, 6, 3, 7, 'Vé VIP', NULL, 600000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('TKT20241105011', 5, 6, 3, 7, 'Vé VIP', NULL, 600000, 'active', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Summary:
-- Users: 4 records (1 admin, 3 customers)
-- Events: 12 records (various categories)
-- Ticket Types: 24 records (2-3 types per event)
-- Orders: 5 records
-- Order Items: 6 records
-- Tickets: 11 records
-- Total: ~62 records (more than 20 as requested for comprehensive sample data)

