# Zuvomo React Native Developer Coding Task — Posts Explorer

A clean, modern, and production-grade mobile application built with **React Native**, **Expo**, **TypeScript**, and **React Navigation Native Stack** for the **Zuvomo React Native Developer Assessment**.

---

## 📱 Project Overview

The application is an interactive Posts Explorer that consumes the public JSONPlaceholder REST API. It allows users to browse a collection of posts, view short previews, perform pull-to-refresh syncs, inspect detailed information for any selected post, and navigate smoothly between screens with full type safety and robust error handling.

---

## ✨ Features

### 1. Posts Explorer (`HomeScreen`)
- **API Integration**: Fetches list of posts asynchronously from `https://jsonplaceholder.typicode.com/posts`.
- **Performant Rendering**: Uses `FlatList` with memoized item renderers, item separators, and stable key extraction.
- **Card Design**: Displays post ID badge, author ID, post title, and a two-line body preview.
- **Pull-to-Refresh**: Integrated with `RefreshControl`. Preserves existing loaded posts if a refresh error occurs, showing a dismissible error banner rather than wiping out the user's data.
- **Initial States**:
  - Full-screen `ActivityIndicator` during initial load.
  - User-friendly error message with a **Retry** action button on failure.
  - Clean empty-state handling if the API returns an empty list.
- **Smooth Navigation**: Tapping any card navigates to the `DetailScreen` with typed route parameters.

### 2. Post Details (`DetailScreen`)
- **Detail Retrieval**: Fetches the selected post directly using `getPostById(id)` from `https://jsonplaceholder.typicode.com/posts/{id}`.
- **Complete Information Display**: Displays full unabridged title, full unabridged body, post ID badge, author/user ID, and endpoint metadata.
- **Route Validation**: Validates `postId` route parameters and gracefully displays an invalid ID screen if an invalid or missing parameter is provided.
- **Asynchronous Lifecycle Cleanup**: Uses `AbortController` and mounted references to cancel in-flight requests and prevent unmounted React state update warnings.
- **Back Navigation**: Includes an in-screen "← Back to Posts" action button as well as the native navigation stack back button.
- **Error & Loading States**: Displays an activity indicator during detail fetch and a dedicated error card with **Retry** and **Go Back** actions on failure.

### 3. Navigation Architecture
- Uses **React Navigation Native Stack** (`@react-navigation/native-stack`).
- `App.tsx` serves as the application entry point, wrapping the root navigator with `SafeAreaProvider` and `NavigationContainer`.
- `src/app/layout.tsx` exports the strongly typed native stack navigator configuration.
- Navigation parameters are typed with `RootStackParamList` (`Home: undefined`, `Details: { postId: number }`).

### 4. API & Error Handling Service
- `src/services/api.ts` isolates all network logic away from UI components.
- Custom `ApiError` class capturing HTTP status codes and distinguishing network failures from server errors.
- Runtime response schema validation guards against malformed responses.
- Supports `AbortSignal` for request cancellation on screen unmount.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native (0.86+)** | Mobile UI framework |
| **Expo (SDK 57)** | Developer platform, tooling, and runtime |
| **TypeScript (v6+)** | Static typing and interfaces |
| **React Navigation Native Stack (v7)** | Native screen transitions and header management |
| **Fetch API** | Public HTTP network requests |
| **FlatList & RefreshControl** | High-performance list virtualization and pull-to-refresh |
| **React Hooks** | `useState`, `useEffect`, `useCallback`, `useRef` |

---

## 📁 Required Folder Structure

The project strictly follows the requested architecture:

```text
ZuvomoApp/
├── src/
│   ├── app/
│   │   ├── index.tsx            # Main application entry point (NavigationContainer & RootNavigator)
│   │   └── layout.tsx           # Typed Native Stack Navigator configuration
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Posts Explorer screen (FlatList, RefreshControl, Card list)
│   │   └── DetailScreen.tsx     # Post Detail screen (Full details, param validation, retry)
│   ├── services/
│   │   └── api.ts               # Decoupled API service (getPosts, getPostById, ApiError)
│   └── types/
│       └── post.ts              # TypeScript models (Post) and navigation types (RootStackParamList)
├── assets/                      # Static assets and icons
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
└── README.md                    # Project documentation and setup guide
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or later (LTS recommended)
- **npm** or **bun** / **yarn**
- **Expo Go** app on your physical mobile device (iOS App Store or Android Google Play), OR
- **Android Studio** (for Android Emulator) / **Xcode** (for macOS iOS Simulator).

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd ZuvomoApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 📱 Running the Application

Start the Expo development server:

```bash
npx expo start
```

### Running on Android
- **Physical Device**: Open the **Expo Go** app on your Android device and scan the QR code printed in your terminal.
- **Android Emulator**: Ensure an Android Virtual Device (AVD) is running, then press `a` in the terminal or run:
  ```bash
  npx expo start --android
  ```

### Running on iOS
- **Physical Device**: Open the default Camera app on your iPhone and scan the QR code printed in the terminal, then tap the prompt to open in **Expo Go**.
- **iOS Simulator** (macOS only): Ensure Simulator is available, then press `i` in the terminal or run:
  ```bash
  npx expo start --ios
  ```

---

## 🌐 Public API Information

The application communicates with the JSONPlaceholder public REST API:

- **List All Posts**:
  ```http
  GET https://jsonplaceholder.typicode.com/posts
  ```
- **Get Post by ID**:
  ```http
  GET https://jsonplaceholder.typicode.com/posts/{id}
  ```

### TypeScript Data Model (`src/types/post.ts`)

```typescript
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}
```

---

## 🧪 Verification & Type Safety

Verify that the project passes TypeScript checks without errors:

```bash
npx tsc --noEmit
```

Bundle export check for Android:
```bash
npx expo export -p android --no-bytecode
```

Bundle export check for iOS:
```bash
npx expo export -p ios --no-bytecode
```

---

## 🎨 Design Decisions

- **Color Palette**:
  - Primary Accent: Royal Blue (`#2563EB`)
  - Deep Navy Accent: (`#1D4ED8`)
  - Background: Crisp Slate Mist (`#F8FAFC`)
  - Surface Cards: Pure White (`#FFFFFF`) with subtle border (`#E2E8F0`)
  - Typography: Dark Charcoal (`#0F172A`) for titles, Muted Slate (`#64748B`) for previews and body text
- **Touch Ergonomics**: Minimum 44pt touch target heights on interactive elements.
- **Accessibility**: Explicit `accessibilityRole`, `accessibilityLabel`, and `testID` attributes for seamless testing.
# ZuvomoApp
