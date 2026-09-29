import Swal, { type SweetAlertOptions } from "sweetalert2";

const TEAL = "#0d9488";

export function fireSwal(options: SweetAlertOptions) {
    const isDark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

    return Swal.fire({
        confirmButtonColor: TEAL,
        background: isDark ? "#1f2937" : "#ffffff",
        color: isDark ? "#f3f4f6" : "#111827",
        ...options,
    });
}