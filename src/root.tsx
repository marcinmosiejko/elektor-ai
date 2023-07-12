import { component$ } from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

export const CSSThemeScript = () => {
  const themeScript = `
        document.documentElement
            .setAttribute('data-theme',
                localStorage.getItem('theme') ??
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            ); `;
  return <script dangerouslySetInnerHTML={themeScript} />;
};

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <CSSThemeScript />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en" class="flex min-h-screen flex-col">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
