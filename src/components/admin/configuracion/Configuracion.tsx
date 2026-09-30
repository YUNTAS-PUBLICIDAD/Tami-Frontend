import { useState } from "react";
import GeneralSection from "./components/GeneralSection";
import RedesSection from "./components/RedesSection";
import HorarioSection from "./components/HorarioSection";

type Tab = "general" | "redes" | "horario";

const TABS: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "redes", label: "Redes Sociales" },
    { id: "horario", label: "Horarios" },
];

export default function Configuracion() {
    const [activeTab, setActiveTab] = useState<Tab>("general");

    return (
        <div className="p-0 h-full w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-700 dark:to-teal-600 rounded-t-xl p-6 shadow-lg">
                <h1 className="text-2xl font-bold text-white">Información de Contacto</h1>
                <p className="text-teal-100 text-sm">Configura el comportamiento del negocio</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-xl border border-t-0 border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[100px] px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 ${activeTab === tab.id
                                    ? "bg-teal-600 dark:bg-teal-500 text-white shadow-md"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={activeTab === "general" ? "" : "hidden"}>
                    <GeneralSection />
                </div>
                <div className={activeTab === "redes" ? "" : "hidden"}>
                    <RedesSection />
                </div>
                <div className={activeTab === "horario" ? "" : "hidden"}>
                    <HorarioSection />
                </div>
            </div>
        </div>
    );
}