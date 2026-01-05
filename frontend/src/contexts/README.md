# Contexts Directory

Global state providers using React Context API.

## Key Contexts
*   **`SessionContext`**: Manages user authentication state, tokens, and session persistence.
*   **`ThemeContext`**: Controls light/dark mode theme switching.
*   **`CookieConsentContext`**: Manages user consent for cookies.

## Usage
*   Wrap the application or specific trees with these providers in `App.tsx` or `Provider.tsx`.
*   Consume using corresponding hooks (e.g., `useSession`).
