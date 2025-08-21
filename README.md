# 📋 VIDEC Task Board

A beautiful, modern task management and project organization app built with React, TypeScript, and Supabase. Features a stunning glassmorphism design, PWA support, and tablet optimization.

![VIDEC Task Board](https://img.shields.io/badge/PWA-Ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![Responsive](https://img.shields.io/badge/Responsive-Tablet%20Optimized-orange)

## ✨ Features

### 🎯 **Core Functionality**
- **Multi-Project Management** - Organize tasks across multiple projects
- **Kanban Board** - Drag & drop task management with customizable columns
- **Real-time Sync** - Changes sync instantly across devices
- **User Authentication** - Secure login with Supabase Auth
- **Data Isolation** - Each user only sees their own projects and tasks

### 📱 **PWA & Mobile**
- **Progressive Web App** - Install on any device
- **Offline Support** - Works without internet connection
- **Tablet Optimized** - Perfect for iPad and Android tablets
- **Touch-Friendly** - Large touch targets and smooth interactions
- **App-like Experience** - Runs in standalone mode

### 🎨 **Design & UX**
- **Glassmorphism UI** - Modern, beautiful design
- **Dark/Light Theme** - Automatic theme switching
- **Responsive Layout** - Works on all screen sizes
- **Smooth Animations** - Polished user experience
- **Accessibility** - Screen reader friendly

### 🔧 **Technical Features**
- **TypeScript** - Type-safe development
- **Real-time Database** - Powered by Supabase
- **Service Worker** - Background sync and caching
- **Security** - Row Level Security (RLS) policies
- **Performance** - Optimized loading and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   cd videc-task-board
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c83b369e-abf9-4a12-bbdd-e5945376423d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
