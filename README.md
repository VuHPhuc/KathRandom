# Wheel of Names | Bản Sao 1:1 + Tính Năng Bí Mật F1 & File .EXE Laptop

Ứng dụng bản sao **1:1 giống y đúc [Wheel of Names (wheelofnames.com)](https://wheelofnames.com/)**, đầy đủ thanh công cụ, font chữ Quicksand, vòng quay chuẩn tỷ lệ, bảng Entries/Results, âm thanh ticker, pháo giấy confetti và hộp thoại thông báo chiến thắng "We have a winner!".

Điểm đặc biệt: Tích hợp **Bảng Điều Khiển Bí Mật (F1)** cho phép can thiệp kết quả quay theo kịch bản và ghép cặp đấu 2 bên cực kỳ kín đáo, cùng với **file chạy độc lập .EXE cho Laptop Windows**.

---

## 🌐 Trải Nghiệm Trực Tiếp
- **🔗 Chơi Online (GitHub Pages):** **[https://vuhphuc.github.io/KathRandom/](https://vuhphuc.github.io/KathRandom/)**
- **📦 Tải Bản Cài Sẵn Windows (.EXE):** **[Tải VongQuayMayMan.exe từ GitHub Release](https://github.com/VuHPhuc/KathRandom/releases/download/v1.0.0/VongQuayMayMan.exe)**

---

## 💻 Cách Khởi Động Ứng Dụng

### 👉 Cách 1: Chạy trực tiếp file EXE (Khuyên dùng cho Laptop Windows)
- Nhấp đúp chuột vào file: **[`VongQuayMayMan.exe`](file:///c:/Users/boycu/Downloads/KathRandom/VongQuayMayMan.exe)** ngay trong thư mục này (hoặc tải từ Releases).
- Mở cửa sổ ứng dụng Windows độc lập (Native Desktop App), không cần cài đặt Node.js hay mở trình duyệt web.

### 👉 Cách 2: Chạy bản Web trên trình duyệt (Dành cho nhà phát triển)
- Mở thư mục **`SourceCode/`**, nhấp đúp vào **`chay_ung_dung.bat`** (hoặc chạy `npm run dev`), mở tại `http://localhost:5173/`.

---

## 🤫 Tính Năng Bí Mật (Phím F1): Nạp Kịch Bản Trước & Kích Hoạt Tàng Hình

### 1. 📋 Hướng Dẫn Setup Kịch Bản Trước (Ở Nhà / Trước Giờ G)
- **Bước 1:** Nhập danh sách tên người chơi vào ô **Entries** bên phải.
- **Bước 2:** Bấm phím **`F1`** để mở Bảng Kịch Bản Bí Mật.
- **Bước 3:** Lựa chọn loại kịch bản:
  - **⚔️ Ghép Cặp Đấu 2 Bên (Chỉ số chẵn: 2vs2, 4vs4, 6vs6, 8vs8):** Chọn mẫu nút bấm nhanh (ví dụ `2 vs 2`), nhấn nút **`⚡ Phân bổ tự động`** (hoặc bấm dấu `+` cạnh tên). Vòng quay sẽ tự động quay đủ người của **Đội Trái** trước, rồi mới quay sang **Đội Phải**.
  - **🎯 Thứ Tự Cá Nhân (Tuần tự):** Định sẵn người trúng theo thứ tự (Lượt 1 trúng ai, Lượt 2 trúng ai...).
- **Bước 4:** Đóng bảng F1. Toàn bộ kịch bản **tự động lưu vĩnh viễn vào bộ nhớ máy (`localStorage`)**. Bạn có thể tắt app, tắt máy, hôm sau mang đến hội trường mở lên là kịch bản đã nằm sẵn trong bộ nhớ ngầm.
- *(Tùy chọn)*: Có nút **"📋 Copy kịch bản"** và **"📥 Dán kịch bản"** để bạn lưu dự phòng ra Zalo/Notepad.

---

### 2. 🥷 Cơ Chế Kích Hoạt Tàng Hình (Cách 1 - Khuyên Dùng Nhất)
Khi đứng trước máy chiếu hoặc livestream, bạn **tuyệt đối không cần mở F1**:
- **Quay thử / Demo (1-2 lượt đầu):**
  - **Click chuột bình thường** vào giữa vòng quay (hoặc nhấn `Ctrl + Enter`).
  - Vòng quay sẽ quay **hoàn toàn NGẪU NHIÊN 100%**. Thoải mái quay demo bao nhiêu lượt tùy thích!
- **Quay thật theo kịch bản:**
  - **Giữ phím `Shift` rồi Click chuột vào vòng quay** (hoặc nhấn `Shift + Ctrl + Enter`).
  - Vòng quay sẽ **chạy đúng theo kịch bản đã set-up từ trước**!
  - Khán giả ngồi nhìn máy chiếu chỉ thấy bạn bấm chuột vào giữa vòng quay như bình thường, hoàn toàn không biết tay trái đang đè phím `Shift`.
- **Dấu hiệu nhận biết bí mật:** Ở góc dưới cùng bên trái màn hình có một chấm 2px tàng hình. Khi bạn giữ phím `Shift`, chấm nhỏ sẽ sáng nhẹ màu xanh ngọc để bạn an tâm biết chắc chắn lượt này đang ăn theo kịch bản.

---

### 3. ⌨️ Phím Tắt Tiện Ích
- **`Shift` + Click chuột** (hoặc `Shift + Ctrl + Enter`): Quay theo **Kịch bản đã nạp sẵn**.
- **Click chuột bình thường** (hoặc `Ctrl + Enter`): Quay **Ngẫu nhiên (Demo)**.
- **`F1`**: Bật / Tắt Bảng Kịch Bản Chọn Lọc & Ghép Cặp Bí Mật.
- **`F2`**: Bật / Tắt nhanh chế độ kịch bản trong im lặng (không mở popup).
- **`Esc`**: Đóng nhanh bảng F1 hoặc popup trúng thưởng.
- **`F11`**: Toàn màn hình.
