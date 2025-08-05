# KitVault - A Full-Stack Soccer Jersey E-Commerce Store

KitVault is a complete, full-stack e-commerce web application for a fictional soccer jersey store. It features a clean, modern user interface, secure user authentication, product browsing with advanced filtering, a fully integrated Stripe checkout process, and automated email confirmations.

## Key Features

- **Modern Frontend**: A responsive and beautifully designed user interface built with HTML5, and Tailwind CSS.
- **Dynamic Product Catalog**: Browse all kits, filter by clubs or nations, and use a real-time search to find specific jerseys.
- **User Authentication**: Secure user registration and login system using JWT (JSON Web Tokens).
- **Shopping Cart**: Persistent shopping cart that stores items in `localStorage`.
- **Secure Payments**: Full integration with the Stripe API for a secure and seamless checkout experience.
- **Order History**: Logged-in users can view a detailed history of their past orders.
- **Automated Email Confirmations**: Uses the Resend API to send transactional order confirmation emails upon successful payment.
- **RESTful Backend API**: A robust backend built with Node.js, Express, and PostgreSQL to manage products, users, and orders.

## Technology Stack

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Payments**: Stripe
- **Email**: Resend

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later recommended)
- PostgreSQL
- A code editor like Visual Studio Code with the Live Server extension.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ChakradhwajB/Store.git
    cd Store
    ```

2.  **Setup the Backend:**

    - Navigate to the backend directory:
      ```bash
      cd backend
      ```
    - Install NPM packages:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `backend` directory. See the [Configuration](#configuration) section for details on the required variables.

3.  **Setup the Database:**

    - Make sure your PostgreSQL server is running.
    - Create a new database (e.g., `kitvault_db`).
    - Connect to your new database and run the SQL commands found in a schema file (e.g., `backend/database.sql`) to create the necessary tables (`users`, `products`, `orders`, `order_items`).

4.  **Run the Application:**
    - **Start the backend server:**
      ```bash
      npm start
      ```
      The server will be running on `http://localhost:3000`.
    - **Run the Frontend:**
      - Open the root `Store` folder in VS Code.
      - Right-click on `index.html` and select "Open with Live Server".
      - The website will open in your browser, typically at `http://127.0.0.1:5500`.

## Configuration

### `.env` File

Create a `.env` file in the `/backend` directory with the following content, replacing the placeholder values with your actual credentials.

```env
# PostgreSQL Database Connection
DB_USER=your_postgres_user
DB_HOST=localhost
DB_DATABASE=kitvault_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend API Key
RESEND_API_KEY=re_...
```

### Obtaining Credentials

#### JSON Web Token (JWT) Secret

The `JWT_SECRET` is a secret key used to sign and verify the JSON Web Tokens for user authentication. It should be a long, complex, and random string to ensure your application's security. You can generate a strong secret using a command-line tool like OpenSSL:

```bash
openssl rand -hex 32
```

Copy the output and paste it as the value for `JWT_SECRET` in your `.env` file.

#### Resend API Key

1.  Go to the [Resend Dashboard](https://resend.com/login).
2.  Navigate to the **API Keys** section from the side menu.
3.  Click **+ Create API Key**.
4.  Give your key a name (e.g., "KitVault Dev") and set the permissions to **Full Access**.
5.  Copy the generated API key and use it for the `RESEND_API_KEY` value.

#### Stripe Secret Key & Webhook Secret

1.  **Secret Key**:

    - Go to the [Stripe Dashboard](https://dashboard.stripe.com/login).
    - Navigate to **Developers > API keys**.
    - Your "Secret key" will be listed under **Standard keys**. Copy this value for `STRIPE_SECRET_KEY`.

2.  **Webhook Secret**:
    - While on the **Developers** page, click on the **Webhooks** tab.
    - Click **+ Add an endpoint**.
    - For the **Endpoint URL**, enter `http://localhost:3000/api/stripe/webhook`.
    - Click **+ Select events** and choose `checkout.session.completed`.
    - After creating the endpoint, you will be redirected to its details page. Under **Signing secret**, click **Reveal** and copy the value for `STRIPE_WEBHOOK_SECRET`.
