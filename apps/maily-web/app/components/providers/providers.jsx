"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = Providers;
const react_query_1 = require("@tanstack/react-query");
const next_themes_1 = require("next-themes");
const react_1 = require("react");
function Providers({ children }) {
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient());
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <next_themes_1.ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </next_themes_1.ThemeProvider>
    </react_query_1.QueryClientProvider>);
}
