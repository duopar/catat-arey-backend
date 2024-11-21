## 1. **Authentication Endpoints**

Used to authenticate users.

- ### **POST** `/auth/register`
  - **Description**: Registering new user.
  - **Headers**:
    - `X-API-Key: <api-key>`
  - **Body**:
    ```json
    {
      "username": "string", 
      "password": "string",
      "role": "string (enum: 'owner' or 'employee')",
      "confirmPassword": "string"
    }
    ```

- ### **POST** `/auth/login`
  - **Description**: Authenticate user and create token.
  - **Headers**:
    - `X-API-Key: <api-key>`
  - **Body**:
      ```json
      {
        "username": "string", 
        "password": "string" 
      }
      ```
---

## 2. **User Management Endpoints**
   
Used to manage user data.

- ### **GET** `/users/{userId}`
  - **Description**: Get user details.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`

- ### **PATCH** `/users/{userId}`
  - **Description**: Update user password.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "currentPassword": "string",
      "newPassword": "string",
      "confirmPassword": "string"
    }
    ```

---

## 3. **Product Management Endpoints**

Used to manage product inventory.

- ### **GET** `/products`
  - **Deskripsi**: Get a list of all products.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`

- ### **GET** `/products/{productId}`
  - **Deskripsi**: Get product details by ID.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`

- ### **POST** `/products`
  - **Deskripsi**: Add new product to inventory. **Only users with 'owner' role can add products**.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "name": "string",
      "category": "string",
      "price": "number",
      "stockLevel": "number",
      "restockThreshold": "number"
    }
    ```

- ### **PUT** `/products/{productId}`
  - **Deskripsi**: Update product information. **Only users with 'owner' role can update products**.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`
  - **Body**:
    ```json
    {
      "name": "string (optional)",
      "category": "string (optional)",
      "price": "number (optional)",
      "stockLevel": "number (optional)",
      "restockThreshold": "number (optional)"
    }
    ```

- ### **DELETE** `/products/{productId}`
  - **Deskripsi**: Delete product from inventory. **Only users with 'owner' role can delete products**.
  - **Headers**:
    - `X-API-Key: <api-key>`
    - `Authorization: Bearer <token>`