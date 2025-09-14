# SafeVault Admin Panel

A modern React.js admin dashboard for managing the SafeVault crypto wallet application.

## Features

- **Dark Crypto Theme** - Modern dark UI with neon accents
- **Responsive Design** - Works on desktop, tablet, and mobile
- **User Management** - View, block/unblock users, reset passwords
- **Deposits Management** - Approve/reject deposit requests with image viewing
- **Withdrawals Management** - Approve/reject withdrawal requests
- **Notifications** - System notifications and custom messaging
- **Settings** - Wallet address and admin profile management
- **Real-time Updates** - Live data updates and status changes

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on port 3000

### Installation

1. Clone the repository
2. Navigate to the admin panel directory:

   ```bash
   cd Admin/admin-panel
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy environment variables:

   ```bash
   cp env.example .env
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Credentials

- **Email:** admin@example.com
- **Password:** admin123

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with sidebar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── Dashboard.tsx
│   ├── UsersPage.tsx
│   ├── DepositsPage.tsx
│   ├── WithdrawalsPage.tsx
│   ├── NotificationsPage.tsx
│   └── SettingsPage.tsx
├── services/           # API services
│   └── api.ts         # API client and types
├── theme/             # Theme configuration
│   ├── colors.ts      # Color palette
│   └── index.ts       # MUI theme setup
└── App.tsx            # Main app component
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The admin panel connects to the backend API endpoints:

- `GET /admin/reports/summary` - Dashboard statistics
- `GET /admin/users` - Users list
- `PUT /admin/users/:id/block` - Block user
- `PUT /admin/users/:id/unblock` - Unblock user
- `GET /admin/deposits` - Deposits list
- `PUT /admin/deposit/:id/approve` - Approve deposit
- `PUT /admin/deposit/:id/reject` - Reject deposit
- `GET /admin/withdrawals` - Withdrawals list
- `PUT /admin/withdraw/:id/approve` - Approve withdrawal
- `PUT /admin/withdraw/:id/reject` - Reject withdrawal

## Development Status

- ✅ Project setup and structure
- ✅ Authentication system
- ✅ Layout and navigation
- ✅ Dashboard with statistics
- 🔄 Users management (in progress)
- 🔄 Deposits management (in progress)
- 🔄 Withdrawals management (in progress)
- 🔄 Notifications management (in progress)
- 🔄 Settings page (in progress)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
