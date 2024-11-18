### 1. **Authentication Endpoints**
   Digunakan untuk registrasi dan otentikasi pengguna.

   - **POST** `/auth/register`
     - **Deskripsi**: Mendaftarkan pengguna baru.
     - **Body**: `{ "name": "string", "password": "string", "confirmPassword": "string"}`

   - **POST** `/auth/login`
     - **Deskripsi**: Mengotentikasi pengguna dan menghasilkan token.
     - **Body**: `{ "email": "string", "password": "string" }`

---

### 2. **User Management Endpoints**
   Digunakan untuk mengelola data pengguna.

   - **GET** `/users/{userId}`
     - **Deskripsi**: Mendapatkan detail pengguna.
     - **Headers**: `Authorization: Bearer <token>`

   - **PUT** `/users/{userId}`
     - **Deskripsi**: Memperbarui informasi pengguna.
     - **Headers**: `Authorization: Bearer <token>`
     - **Body**: `{ "name": "string", "email": "string", "settings": { "notificationEnabled": "boolean" } }`

---

### 3. **Product Management Endpoints**
   Digunakan untuk mengelola inventaris produk.

   - **GET** `/products`
     - **Deskripsi**: Mendapatkan daftar semua produk.
     - **Headers**: `Authorization: Bearer <token>`

   - **GET** `/products/{productId}`
     - **Deskripsi**: Mendapatkan detail produk berdasarkan ID.
     - **Headers**: `Authorization: Bearer <token>`

   - **POST** `/products`
     - **Deskripsi**: Menambahkan produk baru ke dalam inventaris.
     - **Headers**: `Authorization: Bearer <token>`
     - **Body**: `{ "name": "string", "sku": "string", "category": "string", "price": "number", "stockLevel": "number", "reorderThreshold": "number", "reorderAmount": "number" }`

   - **PUT** `/products/{productId}`
     - **Deskripsi**: Memperbarui informasi produk.
     - **Headers**: `Authorization: Bearer <token>`
     - **Body**: `{ "name": "string", "price": "number", "stockLevel": "number", "reorderThreshold": "number", "reorderAmount": "number" }`

   - **DELETE** `/products/{productId}`
     - **Deskripsi**: Menghapus produk dari inventaris.
     - **Headers**: `Authorization: Bearer <token>`