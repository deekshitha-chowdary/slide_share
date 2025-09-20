# Slide Share

Slide Share is a modern web application for uploading, sharing, and viewing presentations online. It is designed to make it easy for users to upload their slide decks, view them interactively, and share them with others via a simple link or embed code.

## Features

- **Upload Presentations:** Users can upload their slide decks in supported formats (e.g., PDF, Google Slides, etc.).
- **Interactive Viewer:** Presentations can be viewed directly in the browser with smooth navigation between slides.
- **Embed Anywhere:** Easily embed presentations in other websites or blogs using the provided embed code.
- **Admin Tools:** Includes admin features for cleaning up old or unused presentations.
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Supabase Integration:** Uses Supabase for backend services such as authentication, storage, and database.
- **Modern UI:** Built with React, TypeScript, and Tailwind CSS for a fast and beautiful user experience.

## How It Works

1. **Upload:** Users upload their presentation files through a simple form.
2. **Processing:** The backend processes and stores the files securely using Supabase.
3. **Viewing:** Presentations are rendered in an interactive viewer, allowing users to navigate slides, zoom, and more.
4. **Sharing:** Each presentation gets a unique link and an embed code for easy sharing.
5. **Admin Cleanup:** Admins can remove outdated or inappropriate content to keep the platform clean.

## Why Slide Share is Helpful

- **Easy Sharing:** No need to email large files or require special software—just share a link.
- **Accessibility:** Presentations are viewable on any device with a web browser.
- **Collaboration:** Teams and educators can quickly distribute and present materials.
- **Embedding:** Integrate presentations into blogs, documentation, or learning platforms.
- **Open Source:** The project is open for contributions and can be self-hosted or extended for custom needs.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend/Storage:** Supabase
- **Other:** ESLint, PostCSS, modern UI component libraries

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/deekshitha-chowdary/slide_share.git
   cd slide_share
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
3. Set up Supabase (see `supabase/` directory for configuration).
4. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```
5. Open your browser at `http://localhost:5173` (or the port shown in your terminal).

## Contributing

Contributions are welcome! Please open issues or pull requests for new features, bug fixes, or suggestions.

## License

This project is licensed under the MIT License.

## Developer

- **Name:** Deekshitha Chowdary
- **GitHub:** [deekshitha-chowdary](https://github.com/deekshitha-chowdary)
- **Email:** deekshithachowdary@example.com

For any questions, suggestions, or collaboration opportunities, feel free to reach out!
