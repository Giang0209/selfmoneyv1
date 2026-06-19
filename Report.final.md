# 📂 Cấu trúc dự án SelfMoney

```text
Demo_money/
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ README.md
├─ Relation.sql
├─ Report.final.md
├─ app/
│   ├─ (auth)/
│   │   ├─ login/
│   │   │   └─ page.tsx
│   │   └─ register/
│   │       └─ page.tsx
│   ├─ (main)/
│   │   ├─ dashboard/
│   │   │   └─ page.tsx
│   │   ├─ wallets/
│   │   │   └─ page.tsx
│   │   ├─ categories/
│   │   │   └─ page.tsx
│   │   ├─ transactions/
│   │   │   └─ page.tsx
│   │   ├─ budgets/
│   │   │   └─ page.tsx
│   │   ├─ saving-goals/
│   │   │   └─ page.tsx
│   │   ├─ analytics/
│   │   │   └─ page.tsx
│   │   └─ profile/
│   │       └─ page.tsx
│   ├─ api/
│   │   ├─ auth/
│   │   ├─ wallets/
│   │   ├─ categories/
│   │   ├─ transactions/
│   │   ├─ budgets/
│   │   ├─ saving-goals/
│   │   ├─ upload/
│   │   └─ profile/
│   ├─ globals.css
│   ├─ layout.tsx
│   └─ page.tsx
├─ components/
│   ├─ Header.tsx
│   ├─ Sidebar.tsx
│   ├─ Providers.tsx
│   ├─ Toast.tsx
│   └─ SidebarStore.ts
├─ lib/
│   ├─ PrivacyContext.tsx
│   ├─ ThemeContext.tsx
│   └─ translations.ts
├─ modules/
│   ├─ auth/
│   │   ├─ controllers/
│   │   ├─ models/
│   │   ├─ services/
│   │   └─ types/
│   ├─ wallets/
│   ├─ categories/
│   ├─ transactions/
│   ├─ budgets/
│   ├─ saving-goals/
│   └─ profiles/
├─ public/
│   └─ (assets)
└─ (other configuration files)
```

*Các thư mục được phân chia theo chức năng:* 
- **`app/`** chứa các route chính của Next.js bao gồm UI (App Router) và các API Endpoint (`app/api/`).
- **`components/`** tập hợp các UI Component tái sử dụng toàn cục (Header, Sidebar, Toast, ...). 
- **`lib/`** chứa mã nguồn xử lý trạng thái chung như Quản lý Giao diện (ThemeContext), Chế độ Riêng tư (PrivacyContext) và các từ điển Dịch thuật (translations).
- **`modules/`** tách biệt cấu trúc backend logic theo mô hình Controller - Service - Model - Types, tương tác trực tiếp với cơ sở dữ liệu PostgreSQL.
- **`public/`** lưu tài nguyên tĩnh (logo, favicon). 
- **`Relation.sql`** định nghĩa chi tiết schema PostgreSQL cho toàn bộ hệ thống.

---

## 2. Các Bảng Cơ Sở Dữ Liệu (Database Schema)

Cơ sở dữ liệu của ứng dụng gồm các bảng chính sau (chi tiết tại [Relation.sql](file:///d:/Demo_money/Relation.sql)):
1. **`users`**: Lưu trữ thông tin tài khoản người dùng bao gồm Họ tên, Số điện thoại (dùng đăng nhập trực tiếp, không sử dụng username), Ảnh đại diện, Ngày sinh, Giới tính, và Hash mật khẩu (`password_hash`).
2. **`wallets`**: Tài khoản ví lưu trữ tiền (Tiền mặt, Ngân hàng, ...), hỗ trợ quản lý số dư độc lập và đánh dấu màu sắc/biểu tượng.
3. **`categories`**: Danh mục phân loại Thu nhập (`income`) hoặc Chi tiêu (`expense`), ràng buộc không trùng tên trên mỗi người dùng.
4. **`transactions`**: Nhật ký giao dịch thu chi liên kết chặt chẽ với Ví nguồn và Danh mục phân loại.
5. **`budgets`**: Kế hoạch hạn mức ngân sách đặt ra theo tháng/năm cho từng danh mục chi tiêu riêng biệt.
6. **`saving_goals`**: Các mục tiêu tiết kiệm tích lũy (ví dụ: Mua điện thoại, Đi du lịch) có hạn hoàn thành, số tiền cần đạt và tùy chọn liên kết danh mục ngân sách để hệ thống đề xuất dòng tiền dư.
7. **`saving_contributions`**: Nhật ký chi tiết lịch sử nạp tiền từ các tài khoản ví vào từng mục tiêu tiết kiệm cụ thể.

---

## 3. Chức năng hệ thống

### 3.1. Chức năng xác thực & Quản lý Tài khoản (Authentication & Profile)
- **Đăng ký tài khoản mới**: Thông qua Số điện thoại, Họ tên và Mật khẩu (Trường `username` đã loại bỏ hoàn toàn để tinh giản trải nghiệm).
- **Đăng nhập & Xác thực**: Sử dụng cơ chế mã hóa mật khẩu bcrypt ở backend và xác thực toàn quyền thông qua JWT token lưu trữ trong cookie an toàn.
- **Hồ sơ cá nhân**: Hỗ trợ cập nhật thông tin cá nhân và tải ảnh đại diện lên bộ nhớ lưu trữ. Đối với người dùng mới đăng ký, hệ thống tự động gán **Vector Silhouette Avatar** mặc định, hoạt động hoàn toàn offline để nâng cao độ tin cậy.

### 3.2. Quản lý ví tài chính (Wallets)
- Tạo mới, cập nhật tên/biểu tượng/màu sắc, hoặc xóa ví lưu trữ.
- Theo dõi số dư thực tế theo thời gian thực với hiệu ứng chuyển sắc gradient đặc trưng của ví.
- Thao tác nạp tiền nhanh trực tiếp từ giao diện thẻ ví, tạo luồng giao dịch Thu nhập thực tế vào lịch sử giúp đồng bộ dữ liệu báo cáo thống kê chính xác 100%.

### 3.3. Quản lý danh mục & Giao dịch (Categories & Transactions)
- Lập danh mục chi tiêu/thu nhập kèm icon và màu sắc đặc thù. Tính năng **Smart Tab Auto-Switch** tự động chuyển tab phù hợp khi tìm kiếm danh mục chéo.
- Ghi nhận chi tiết lịch sử thu chi: số tiền, ví thực hiện, danh mục, ngày phát sinh và ghi chú đi kèm.
- Bộ lọc nâng cao: Tìm kiếm theo ghi chú, lọc theo danh mục, lọc theo tài khoản nguồn và khoảng thời gian tùy chỉnh.

### 3.4. Quản lý ngân sách & Trợ lý Chi tiêu thông minh (Smart Budgeting Assistant)
- Thiết lập ngân sách hạn mức hàng tháng cho các danh mục chi tiêu.
- **Trợ lý chi tiêu hôm nay**: Tự động tính toán hạn mức đề xuất hàng ngày cố định theo công thức: `hạn mức ngày = (ngân sách còn lại + tổng chi tiêu thực tế hôm nay) / số ngày còn lại`.
- Hiển thị cảnh báo đỏ `⚠️ Quá hạn mức ngày` trên thẻ giao diện và biểu ngữ trợ lý nếu chi tiêu hôm nay vượt ngưỡng khuyến nghị nhằm giữ vững kế hoạch tài chính của người dùng.

### 3.5. Quản lý mục tiêu tiết kiệm (Saving Goals)
- Tạo mục tiêu tích lũy tài chính với mục tiêu số tiền mong muốn và ngày đáo hạn tùy chọn.
- Cho phép đóng góp nạp tiền tích lũy trực tiếp từ một ví bất kỳ.
- Hiển thị tiến trình bằng biểu đồ tròn trực quan tỉ lệ phần trăm hoàn thành.
- Mở **Celebration Modal** đặc sắc (hiệu ứng nổ pháo hoa và âm điệu màu sắc động) khi mục tiêu tiết kiệm đạt 100% để khích lệ người dùng.

### 3.6. Chế độ riêng tư toàn cục (Privacy Mode)
- Nút toggle hình con mắt trực quan đặt ngay góc trên thanh Header.
- Khi kích hoạt, tất cả các con số liên quan đến số dư ví, thu nhập, chi tiêu, ngân sách, mục tiêu tiết kiệm trên toàn ứng dụng sẽ được ẩn hoàn toàn và thay thế bằng ký tự bảo mật `•••• đ`. 
- Trạng thái riêng tư được lưu tự động trong `localStorage` để duy trì cài đặt qua các phiên làm việc tiếp theo.

### 3.7. Giao diện sáng/tối linh hoạt (Adaptive Light/Dark Theme)
- Hỗ trợ đổi chế độ sáng/tối (Light/Dark Mode) hoàn chỉnh thông qua hệ thống CSS Variables.
- Màu nền, chữ, viền thẻ được chuyển đổi mượt mà sang gam màu tương phản cao (Pristine White, Platinum, Slate Gray) ở chế độ sáng, loại bỏ tình trạng mỏi mắt và nâng tầm thẩm mỹ giao diện người dùng.

---

## 4. Yêu cầu phi chức năng & Bảo mật
- **Mật khẩu an toàn**: Mã hóa băm mật khẩu một chiều bằng bcrypt độ muối cao trước khi lưu vào DB.
- **API Protection**: Bảo vệ các Endpoint API quan trọng bằng middleware xác thực JWT cookie-based.
- **Thiết kế Responsive**: Tương thích mượt mà trên tất cả thiết bị (Mobile, Tablet, Desktop) nhờ hệ thống lưới linh hoạt của Tailwind CSS.
- **Tải trang nhanh**: Tận dụng tối đa Next.js Turbopack và cơ chế Server-side Rendering (SSR) / Client-side Hydration tối ưu.
