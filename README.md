# 🚀 Quick Drop

**Quick Drop** is a modern, high-performance P2P data transfer tool that allows users to share text and files instantly between devices (PC and Mobile) using a secure 4-digit code pairing system. Built with a premium "Midnight Slate" UI and cutting-edge web technologies.

---

## ✨ Features

- **Instant P2P Transfer**: Share files and text in real-time using WebSockets.
- **Secure Device Pairing**: Connect devices effortlessly with a simple 4-digit code.
- **Premium UI/UX**: Modern "Midnight Slate" theme with glassmorphism, gradients, and a full-screen application layout.
- **Optimistic Updates**: Immediate UI feedback for sent data, ensuring a snappy user experience.
- **File Previews**: Instant visual feedback for images and distinct icons for other file types.
- **Encrypted Transmission**: Secure data handling for your privacy.
- **Responsive Design**: Fully optimized for both desktop and mobile browsers.

---

## �️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern CSS engine)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & Radix UI
- **Real-time**: [Socket.io](https://socket.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Optimistic UI
- **Form/Data Validation**: Zod
- **API Client**: Axios & TanStack Query

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/RashedulHaqueRasel1/quick-chat.git
cd quick-chat
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4️⃣ Run development server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts

- `npm run dev`: Start development server with Webpack.
- `npm run build`: Create a production-ready build.
- `npm run start`: Run the production build.
- `npm run lint`: Execute ESLint for code quality.

---

## 🧑‍💻 Author

**Rashedul Haque Rasel**

- 📧 [rashedulhaquerasel1@gmail.com](mailto:rashedulhaquerasel1@gmail.com)
- 🌐 [Portfolio](https://rashedul-haque-rasel.vercel.app)
- 🐙 [GitHub](https://github.com/RashedulHaqueRasel1)

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS.
