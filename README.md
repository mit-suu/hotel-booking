# Hotel booking

Dự án quản lý khách sạn gồm 2 phần: Backend (Spring Boot) và Frontend (React).

---

## 📁 Cấu trúc dự án
```
/backend         --> Spring Boot REST API
/frontend        --> React
```

---

### 📦 1. Backend - Spring Boot

**Yêu cầu:**
- Java 17+
- Maven

**Chạy local:**
```bash
cd backend
mvn spring-boot:run
```
- Server mặc định chạy ở: `http://localhost:8080`
---

### 🎨 2. Frontend - React
**Cài đặt và chạy:**

```bash
cd frontend
npm install
npm run dev     # hoặc: npm start
```

- Ứng dụng chạy tại: `http://localhost:3000`

---
```js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
  }
}
```

---

