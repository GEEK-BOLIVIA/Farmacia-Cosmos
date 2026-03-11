tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Estos nombres (ej: primary) son los que usas en HTML (ej: bg-primary)
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                accent: "var(--color-accent)",
                "primary-dark": "var(--color-primary-dark)",
                "background-light": "var(--color-bg-light)",
                "background-dark": "var(--color-bg-dark)",
                "surface-dark": "var(--color-surface-dark)",
            },
            fontFamily: {
                display: ["Poppins", "sans-serif"],
                body: ["Poppins", "sans-serif"],
            }
        }
    }
};