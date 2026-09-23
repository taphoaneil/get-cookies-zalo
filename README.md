# Get Cookies & IMEI Zalo

Extension Chrome dùng để lấy Cookies và IMEI từ phiên đăng nhập Zalo Web tại `https://chat.zalo.me`.

Mục đích sử dụng cá nhân của tôi là lấy thông tin đăng nhập cần thiết để dùng với mã nguồn [Its-VrxxDev/zlapi](https://github.com/Its-VrxxDev/zlapi).

## Tính năng

- Tự động lấy Cookies từ `chat.zalo.me` sau khi Zalo Web tải xong.
- Tự động bắt IMEI từ request đăng nhập của Zalo Web.
- Lưu dữ liệu tạm trong `chrome.storage.local`.
- Hiển thị IMEI và Cookies trong popup của extension.
- Có nút copy nhanh IMEI và Cookies.
- Có nút làm mới dữ liệu, tự mở hoặc reload `https://chat.zalo.me` khi cần.

## Cài đặt extension

1. Tải hoặc clone mã nguồn này về máy.

   ```bash
   git clone https://github.com/taphoaneil/get-cookies-zalo.git
   ```

2. Mở Chrome và truy cập:

   ```text
   chrome://extensions/
   ```

3. Bật **Developer mode** ở góc phải phía trên.

4. Chọn **Load unpacked**.

5. Chọn thư mục chứa mã nguồn extension này, tức thư mục có file `manifest.json`.

6. Sau khi cài xong, Chrome sẽ hiển thị extension **Get Cookies & IMEI Zalo** trong danh sách extension.

## Cách sử dụng

1. Đăng nhập Zalo Web tại:

   ```text
   https://chat.zalo.me
   ```

2. Chờ trang Zalo Web tải xong. Extension sẽ tự động lấy Cookies.

3. Khi Zalo Web gọi API có tham số `imei`, extension sẽ tự động bắt và lưu IMEI.

4. Bấm biểu tượng extension **Get Cookies & IMEI Zalo** trên thanh công cụ Chrome.

5. Bấm **Copy** ở ô IMEI hoặc Cookies để sao chép dữ liệu.

6. Nếu chưa thấy dữ liệu, bấm **Làm mới dữ liệu** để extension mở/reload `chat.zalo.me` và lấy lại thông tin.

## Dùng với zlapi

Sau khi lấy được Cookies và IMEI, sử dụng các giá trị này theo hướng dẫn cấu hình/đăng nhập của repository [Its-VrxxDev/zlapi](https://github.com/Its-VrxxDev/zlapi).

Thông thường, dữ liệu cần dùng gồm:

- `imei`: chuỗi IMEI lấy từ request Zalo Web.
- `cookies`: chuỗi JSON chứa cookies của phiên đăng nhập `chat.zalo.me`.

Hãy đọc tài liệu của `zlapi` để biết chính xác vị trí cần truyền các giá trị này trong mã nguồn.

## Quyền extension sử dụng

Extension cần một số quyền sau để hoạt động:

- `cookies`: đọc cookies của Zalo Web.
- `webRequest`: lắng nghe request để lấy IMEI.
- `storage`: lưu tạm IMEI và Cookies trong trình duyệt.
- `notifications`: hiển thị thông báo khi lấy được dữ liệu.
- `host_permissions: <all_urls>`: cho phép extension quan sát request/cookies cần thiết. Extension hiện chỉ xử lý dữ liệu liên quan đến `chat.zalo.me` và request chứa `/api/login/getServerInfo`.

## Lưu ý bảo mật

Cookies và IMEI là thông tin nhạy cảm, có thể liên quan trực tiếp đến phiên đăng nhập Zalo của bạn.

- Chỉ sử dụng extension này cho tài khoản của chính bạn.
- Không chia sẻ Cookies/IMEI cho người khác.
- Không commit hoặc đưa Cookies/IMEI lên GitHub.
- Không dùng dữ liệu này cho mục đích truy cập trái phép, spam, tự động hóa gây hại hoặc vi phạm điều khoản dịch vụ của Zalo.
- Nếu nghi ngờ dữ liệu bị lộ, hãy đăng xuất Zalo Web và đăng nhập lại để làm mới phiên.

## Gỡ cài đặt

1. Mở:

   ```text
   chrome://extensions/
   ```

2. Tìm extension **Get Cookies & IMEI Zalo**.

3. Chọn **Remove** để gỡ extension khỏi Chrome.

## License

Xem file [LICENSE](./LICENSE).
