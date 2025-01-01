# A. Authentication Endpoints

Endpoints used for user authentication, including registration, login, and token refresh.

---

## 1. POST `/auth/register`

Registers a new user in the system.

### Request
- **Headers**:
  - `X-API-Key: <api-key>` (required)
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "role": "string (enum: 'owner' or 'employee')",
    "confirmPassword": "string"
  }
  ```

### Responses
- **`201 Created`**  
  Registration successful.
  - **Example**:
    ```json
    {
      "status": "success",
      "message": "Registration successful.",
      "data": {
        "userId": "my-userId"
      }
    }
    ```

- **`400 Bad Request`**  
  Occurs when required fields are not valid or missing.
  - **Reason**: Missing field.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "\"password\" is required",
      "data": null
    }
    ```
  - **Reason**: Invalid `password`.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "\"password\" must be between 8-30 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
      "data": null
    }
    ```

- **`409 Conflict`**  
  Occurs when the `username` is already registered.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Username already exists.",
      "data": null
    }
    ```

- **`500 Internal Server Error`**  
  Occurs when the server encounters an unexpected error.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Registration failed due to server error.",
      "data": null
    }
    ```

---

## 2. POST `/auth/login`

Authenticates a user and generates access and refresh tokens.

### Request
- **Headers**:
  - `X-API-Key: <api-key>` (required)
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Responses
- **`200 OK`**  
  Login successful.
  - **Example**:
    ```json
    {
      "status": "success",
      "message": "Login successful.",
      "data": {
        "userId": "my-userId",
        "username": "my-username",
        "accessToken": "my-access-token",
        "refreshToken": "my-refresh-token"
      }
    }
    ```

- **`400 Bad Request`**  
  Occurs when required fields are not valid or missing.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "\"password\" is required",
      "data": null
    }
    ```

- **`401 Unauthorized`**  
  Occurs when the `username` is not found or the `password` is invalid.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Invalid \"username\" or \"password\".",
      "data": null
    }
    ```

- **`500 Internal Server Error`**  
  Occurs when the server encounters an unexpected error.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Login failed due to server error.",
      "data": null
    }
    ```

---

## 3. POST `/auth/refresh`

Generates a new access token using a valid refresh token.

### Request
- **Headers**:
  - `X-API-Key: <api-key>` (required)
  - `Authorization: Bearer <refresh-token>` (required)

### Responses
- **`200 OK`**  
  Refresh successful.
  - **Example**:
    ```json
    {
      "status": "success",
      "message": "Successfully retrieved access token.",
      "data": {
        "accessToken": "new-access-token"
      }
    }
    ```

- **`401 Unauthorized`**  
  Occurs when the provided refresh token is invalid or expired.
  - **Reason**: Missing refresh token.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Refresh token is missing in the \"authorization\" header.",
      "data": null
    }
    ```
  - **Reason**: Invalid refresh token format.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Invalid refresh token format. Expected \"Bearer <your-refresh-token>\".",
      "data": null
    }
    ```
  - **Reason**: Expired refresh token.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Refresh token has expired.",
      "data": null
    }
    ```
  - **Reason**: Invalid refresh token.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "Refresh token is invalid.",
      "data": null
    }
    ```

---
  
# B. User Management Endpoints
   
Endpoints used to manage user data, including retrieving user details and updating a user's password.

## 1. GET `/users/{userId}`

Retrieve the details of a specific user by their `userId`.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`

### Responses
- **`200 OK`**  
  Retrieve successful.
  - **Example**:
    ```json
    {
      "status": "success",
      "message": "User data retrieved successfully.",
      "data": {
        "userId": "string",
        "username": "string",
        "role": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
    
- **`404 Not Found`**  
  User with the provided `userId` does not exist.
  - **Example**:
    ```json
    {
      "status": "error",
      "message": "No user found with the provided ID.",
      "data": null
    }
    ```

## 2. PATCH `/users/{userId}`

Update the `password` of the specified user.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`
- **Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmPassword": "string"
  }
  ```

### Responses
- **`200 OK`**  
  Password update is successful.
  - **Example**:
    ```json
    {
      "status": "success",
      "message": "Password updated successfully.",
      "data": null
    }
    ```

- **`400 Bad Request`**  
  Invalid `password`.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "\"newPassword\" must be between 8-30 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
    "data": null
  }
  ```

---

# C. Product Management Endpoints

Endpoints used to manage product inventory.

## 1. GET `/products`  

Retrieve a list of all products. Supports optional filtering by name.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`
- **Query Parameters**:
  - `name` *(optional)*: A string to filter products by name. Case-insensitive.

### Responses
- **`200 OK`**  
  Successfully retrieved the list of products.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "All products retrieved successfully.",
    "data": [
      {
        "productId": "string",
        "name": "string",
        "category": "string",
        "price": "number",
        "stockLevel": "number",
        "restockThreshold": "number",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
  }
  ```
- **`404 Not Found`**  
  No products were found matching the criteria.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "No products found.",
    "data": null
  }
  ```
- **`400 Bad Request`**  
  Invalid query parameter provided.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Invalid query parameter: \"<parameter-name>\".",
    "data": null
  }
  ```
- **`500 Internal Server Error`**  
  Server encountered an error while processing the request.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to retrieve all products due to server error.",
    "data": null
  }
  ```
        
## 2. GET `/products/{productId}`

Retrieves detailed information about a specific product by its ID, including daily stock activity metrics (`stockInToday` and `stockOutToday`).

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`

### Responses
- **`200 OK`**  
  Successfully retrieved the product.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "Product retrieved successfully.",
    "data": {
      "productId": "string",
      "name": "string",
      "category": "string",
      "price": "number",
      "stockLevel": "number",
      "restockThreshold": "number",
      "stockInToday": "number",
      "stockOutToday": "number"
    }
  }
  ```
  - **Explanation**:
    - `stockInToday`: The total number of items added to stock for the product today.
    - `stockOutToday`: The total number of items removed from stock for the product today.

- **`404 Not Found`**  
  No products were found matching the `productId`.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "No product found with the provided ID.",
    "data": null
  }
  ```

- **`500 Internal Server Error`**  
  Server encountered an error while processing the request.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to retrieve the product due to server error.",
    "data": null
  }
  ```

## 3. POST `/products`

Adds a new product to the inventory. **Only users with the 'owner' role are authorized to add products**.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`
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

### Responses
- **`201 Created`**  
  Product successfully created.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "Product created successfully.",
    "data": {
      "productId": "12345"
    }
  }
  ```

- **`400 Bad Request`**  
  Invalid request body.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "\"price\" must be a number",
    "data": null
  }
  ```

- **`401 Unauthorized`**  
  User does not have the required role.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Only users with the 'owner' role are authorized to add, update, or delete products.",
    "data": null
  }
  ```

- **`409 Conflict`**  
  A product with the same name already exists.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Product already exists.",
    "data": null
  }
  ```

- **`500 Internal Server Error`**  
  Server error occurred while creating the product.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to create product due to server error.",
    "data": null
  }
  ```

## 4. PUT `/products/{productId}`

Updates the details of a specific product in the inventory. **Only users with the 'owner' role are authorized to update products**.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`
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

### Responses
- **`200 OK`**  
  Product updated successfully.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "Product updated successfully.",
    "data": {
      "productId": "12345"
    }
  }
  ```

- **`400 Bad Request`**  
  Invalid request body or properties.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "\"<property-name>\" is required.",
    "data": null
  }
  ```

- **`401 Unauthorized`**  
  User is not authorized to perform this action.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Only users with the 'owner' role are authorized to add, update, or delete products.",
    "data": null
  }
  ```

- **`404 Not Found`**  
  Product with the specified ID was not found.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "No product found with the provided ID.",
    "data": null
  }
  ```

- **`409 Conflict`**  
  A product with the same name already exists.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Product already exists.",
    "data": null
  }
  ```

- **`500 Internal Server Error`**  
  Server error occurred while updating the product.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to update product due to server error.",
    "data": null
  }
  ```

## 5. DELETE `/products/{productId}`

Deletes a product from the inventory by its unique identifier. **Only users with the 'owner' role are authorized to delete products**.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`

### Responses
- **`200 OK`**  
  Product deleted successfully.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "Product deleted successfully.",
    "data": null
  }
  ```

- **`401 Unauthorized`**  
  User is not authorized to perform this action.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Only users with the 'owner' role are authorized to add, update, or delete products.",
    "data": null
  }
  ```

- **`404 Not Found`**  
  Product with the specified ID was not found.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "No product found with the provided ID.",
    "data": null
  }
  ```

- **`500 Internal Server Error`**  
  Server error occurred while deleting the product.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to delete product due to server error.",
    "data": null
  }
  ```

## 6. POST `/products/{productId}/logs`

Creates a log entry for a specific product identified by `productId`.

### Request
- **Headers**:
  - `X-API-Key: <api-key>`
  - `Authorization: Bearer <access-token>`
- **Body**:
  ```json
  {
    "stockIn": "number",
    "stockOut": "number"
  }
  ```

### Responses
- **`200 OK`**  
  Product logged successfully.
  - **Example**:
  ```json
  {
    "status": "success",
    "message": "Product logged successfully.",
    "data": {
      "productId": "12345"
    }
  }
  ```

- **`400 Bad Request`**  
  Invalid request body or properties.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "\"<property-name>\" is required.",
    "data": null
  }
  ```

  Attempting to log outgoing items (`stockOut`) exceeding available stock (`stockLevel`).
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "\"stockOut\" must be less than or equal to the current product's \"stockLevel\".",
    "data": null
  }
  ```

  Attempting to log empty changes.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "\"stockIn\" and \"stockOut\" cannot both be 0 at the same time.",
    "data": null
  }
  ```

- **`404 Not Found`**  
  Product with the specified ID was not found.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "No product found with the provided ID.",
    "data": null
  }
  ```

- **`500 Internal Server Error`**  
  Server error occurred while logging the product.
  - **Example**:
  ```json
  {
    "status": "error",
    "message": "Failed to log product due to server error.",
    "data": null
  }
  ```
