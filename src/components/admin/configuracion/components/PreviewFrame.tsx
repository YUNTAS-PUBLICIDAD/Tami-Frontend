import { useState, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";

export type DeviceMode = "desktop" | "mobile";

interface PreviewFrameProps {
    title?: string;
    children: (mode: DeviceMode) => ReactNode;
}

export default function PreviewFrame({ title = "Vista Previa", children }: PreviewFrameProps) {
    const [mode, setMode] = useState<DeviceMode>("desktop");

    return (
        <div className="lg:sticky lg:top-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {title}
                </h2>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setMode("desktop")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md hidden lg:flex items-center gap-2 transition-all ${
                            mode === "desktop"
                                ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                        <Monitor className="h-4 w-4" />
                        Escritorio
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("mobile")}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${
                            mode === "mobile"
                                ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                        <Smartphone className="h-4 w-4" />
                        Móvil
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center items-center relative min-h-[360px] transition-all duration-300 overflow-hidden p-6">
                <div className={mode === "mobile" ? "w-full max-w-[280px]" : "w-full max-w-sm"}>
                    {children(mode)}
                </div>
            </div>
        </div>
    );
}