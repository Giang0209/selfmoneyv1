# 💰 SelfMoney - Personal Finance Management App

SelfMoney là ứng dụng quản lý tài chính cá nhân toàn diện và hiện đại, giúp bạn theo dõi chi tiêu, quản lý dòng tiền giữa các ví, lập kế hoạch ngân sách hàng tháng và kiến tạo các mục tiêu tiết kiệm dài hạn bằng một giao diện thông minh, trực quan và bảo mật.

---

## 🚀 Tính năng nổi bật

### 1. 📊 Dashboard tổng quan tài chính
- Hiển thị trực quan **Tổng thu nhập**, **Tổng chi tiêu** và **Số dư khả dụng** theo bộ lọc thời gian.
- Tích hợp biểu đồ xu hướng tài chính động và danh mục chi tiêu phổ biến.

### 2. 💳 Quản lý nhiều tài khoản ví (Wallets)
- Tạo lập các ví tiền riêng biệt (Tiền mặt, Ngân hàng Vietcombank, Momo, ...).
- Ghi nhận hành động nạp tiền trực tiếp từ ví nguồn dưới dạng giao dịch Thu nhập thực tế để đồng bộ báo cáo chính xác.

### 3. 💸 Ghi chép & Lịch sử giao dịch (Transactions)
- Ghi nhận chi tiết mọi giao dịch thu chi kèm theo ví nguồn, phân loại danh mục, ghi chú và mốc thời gian.
- Bộ lọc nâng cao: Lọc giao dịch theo danh mục, tài khoản ví, tìm kiếm từ khóa ghi chú và khoảng thời gian tùy chỉnh linh hoạt.

### 4. 📁 Phân loại danh mục thông minh (Categories)
- Tạo danh mục chi tiêu/thu nhập với icon và màu sắc đặc trưng.
- **Smart Tab Auto-Switch**: Tự động chuyển tab thông minh khi tìm kiếm danh mục chéo.

### 5. 🧾 Ngân sách & Trợ lý chi tiêu (Smart Budgeting)
- Lập ngân sách giới hạn chi tiêu hàng tháng cho từng danh mục riêng biệt.
- **Trợ lý chi tiêu cố định hôm nay**: Đề xuất hạn mức chi tiêu hàng ngày ổn định dựa trên ngân sách còn lại chia cho số ngày còn lại trong tháng.
- Cảnh báo đỏ `⚠️ Quá hạn mức ngày` trực quan nếu chi tiêu thực tế hôm nay vượt quá ngưỡng khuyến nghị.

### 6. 🎯 Mục tiêu tiết kiệm (Saving Goals)
- Tạo mục tiêu tích lũy tài chính (ví dụ: Mua iPhone 16, Du lịch Nhật Bản...) có số tiền cần đạt và ngày đáo hạn cụ thể.
- Nạp tiền đóng góp tích lũy từ bất kỳ tài khoản ví nguồn nào.
- Hiển thị tiến trình bằng biểu đồ tròn trực quan và mở **Celebration Modal** động (hiệu ứng bắn pháo hoa) khi đạt mục tiêu 100% để khích lệ thói quen tích luỹ.

### 7. 🙈 Chế độ riêng tư bảo mật (Privacy Mode)
- Chỉ với 1 click vào biểu tượng con mắt (👁️ / 🙈) ở Header, toàn bộ số dư ví, tiền thu/chi, ngân sách và tiến trình tiết kiệm trên toàn ứng dụng sẽ lập tức ẩn đi dưới dạng ký tự `•••• đ`. Trạng thái này được lưu giữ thông qua `localStorage`.

### 8. 🌓 Giao diện sáng/tối linh hoạt (Adaptive Light/Dark Theme)
- Hỗ trợ đổi chế độ sáng/tối (Light/Dark Mode) hoàn chỉnh qua hệ thống CSS Variables. Gam màu nhẹ nhàng, độ tương phản cao, tối ưu chống mỏi mắt.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **Library**: React 19.2.4
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon Server)
- **Database Driver**: `pg` (Node-PostgreSQL)
- **Authentication**: JWT Token (HttpOnly Cookie-based) & bcrypt password hashing
- **Styling**: Tailwind CSS v4

---

## 📂 Cấu trúc dự án

```text
SelfMoney/
├── app/
│   ├── (auth)/            # Module Xác thực (Login / Register bằng SĐT & Họ tên)
│   ├── (main)/            # Trang giao diện chính (Dashboard, Wallets, Transactions, Saving Goals...)
│   ├── api/               # Backend API routes xử lý CRUD và database
│   ├── layout.tsx
│   ├── page.tsx           # Landing Page SaaS cao cấp
│   └── globals.css        # Hệ thống CSS variables & theme overrides
├── components/            # Các UI components dùng chung (Header, Sidebar, Toast...)
├── lib/                   # Xử lý Context toàn cục (Theme, Privacy) và từ điển ngôn ngữ
├── modules/               # Backend logic theo mô hình Controller - Service - Model - Types
├── public/                # Lưu trữ các file tĩnh, favicon, logo
├── Relation.sql           # Schema cấu trúc database PostgreSQL
└── README.md
```

---

## 📦 Hướng dẫn cài đặt và Chạy cục bộ

### 1. Clone dự án và truy cập thư mục
```bash
git clone https://github.com/LuongHuongGiang20236027/Project-2_selfmoney.git
cd Project-2_selfmoney
```

### 2. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 3. Thiết lập biến môi trường
Tạo file `.env` tại thư mục gốc của dự án với nội dung cấu hình sau:
```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/selfmoney
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Thiết lập Cơ sở dữ liệu PostgreSQL
Khởi chạy PostgreSQL, tạo một cơ sở dữ liệu mới và chạy toàn bộ mã lệnh SQL trong file [Relation.sql](file:///d:/Demo_money/Relation.sql) để khởi tạo các bảng `users`, `wallets`, `categories`, `transactions`, `budgets`, `saving_goals`, `saving_contributions` cùng các chỉ mục tối ưu.

### 5. Chạy dự án ở chế độ Phát triển (Development Mode)
```bash
npm run dev
```
Ứng dụng sẽ khả dụng cục bộ tại: [http://localhost:3000](http://localhost:3000)

### 6. Biên dịch ứng dụng (Production Build)
```bash
npm run build
npm run start
```

---

## 👨‍💻 Thông tin phát triển

Được thực hiện với ❤️ bởi **Giang**
