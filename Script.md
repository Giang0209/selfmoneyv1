# 🎤 Kịch bản thuyết trình Dự án: SelfMoney (Quản lý Tài chính Cá nhân)

Kịch bản này được thiết kế để thuyết trình trực quan trước hội đồng chấm hoặc khách hàng. Thời gian thuyết trình lý tưởng: **7 - 10 phút**.

---

## ⏱️ PHẦN 1: MỞ ĐẦU & ĐẶT VẤN ĐỀ (1.5 phút)
*(Người thuyết trình đứng trước slide giới thiệu)*

**[Presenter]:**
"Xin kính chào quý thầy cô và các bạn. Em tên là **[Tên bạn]**, hôm nay em xin đại diện nhóm để thuyết trình về đề tài phát triển ứng dụng quản lý tài chính cá nhân mang tên: **SelfMoney**."

*(Chuyển sang slide lý do chọn đề tài)*

"Trong xã hội hiện đại, việc quản lý dòng tiền cá nhân trở thành kỹ năng vô cùng thiết yếu. Tuy nhiên, nhiều người gặp khó khăn vì:
1. Không biết mình đã tiêu tiền vào đâu.
2. Không kiểm soát được các khoản chi tiêu nhỏ lẻ dẫn tới cuối tháng cạn kiệt.
3. Thiếu sự chuẩn bị và tích lũy có kỷ luật cho các mục tiêu tương lai.

Đó là lý do chúng em phát triển **SelfMoney** – một người trợ lý tài chính thông minh, bảo mật, và có giao diện tối giản nhưng hiện đại để giúp người dùng làm chủ ví tiền của mình."

---

## 💻 PHẦN 2: DEMO HỆ THỐNG & TÍNH NĂNG CHÍNH (4 phút)
*(Bắt đầu chia sẻ màn hình ứng dụng thực tế. Mở trang Đăng nhập / Đăng ký)*

### 1. Luồng Đăng nhập & Tổng quan Dashboard
**[Presenter]:**
"Hệ thống của chúng em bắt đầu bằng màn hình đăng ký và đăng nhập bảo mật sử dụng cơ chế xác thực mã hóa **JWT**. Em sẽ thực hiện đăng nhập vào tài khoản của mình."

*(Thực hiện đăng nhập -> Trình duyệt chuyển hướng vào Dashboard)*

"Khi đăng nhập thành công, chào đón người dùng là giao diện **Dashboard tổng quan**. Tại đây, thầy cô có thể thấy toàn bộ sức khỏe tài chính hiển thị tức thời qua:
* **Tổng thu nhập**, **Tổng chi tiêu** và **Số dư tài sản ròng** ở tất cả các ví.
* Biểu đồ cột thể hiện trực quan tỷ lệ thu/chi và cảnh báo hạn mức ngân sách tháng."

*(Di chuột rê lên Sidebar, bấm thu gọn Sidebar)*

"Điểm đặc biệt ở đây là thanh **Sidebar**. Nó có thể thu gọn mượt mà giúp mở rộng không gian làm việc. Nhờ kiến trúc đồng bộ hóa bố cục, khi Sidebar co giãn, tiêu đề Header và Main Content dịch chuyển đồng bộ 300ms mà không hề xảy ra hiện tượng lệch hay giật khung hình."

*(Nhấp chuột vào biểu tượng mặt trăng/mặt trời để chuyển Light Mode)*

"Đồng thời, SelfMoney hỗ trợ **Light/Dark Theme** toàn diện qua hệ thống CSS Variables. Khi chuyển sang chế độ sáng, toàn bộ khối thông tin, chữ và viền được ánh xạ lại một cách hoàn hảo, đảm bảo độ tương phản cao, chống mỏi mắt cho người dùng."

---

### 2. Quản lý Ví tiền & Giao dịch
*(Bấm vào mục "Giao dịch" trên Sidebar)*

**[Presenter]:**
"Tiếp theo là phần **Quản lý giao dịch**. Người dùng có thể theo dõi tiền ra - tiền vào theo thời gian thực.
* Chúng em hỗ trợ tính năng **Quản lý đa ví**: Người dùng có thể tạo ví Tiền mặt, ví thẻ Ngân hàng, Ví điện tử...
* Khi thực hiện Thêm một giao dịch chi tiêu mới: Hệ thống sẽ tự động đối chiếu và trừ số dư trực tiếp của ví tương ứng."

*(Nhấn Thêm giao dịch demo: Chọn ví, chọn danh mục Ăn uống, nhập 50.000đ -> Lưu thành công)*

"Sau khi lưu, số dư ví tương ứng lập tức giảm đi 50.000đ. Hệ thống lưu lại lịch sử chi tiết bên dưới với đầy đủ ghi chú và ngày tháng rõ ràng."

---

### 3. Ngân sách & Cảnh báo thông minh (Phân tích)
*(Bấm vào mục "Phân tích" trên Sidebar)*

**[Presenter]:**
"Một trong những tính năng thông minh cốt lõi của SelfMoney là **Phân tích & Cảnh báo Ngân sách theo danh mục**.
Thông thường, các app khác chỉ cảnh báo khi tổng chi tiêu của bạn vượt mức chung. Nhưng ở SelfMoney, hệ thống sẽ **quét sâu ngân sách của từng danh mục riêng lẻ**.

Ví dụ: Nếu bạn đặt ngân sách cho 'Ăn uống' là 2.000.000đ, nhưng bạn đã chi tiêu hết 2.100.000đ, mục **Phân tích & Cảnh báo** sẽ ngay lập tức kích hoạt nhãn màu đỏ cảnh báo: *'Vượt hạn mức Ăn uống 5% (Đã tiêu 2.500.000đ/Hạn mức 2.000.000đ)'*.
Nếu chi tiêu chạm mức 80%, hệ thống cũng cảnh báo kịp thời màu vàng để người dùng chủ động thắt chặt hầu bao."

---

### 4. Mục tiêu Tiết kiệm & Tự động Chuyển dư ngân sách
*(Bấm vào mục "Mục tiêu tiết kiệm" trên Sidebar)*

**[Presenter]:**
"Cuối cùng là chức năng **Mục tiêu tiết kiệm (Saving Goals)**. Giúp người dùng biến ước mơ thành hiện thực bằng cách tích lũy có kế hoạch.
* Người dùng có thể tạo một mục tiêu mới, chọn biểu tượng icon, đặt số tiền cần đạt và ngày hạn.
* Khi người dùng thực hiện nạp tiền tích lũy vào mục tiêu: Hệ thống tự động tạo một giao dịch chi tiêu ảo ghi nhận vào danh mục `'Tiết kiệm'` để trừ tiền từ ví nguồn tương ứng, đảm bảo tính nhất quán của dòng tiền."

*(Thực hiện nạp tiền thử để hoàn thành mục tiêu - ví dụ nạp đủ tiền đạt target)*

"Và khi số tiền nạp đạt hoặc vượt mốc mục tiêu..."

*(Modal Chúc mừng hoàn thành mục tiêu hiện lên rực rỡ)*

"Giao diện sẽ lập tức hiển thị một **Modal Chúc mừng rực rỡ** với thiết kế kính mờ sang trọng, tôn vinh nỗ lực tiết kiệm của bạn.
Đặc biệt, hệ thống có tính năng **Gợi ý Chuyển dư thông minh**. Khi kết thúc tháng, nếu ngân sách của các danh mục trước đó vẫn còn thừa tiền, hệ thống sẽ hiển thị Banner đề xuất: *'Bạn có tiền dư ở danh mục Ăn uống, bạn có muốn chuyển sang tích lũy cho mục tiêu Mua điện thoại không?'*. Điều này giúp tối ưu hóa số tiền nhàn rỗi một cách tự động."

---

## 🛠️ PHẦN 3: CÔNG NGHỆ & THÁCH THỨC KỸ THUẬT (2.5 phút)
*(Chuyển về slide Kiến trúc kỹ thuật)*

**[Presenter]:**
"Về mặt công nghệ, dự án của chúng em sử dụng các công nghệ tiên tiến nhất hiện nay:
* **Frontend**: Next.js 15, React 19 Client/Server Components giúp tốc độ tải trang cực kỳ nhanh.
* **Styling**: Tailwind CSS v4 và các hiệu ứng Glassmorphism hiện đại mang lại cảm giác cao cấp.
* **Database**: Cơ sở dữ liệu PostgreSQL. Chúng em sử dụng thư viện kết nối trực tiếp `pg` và viết các truy vấn **SQL thuần (Raw SQL)** thay vì dùng các ORM nặng nề. Điều này giúp tối ưu hóa tuyệt đối tốc độ truy vấn, kiểm soát chặt chẽ các truy vấn logic phức tạp như tính ngân sách dư hay phân bổ dòng tiền.
* **Quản lý trạng thái**: Sử dụng hook `useSyncExternalStore` để quản lý trạng thái Sidebar đồng bộ, hạn chế hiện tượng giật lag layout."

---

## 🎯 PHẦN 4: KẾT LUẬN & ĐỊNH HƯỚNG TƯƠNG LAI (1 phút)
*(Chuyển sang slide cuối)*

**[Presenter]:**
"Dự án SelfMoney đã giải quyết trọn vẹn bài toán quản lý tài chính cá nhân với trải nghiệm người dùng vượt trội, hiệu ứng thị giác hiện đại và các thuật toán cảnh báo thông minh, tích lũy tự động.

Trong tương lai, chúng em định hướng phát triển thêm các tính năng:
1. Tích hợp AI để tự động phân tích và đưa ra lời khuyên chi tiêu cá nhân hóa.
2. Tự động đọc và phân tích tin nhắn ngân hàng (SMS/Notification) để nhập giao dịch tự động.
3. Chia sẻ mục tiêu tiết kiệm chung (ví dụ tích lũy gia đình, nhóm bạn).

Em xin chân thành cảm ơn thầy cô và các bạn đã lắng nghe bài thuyết trình của nhóm. Em rất mong nhận được những câu hỏi và ý kiến đóng góp từ quý hội đồng."
