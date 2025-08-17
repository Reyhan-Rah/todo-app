# 🚀 Todo Application

A modern, feature-rich todo application built with **Next.js 15**, **React 19**, and **TypeScript**. This application demonstrates best practices in modern web development with comprehensive testing, drag-and-drop functionality, and a clean, maintainable architecture.

## ✨ Features

### 🎯 Core Functionality

- **View Todos**: Display a list of todos fetched from DummyJSON API
- **Add Todo**: Create new todos with Zod validation
- **Delete Todo**: Remove todos with confirmation modal
- **Toggle Status**: Mark todos as complete/incomplete
- **Drag & Drop**: Reorder todos using intuitive drag-and-drop interface

### 🎨 User Experience

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-time Updates**: Immediate UI feedback for all actions
- **Accessibility**: Full keyboard navigation and ARIA support
- **Toast Notifications**: User-friendly feedback for all operations
- **Loading States**: Skeleton screens and loading indicators

### 🔧 Technical Features

- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient server state management and caching
- **Zod Validation**: Runtime validation for form inputs
- **Component Testing**: Comprehensive test coverage with Jest & React Testing Library
- **Modern Architecture**: Clean separation of concerns and reusable components

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── CreateTodoForm/    # Todo creation form
│   ├── TodoItem/          # Individual todo display
│   ├── TodoList/          # Main todo list container
│   ├── SortableTodoList/  # Drag-and-drop todo list
│   ├── SortableTodoItem/  # Draggable todo item
│   ├── DragOverlay/       # Drag operation overlay
│   ├── TodoFilters/       # Search and filter controls
│   ├── DeleteConfirmModal/ # Deletion confirmation
│   ├── LoadingSkeleton/   # Loading state components
│   ├── Toast/             # Toast notification component
│   └── ToastContainer/    # Toast management
├── hooks/                 # Custom React hooks
│   ├── useTodos.ts        # Todo data management
│   └── useToast.ts        # Toast state management
├── services/              # API and external services
│   ├── api.ts             # API service layer
│   └── api.test.tsx       # API integration tests
└── lib/                   # Utility libraries
    ├── axios.ts           # HTTP client configuration
    └── utils.ts           # Helper functions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.17 or later
- **npm**: 9.0 or later

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Reyhan-Rah/todo-app.git
   cd todo-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

This application includes a comprehensive test suite with **146 tests** covering all core functionality.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Test Coverage

- **CreateTodoForm**: Form validation, submission, and error handling
- **TodoItem**: Individual todo interactions and state management
- **TodoList**: Main application logic and data flow
- **Sortable Components**: Drag-and-drop functionality
- **API Integration**: Service layer and data fetching
- **Accessibility**: Keyboard navigation and ARIA compliance

### Testing Stack

- **Jest**: Primary testing framework
- **React Testing Library**: Component testing and user behavior validation
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## 🏗️ Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npx prettier --write .
```

## 🛠️ Technology Stack

### Frontend Framework

- **Next.js 15.4.4**: React framework with App Router
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5.x**: Full type safety

### Styling & UI

- **TailwindCSS 4.1.11**: Utility-first CSS framework
- **Modern CSS**: CSS Grid, Flexbox, and custom properties

### State Management

- **React Query/TanStack Query**: Server state management
- **React Hooks**: Local component state

### Development Tools

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **React Testing Library**: Component testing

### External Services

- **DummyJSON API**: Todo data source
- **Axios**: HTTP client for API calls

## 📱 Features in Detail

### Todo Management

- **Create**: Add new todos with real-time validation
- **Read**: Fetch and display todos with loading states
- **Update**: Toggle completion status with immediate feedback
- **Delete**: Remove todos with confirmation dialog

### User Experience

- **Responsive Design**: Works seamlessly on all device sizes
- **Keyboard Navigation**: Full accessibility support
- **Drag & Drop**: Intuitive todo reordering
- **Search & Filter**: Find and organize todos efficiently

### Data Persistence

- **API Integration**: Real-time data synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Graceful failure management
- **Caching**: Efficient data retrieval and storage

## 🔒 Security & Best Practices

- **Input Validation**: Zod schema validation for all user inputs
- **Type Safety**: Full TypeScript coverage preventing runtime errors
- **Error Boundaries**: Graceful error handling throughout the application
- **Accessibility**: WCAG compliant with proper ARIA attributes

## 🚀 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Efficient data caching with React Query

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Vercel**: For the deployment platform
- **DummyJSON**: For the API service
- **React Testing Library**: For the testing utilities

---

**Built with ❤️ using Next.js, React, and TypeScript**
