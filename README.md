# Bottle Water Delivery - Frontend

Project UTS Rekayasa Perangkat Lunak - Frontend Application for Bottle Water Delivery System

## Overview

This is the frontend application for the Bottle Water Delivery system, a comprehensive platform for managing bottled water orders, deliveries, and customer accounts. The application is built using React and provides a user-friendly interface for customers and administrators to interact with the system.

## Features

- **User Authentication**
  - Registration and login functionality
  - Role-based access control (customer, admin, organization)
  - Secure authentication using JWT

- **Dashboard**
  - Overview of available products
  - Quick access to orders and account management

- **User Profiles**
  - Customer profile management
  - Organization profile management for business customers

- **Order Management**
  - Browse available water bottle products
  - Add products to cart
  - Place and track orders
  - View order history

- **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Checkout process

- **Responsive Design**
  - Mobile-friendly interface
  - Accessible on various devices

## Technology Stack

- **React** (v18.2.0) - Frontend library
- **React Router DOM** (v6.20.0) - For navigation and routing
- **Axios** (v1.6.2) - HTTP client for API requests
- **React Toastify** (v11.0.5) - For notifications
- **Jest & Testing Library** - For testing

## Project Structure

```
frontend/
├── public/             # Static files
├── src/                # Source code
│   ├── components/     # React components
│   ├── services/       # API services
│   ├── style/          # CSS styles
│   ├── app.js          # Main application component
│   └── index.js        # Entry point
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```
5. The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from create-react-app

## Dependencies

- @testing-library/jest-dom: ^5.17.0
- @testing-library/react: ^13.4.0
- @testing-library/user-event: ^13.5.0
- axios: ^1.6.2
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0
- react-scripts: 5.0.1
- react-toastify: ^11.0.5
- web-vitals: ^2.1.4

## License

This project is licensed under the terms included in the LICENSE file.
