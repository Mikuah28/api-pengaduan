# 📋 API Laporan Pengaduan Masyarakat

REST API untuk sistem laporan pengaduan masyarakat. Dibangun dengan **ElysiaJS**, **Prisma ORM**, dan **PostgreSQL**. Runtime: **Bun**.

---

## 🛠 Tech Stack

| Teknologi | Versi |
|-----------|-------|
| Runtime   | Bun   |
| Framework | ElysiaJS ^1.1 |
| ORM       | Prisma ^5.22 |
| Database  | PostgreSQL |
| Auth      | JWT (@elysiajs/jwt) |
| Hashing   | bcryptjs |

---

## 🚀 Cara Menjalankan

### 1. Install dependensi
```bash
bun install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Edit `.env` dan isi `DATABASE_URL` dengan koneksi PostgreSQL kamu:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/db_laporan_pengaduan?schema=public"
JWT_SECRET="ganti_dengan_secret_yang_kuat"
PORT=5000
```

### 3. Migrasi database
```bash
# Push schema ke database (development)
bun db:push

# Atau pakai migrate (production)
bun db:migrate
```

### 4. Generate Prisma Client
```bash
bun db:generate
```

### 5. Seed data awal (opsional)
```bash
bun db:seed
```
Ini akan membuat:
- Admin: `admin@laporan.com` / `admin123`
- User: `user@laporan.com` / `user123`
- 5 kategori default

### 6. Jalankan server
```bash
# Development (hot reload)
bun dev

# Production
bun start
```

Server berjalan di: `http://localhost:5000`

---

## 📁 Struktur Project

```
laporan-pengaduan-api/
├── prisma/
│   ├── schema.prisma       # Schema database
│   └── seed.js             # Data awal
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── kategoriController.js
│   │   ├── laporanController.js
│   │   ├── komentarController.js
│   │   └── balasKomentarController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── lib/
│   │   └── prisma.js
│   └── index.js            # Entry point
├── uploads/                # Folder gambar laporan
├── .env.example
├── package.json
└── README.md
```

---

## 🔌 Endpoint API

### Auth
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/login` | Login user | ❌ |
| POST | `/api/register` | Daftar user baru | ❌ |

**Login request:**
```json
{
  "email": "admin@laporan.com",
  "password": "admin123"
}
```

**Login response:**
```json
{
  "message": "Success!",
  "token": "eyJhbGciOiJIUzI1...",
  "role": "admin"
}
```

### Users
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Semua user | ✅ |
| GET | `/api/users/:id` | User by ID | ✅ |
| POST | `/api/users` | Tambah user | ✅ |
| PUT | `/api/users/:id` | Update user | ✅ |
| DELETE | `/api/users/:id` | Hapus user | ✅ |

### Kategori
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/kategori` | Semua kategori | ❌ |
| POST | `/api/kategori` | Tambah kategori | ✅ |
| DELETE | `/api/kategori/:id` | Hapus kategori | ✅ |

### Laporan
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/laporan` | Semua laporan | ✅ |
| GET | `/api/laporan/:id` | Laporan by ID | ✅ |
| POST | `/api/laporan` | Buat laporan (+ upload gambar) | ✅ |
| PUT | `/api/laporan/edit/:id` | Update laporan lengkap | ✅ |
| PUT | `/api/laporan/:id` | Update status saja | ✅ |
| DELETE | `/api/laporan/:id` | Hapus laporan | ✅ |

**Buat laporan** menggunakan `multipart/form-data`:
```
judul       : string
deskripsi   : string
lokasi      : string
kategori_id : number
gambar      : file (jpg/png)
```

**Update status:**
```json
{ "status": "diproses" }
```
Status yang tersedia: `menunggu`, `diproses`, `selesai`, `ditolak`

### Komentar
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/komentar` | Semua komentar | ✅ |
| POST | `/api/komentar` | Tambah komentar | ✅ |
| DELETE | `/api/komentar/:id` | Hapus komentar | ✅ |

**Tambah komentar:**
```json
{
  "id_laporan": 1,
  "isi_komentar": "Laporan ini sangat penting untuk segera ditindak."
}
```

### Balas Komentar
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/balasKomentar` | Semua balasan | ✅ |
| POST | `/api/balasKomentar` | Tambah balasan | ✅ |
| DELETE | `/api/balasKomentar/:id` | Hapus balasan | ✅ |

---

## 🔒 Cara Menggunakan Auth

Tambahkan header di setiap request yang membutuhkan autentikasi:
```
Authorization: Bearer <token_dari_login>
```

---

## 🖼 Akses Gambar

Gambar yang diupload bisa diakses di:
```
http://localhost:5000/gambar/<nama_file>
```
