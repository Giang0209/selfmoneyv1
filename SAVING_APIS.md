# 🎯 Danh sách API - Mục tiêu tiết kiệm (Saving Goals)

Tài liệu này liệt kê toàn bộ các API của chức năng quản lý mục tiêu tiết kiệm trong ứng dụng **SelfMoney**. Tất cả các endpoint đều yêu cầu xác thực JWT bằng Header: `Authorization: Bearer <token>`.

---

### 1. Lấy danh sách mục tiêu tiết kiệm
* **Endpoint:** `GET /api/saving-goals`
* **Mô tả:** Lấy danh sách toàn bộ các mục tiêu tiết kiệm của người dùng hiện tại (bao gồm cả thông tin liên kết danh mục ngân sách).
* **Phản hồi thành công (200 OK):**
  ```json
  [
    {
      "id": 1,
      "user_id": 4,
      "category_id": 2,
      "name": "Mua điện thoại mới",
      "icon": "📱",
      "target_amount": 10000000,
      "saved_amount": 200000,
      "deadline": "2026-08-26T00:00:00.000Z",
      "status": "active",
      "color": "#06b6d4",
      "created_at": "2026-06-12T13:00:00.000Z",
      "updated_at": "2026-06-12T13:10:00.000Z",
      "deleted_at": null,
      "category_name": "Thiết bị điện tử",
      "category_icon": "🔌",
      "category_color": "blue"
    }
  ]
  ```

---

### 2. Tạo mới mục tiêu tiết kiệm
* **Endpoint:** `POST /api/saving-goals`
* **Mô tả:** Thiết lập một mục tiêu tiết kiệm mới.
* **Yêu cầu Body:**
  ```json
  {
    "name": "Mua điện thoại mới",
    "target_amount": 10000000,
    "icon": "📱",
    "deadline": "2026-08-26",
    "color": "#06b6d4",
    "category_id": 2
  }
  ```
  *(Các trường `icon`, `deadline`, `color`, `category_id` là tuỳ chọn)*
* **Phản hồi thành công (201 Created):**
  ```json
  {
    "message": "Tạo mục tiêu tiết kiệm thành công",
    "goal": {
      "id": 1,
      "user_id": 4,
      "name": "Mua điện thoại mới",
      "target_amount": 10000000,
      "saved_amount": 0,
      "status": "active",
      ...
    }
  }
  ```

---

### 3. Cập nhật mục tiêu tiết kiệm
* **Endpoint:** `PATCH /api/saving-goals/[id]`
* **Mô tả:** Cập nhật thông tin chi tiết hoặc trạng thái của một mục tiêu tiết kiệm.
* **Yêu cầu Body:** *(Có thể truyền một hoặc nhiều trường)*
  ```json
  {
    "name": "Tên mới",
    "target_amount": 12000000,
    "status": "completed",
    "color": "#8b5cf6"
  }
  ```
* **Phản hồi thành công (200 OK):**
  ```json
  {
    "message": "Cập nhật mục tiêu tiết kiệm thành công",
    "goal": { ... }
  }
  ```

---

### 4. Xóa mục tiêu tiết kiệm
* **Endpoint:** `DELETE /api/saving-goals/[id]`
* **Mô tả:** Xoá mềm (soft delete) mục tiêu tiết kiệm khỏi hệ thống.
* **Phản hồi thành công (200 OK):**
  ```json
  {
    "message": "Xóa mục tiêu tiết kiệm thành công"
  }
  ```

---

### 5. Nạp tiền/Đóng góp vào mục tiêu
* **Endpoint:** `POST /api/saving-goals/[id]/contribute`
* **Mô tả:** Nạp tiền vào mục tiêu tiết kiệm được chỉ định. Hành động này sẽ tạo một giao dịch chi tiêu tự động với danh mục "Tiết kiệm" để trừ số dư ví nguồn, đồng thời tích luỹ số tiền vào mục tiêu. Nếu số tiền đóng góp đạt hoặc vượt mục tiêu, trạng thái mục tiêu sẽ tự động cập nhật thành `completed`.
* **Yêu cầu Body:**
  ```json
  {
    "wallet_id": 1,
    "amount": 500000,
    "note": "Tiết kiệm thêm từ lương tháng 6"
  }
  ```
* **Phản hồi thành công (200 OK):**
  ```json
  {
    "message": "Nạp tiền vào mục tiêu tiết kiệm thành công",
    "contribution": {
      "id": 12,
      "goal_id": 1,
      "user_id": 4,
      "transaction_id": 85,
      "amount": 500000,
      "note": "Tiết kiệm thêm từ lương tháng 6",
      "contributed_at": "2026-06-12T13:50:00.000Z"
    },
    "goal": {
      "id": 1,
      "saved_amount": 500000,
      "target_amount": 10000000,
      "status": "active",
      ...
    },
    "transaction": {
      "id": 85,
      "wallet_id": 1,
      "amount": 500000,
      "note": "Tiết kiệm cho mục tiêu: Mua điện thoại mới"
    }
  }
  ```

---

### 6. Lấy lịch sử đóng góp của mục tiêu
* **Endpoint:** `GET /api/saving-goals/[id]/contributions`
* **Mô tả:** Lấy danh sách lịch sử tất cả các lần nạp tiền của một mục tiêu cụ thể, hiển thị kèm tên ví nguồn đã nạp.
* **Phản hồi thành công (200 OK):**
  ```json
  [
    {
      "id": 12,
      "goal_id": 1,
      "user_id": 4,
      "transaction_id": 85,
      "amount": 500000,
      "note": "Tiết kiệm thêm từ lương tháng 6",
      "contributed_at": "2026-06-12T13:50:00.000Z",
      "wallet_id": 1,
      "wallet_name": "Ví Tiền mặt"
    }
  ]
  ```

---

### 7. Lấy ngân sách danh mục còn dư cuối tháng
* **Endpoint:** `GET /api/saving-goals/budget-surplus?month=X&year=Y`
* **Mô tả:** Tính toán số tiền còn dư của các ngân sách danh mục trong tháng/năm chỉ định (phải là tháng đã kết thúc trong quá khứ). Đồng thời liệt kê các mục tiêu tiết kiệm đang hoạt động có liên kết với danh mục đó để gợi ý người dùng chuyển số dư tích luỹ.
* **Phản hồi thành công (200 OK):**
  ```json
  [
    {
      "category_id": 2,
      "category_name": "Thiết bị điện tử",
      "category_icon": "🔌",
      "category_color": "blue",
      "budget_amount": 2000000,
      "total_spent": 1500000,
      "surplus_amount": 500000,
      "month": 5,
      "year": 2026,
      "goals": [
        {
          "id": 1,
          "name": "Mua điện thoại mới",
          "icon": "📱",
          "saved_amount": 0,
          "target_amount": 10000000,
          "color": "#06b6d4"
        }
      ]
    }
  ]
  ```
