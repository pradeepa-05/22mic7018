/**
 * pages/_app.tsx
 */

import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../styles/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Campus Notifications</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
