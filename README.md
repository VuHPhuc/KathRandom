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

## 🤫 Tính Năng Bí Mật (Phím F1): Ghép Cặp Đấu 2 Bên & Kịch Bản Có Chọn Lọc

Nhấn phím **`F1`** bất cứ lúc nào trên bàn phím để bật/tắt bảng điều khiển bí mật. Người xem hoàn toàn không biết bạn đang can thiệp kết quả:

### 1. ⚔️ Ghép Cặp Đấu 2 Bên (Chỉ Số Chẵn: 2 vs 2, 4 vs 4, 6 vs 6, 8 vs 8)
- **Quy tắc phân chia:** Gồm 2 bên cân bằng: **⬅️ ĐỘI TRÁI** vs **➡️ ĐỘI PHẢI**.
- **Chỉ hỗ trợ số lượng chẵn:** Cung cấp sẵn các mẫu nút bấm nhanh: **`2 vs 2`**, **`4 vs 4`**, **`6 vs 6`**, **`8 vs 8`**.
- **Thứ tự quay tự động từ Trái qua Phải:**
  - Vòng quay sẽ tự động quay trúng đủ số người của **Đội Bên Trái** trước (ví dụ 2 người bên trái).
  - Khi Đội Bên Trái đã đủ số lượng, hệ thống sẽ tự động chuyển sang quay cho **Đội Bên Phải** (2 người bên phải).
- **Thao tác nhanh:**
  - Nhấn nút **`⚡ Phân bổ tự động (Trái qua Phải)`** để hệ thống tự động gán người chơi vào các vị trí.
  - Hoặc kéo thả / bấm nút **`+`** cạnh tên để xếp thủ công.

### 2. 🛡️ Tuyệt Đối Bí Mật & Kín Đáo (Không Lộ Thông Tin Ra Màn Hình)
- Khi vòng quay dừng lại:
  - Hộp thoại xuất hiện **chuẩn 100% giao diện Wheel of Names**: Thanh tiêu đề đổi màu theo ô trúng thưởng, dòng chữ **"We have a winner!"**, tên người trúng lớn ở giữa, cùng 2 nút **"Close"** và **"Remove"**.
  - **Không hiển thị bất kỳ thông tin nào về đội, nhóm hay kịch bản ra ngoài màn hình** để người xem thấy mọi thứ hoàn toàn tự nhiên và ngẫu nhiên.
  - Lịch sử trong tab **Results** cũng chỉ ghi tên người trúng thưởng và thời gian.

### 3. 🎯 Chế Độ Thứ Tự Cá Nhân (Tuần Tự)
- Có thể chuyển sang tab **"🎯 Thứ Tự Cá Nhân"** nếu muốn định sẵn thứ tự trúng đơn lẻ (Lượt 1 trúng ai, Lượt 2 trúng ai...).

---

## ⌨️ Phím Tắt Tiện Ích
- **`F1`**: Bật / Tắt Bảng Kịch Bản Chọn Lọc & Ghép Cặp Bí Mật.
- **`Ctrl + Enter`** hoặc **Click chuột vào vòng quay**: Bắt đầu quay vòng.
- **`Esc`**: Đóng nhanh bảng F1 hoặc popup trúng thưởng.
- **`F11`**: Toàn màn hình.
