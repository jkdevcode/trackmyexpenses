# Vite & HeroUI Template

This is a template for creating applications using Vite 6 and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/sctg-development/vite-react-heroui-template)

## Star the project

**If you appreciate my work, please consider giving it a star! 🤩**

## On Github Pages ?

Ths plugin uses our [@sctg/vite-plugin-github-pages-spa](https://github.com/sctg-development/vite-plugin-github-pages-spa) Vite 6 plugin for handling the Github Pages limitations with SPA.  

## With OAuth2 authentication ?

If you are looking for a template with OAuth2 authentication, you can check out my other repository: [vite-react-heroui-auth0-template](https://github.com/sctg-development/vite-react-heroui-auth0-template)
which is the same template with an OAuth2 authentication layer implemented via a free tier on [Auth0](https://auth0.com).

## Technologies Used

- [Vite 6](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [React 19](https://reactjs.org)
- [i18next](https://www.i18next.com)
- [ESLint 9](https://eslint.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)

## Adding a New Page

This section explains how to create a new page with the default layout and add it to the navigation menus.

### 1. Create the Page Component

First, create a new file in the `src/pages` directory. For example, let's create a "Contact" page:

```tsx
// filepath: src/pages/contact.tsx
import { Trans, useTranslation } from "react-i18next";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>
            <Trans t={t}>contact</Trans>
          </h1>
          <p className="mt-4 text-default-600">
            This is the contact page content. You can add your contact form or information here.
          </p>
        </div>
      </section>
    </DefaultLayout>
  );
}
```

### 2. Add Translation Keys

Add the new page's translation key to each language file in the `src/locales/base` directory:

```jsonc
// Add to each language JSON file (en-US.json, fr-FR.json, etc.)
{
  // ... existing translations
  "contact": "Contact" // For English - adjust for other languages
}
```

### 3. Add the Route

Update the `App.tsx` file to include a route for your new page:

```tsx
// filepath: src/App.tsx
import ContactPage from "@/pages/contact";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        {/* Add the new route */}
        <Route element={<ContactPage />} path="/contact" />
      </Routes>
    </CookieConsentProvider>
  );
}
```

### 4. Add to Navigation Menus

Update the `src/config/site.ts` file to include your new page in both the desktop navigation and mobile menu:

```typescript
// filepath: src/config/site.ts
export const siteConfig = () => ({
  // ... existing config
  navItems: [
    {
      label: i18next.t("home"),
      href: "/",
    },
    {
      label: i18next.t("docs"),
      href: "/docs",
    },
    {
      label: i18next.t("pricing"),
      href: "/pricing",
    },
    {
      label: i18next.t("blog"),
      href: "/blog",
    },
    {
      label: i18next.t("about"),
      href: "/about",
    },
    // Add the new page to desktop navigation
    {
      label: i18next.t("contact"),
      href: "/contact",
    },
  ],
  navMenuItems: [
    {
      label: i18next.t("profile"),
      href: "/profile",
    },
    // ... other mobile menu items
    
    // Add the new page to mobile menu (before logout)
    {
      label: i18next.t("contact"),
      href: "/contact",
    },
    {
      label: i18next.t("logout"),
      href: "/logout",
    },
  ],
  // ... rest of config
});
```

### 5. Test Your New Page

Start your development server and verify that:

- The new page is accessible via its route (e.g., <http://localhost:5173/contact>)
- The page appears in both desktop and mobile navigation menus
- The page title is correctly translated based on the selected language

That's it! You've successfully added a new page with the default layout and included it in the navigation menus.

## Internationalization

This template uses i18next for internationalization. The configuration and available languages are defined in the `src/i18n.ts` file.

### Adding a New Language

This template supports multiple languages through i18next. Follow this comprehensive guide to add a new language:

#### Step 1: Determine the Language Code

Choose the appropriate language code using the ISO format:

- For region-specific language: use language-REGION format (e.g., `fr-FR`, `en-US`, `pt-BR`)
- For right-to-left languages (Arabic, Hebrew, etc.), make sure to set `isRTL: true`

#### Step 2: Update the Available Languages Array

Open `src/i18n.ts` and add your new language to the `availableLanguages` array:

```typescript
export const availableLanguages: AvailableLanguage[] = [
  { code: "en-US", nativeName: "English", isRTL: false, isDefault: true },
  // Existing languages...
  { code: "pt-BR", nativeName: "Português do Brasil", isRTL: false }, // Add your new language
];
```

#### Step 3: Create the Translation File

1. Copy an existing translation file as a starting point:

```bash
# In your project root
cp src/locales/base/en-US.json src/locales/base/pt-BR.json
```

2. Translate all values (right side) in the new file while keeping the keys (left side) unchanged:

```jsonc
{
  "search": "Pesquisar",
  "twitter": "Twitter",
  "discord": "Discord",
  // ... translate all other entries
}
```

#### Step 4: Update the Load Path Function

In `src/i18n.ts`, add a case for your new language in the `loadPath` function:

```typescript
backend: {
  loadPath: (lng, ns) => {
    let url: URL = new URL("./locales/base/en-US.json", import.meta.url);
    
    switch (ns[0]) {
      case "base":
        switch (lng[0]) {
          case "en-US":
            url = new URL("./locales/base/en-US.json", import.meta.url);
            break;
          // ... existing languages
          case "pt-BR": // Add your new language case
            url = new URL("./locales/base/pt-BR.json", import.meta.url);
            break;
          default:
            url = new URL("./locales/base/en-US.json", import.meta.url);
        }
        break;
      default:
        url = new URL("./locales/base/en-US.json", import.meta.url);
    }
    
    return url.toString();
  },
}
```

#### Step 5: Special Considerations

**For RTL Languages (Arabic, Hebrew, etc.):**

- Set `isRTL: true` in the language definition
- Ensure your UI components handle RTL layout properly
- Test thoroughly as some components may need specific RTL adjustments

**For Languages with Special Characters:**

- Ensure proper UTF-8 encoding in your JSON files
- Test with the longest translated strings to check for layout issues

**For Chinese, Japanese, Korean:**

- Consider using a shorter display format in the language switcher
- You might want to customize the language display in `LanguageSwitch` component

#### Step 6: Test Your New Language

1. Start your development server
2. Switch to the newly added language using the language selector
3. Verify all text is properly translated
4. Check that special layouts (like RTL) work correctly
5. Test on different screen sizes to ensure translations don't break layouts

#### Step 7: Translation Tools (Optional)

To simplify the translation process, consider using:

- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) VS Code extension
- Export/import with spreadsheets for collaboration with translators
- Machine translation services for first drafts (DeepL, Google Translate)
- Use the included command to extract missing translations from the code

#### Troubleshooting

- **Language not appearing in dropdown**: Check that you've added it to the `availableLanguages` array correctly
- **Untranslated text**: Ensure all keys from the base language exist in your new translation file
- **Garbled text**: Verify your JSON file is saved with UTF-8 encoding
- **Layout issues**: Some translations may be longer and need UI adjustments

### Language Switch Component

The `LanguageSwitch` component allows users to switch between the available languages. It is defined in the `src/components/language-switch.tsx` file.

- The component uses the i18n instance to change the language and update the document metadata.
- It automatically updates the document direction based on the language (left-to-right or right-to-left).
- The selected language is stored in `localStorage` to persist the user's preference.

### Example Usage

To use the `LanguageSwitch` component in your application, simply include it in your JSX:

```tsx
<LanguageSwitch availableLanguages={[{ code: "en-US", nativeName: "English", isRTL: false, isDefault: true },{ code: "fr-FR", nativeName: "Français", isRTL: false }]} />
```

or more simply using the `availableLanguages` array defined in the `src/i18n.ts` file:

```tsx
import { availableLanguages } from "@/i18n";
<LanguageSwitch availableLanguages={availableLanguages} />
```

This component will render a dropdown menu with the available languages, allowing users to switch languages easily.

### Lazy Loading

The default configuration uses the `i18next-http-backend` plugin for language lazy loading. This means that translations are loaded only when needed, improving the application's performance.

### Summary

- **Configuration:** `src/i18n.ts`
- **Translations:** `src/locales/base`
- **Language Switch:** `src/components/language-switch.tsx`

By following the steps above, you can easily add new languages and manage internationalization for your application.

## Cookie Consent

This template includes a cookie consent management system to comply with privacy regulations like GDPR. The system displays a modal dialog asking users for consent to use cookies and stores their preference in the browser's localStorage.
<img width="944" alt="Capture d’écran 2025-04-11 à 19 55 13" src="https://github.com/user-attachments/assets/8769525c-bef0-4705-9b2e-6664aa68a9e0" />

### Features

- Modern modal-based UI with blur backdrop
- Internationalized content for all supported languages
- Stores user preferences in localStorage
- Provides a context API for checking consent status throughout the application
- Supports both accepting and rejecting cookies

### Configuration

The cookie consent feature can be enabled or disabled through the site configuration:

1. **Enable/Disable Cookie Consent:**
   - Open the `src/config/site.ts` file
   - Set the `needCookieConsent` property to `true` or `false`:

```typescript
export const siteConfig = () => ({
  needCookieConsent: true, // Set to false if you don't need cookie consent
  // ...other configuration
});
```

### Implementation Details

- **Context Provider:** `src/contexts/cookie-consent-context.tsx` - Provides a React context to manage consent state
- **UI Component:** `src/components/cookie-consent.tsx` - Renders the consent modal using HeroUI components
- **Consent Status:** The consent status can be one of three values:
  - `pending`: Initial state, user hasn't made a decision yet
  - `accepted`: User has accepted cookies
  - `rejected`: User has rejected cookies

### Using Cookie Consent in Your Components

You can access the cookie consent status in any component using the `useCookieConsent` hook:

```tsx
import { useCookieConsent } from "@/contexts/cookie-consent-context";

const MyComponent = () => {
  const { cookieConsent, acceptCookies, rejectCookies, resetCookieConsent } = useCookieConsent();
  
  // Load analytics only if cookies are accepted
  useEffect(() => {
    if (cookieConsent === "accepted") {
      // Initialize analytics, tracking scripts, etc.
    }
  }, [cookieConsent]);
  
  // ...rest of your component
};
```

### Customization

- Modify the appearance of the consent modal in `src/components/cookie-consent.tsx`
- Add custom tracking or cookie management logic in the `acceptCookies` and `rejectCookies` functions in `src/contexts/cookie-consent-context.tsx`
- Update the cookie policy text in the language files (e.g., `src/locales/base/en-US.json`)

## Tailwind CSS 4

This template uses Tailwind CSS 4, which is a utility-first CSS framework. You can customize the styles by modifying the `tailwind.config.js` file.  
Currently HeroUI uses Tailwind CSS 3, but [@winchesHe](https://github.com/winchesHe)  create a port of HeroUI to Tailwind CSS 4, you can find it [here](https://github.com/heroui-inc/heroui/pull/4656), HeroUI packages are available at <https://github.com/heroui-inc/heroui/pull/4656#issuecomment-2651218074>.

## How to Use

To clone the project, run the following command:

```bash
git clone https://github.com/sctg-development/vite-react-heroui-template.git
```

### Manual chunk splitting

In the `vite.config.ts` file, all `@heroui` packages are manually split into a separate chunk. This is done to reduce the size of the main bundle. You can remove this configuration if you don't want to split the packages.

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/sctg-development/vite-react-heroui-template/blob/main/LICENSE).
