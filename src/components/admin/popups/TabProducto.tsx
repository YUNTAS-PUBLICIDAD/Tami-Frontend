import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import Swal from "sweetalert2";
import { ProductoService } from "../../../services/producto.service";
import type Producto from "../../../models/Product";
import { config } from "../../../../config";
import WhatsappEditor from "./WhatsappEditor";
import EmailEditor from "./EmailEditor";
import { ProductFormBuilderService } from "./services/productFormBuilder";
import { ProductSyncService } from "./services/productSyncService";
import type { ProductFormData, TabType } from "./types/productTab.types";
import { useProductForm } from "./hooks/useProductForm";
import { useProductEventListeners } from "./hooks/useProductEventListeners";
import { useProductSave } from "./hooks/useProductSave";
import { ImageUploadField } from "./components/ImageUploadField";
import { ColorPickerField } from "./components/ColorPickerField";
import { TabNavigation } from "./components/TabNavigation";
import { PopupSection } from "./components/PopupSection";
import { WhatsAppSection } from "./components/WhatsAppSection";
import { EmailSection } from "./components/EmailSection";
import { getImageUrl } from "./utils/imageUrl";

const TabProducto: React.FC = () => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<TabType>('popups');
    const [whatsappSelected, setWhatsappSelected] = useState<number>(1);
    
    // Custom hooks
    const { formData, setFormData, previews, setPreviews, handleFieldChange: hookFieldChange, handleClearImage: hookClearImage, handleFileChange: hookFileChange } = useProductForm();
    const { isSaving, handleSave: hookSave } = useProductSave();

    // Event listeners for editor updates
    useProductEventListeners({
        whatsappSelected,
        onWhatsappUpdate: (messageNumber, text) => {
            setFormData((prev: any) => {
                if (!prev) return null;
                if (messageNumber === 1) return { ...prev, texto_alt_whatsapp: text };
                if (messageNumber === 2) return { ...prev, mensaje_whatsapp_2: text };
                if (messageNumber === 3) return { ...prev, mensaje_whatsapp_3: text };
                return prev;
            });
        },
        onEmailUpdate: (text) => {
            setFormData((prev: any) => (prev ? { ...prev, mensaje_email: text } : null));
        },
        onReset: () => {
            setSelectedProductId("");
            setFormData(null);
            setPreviews({});
        },
        onExternalSave: () => {
            handleSave();
        }
    });

    // Sync preview when data or tab changes
    useEffect(() => {
        if (formData) {
            ProductSyncService.syncPreview(formData, previews, activeTab, whatsappSelected);
        }
    }, [formData, activeTab, whatsappSelected, previews]);

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductoService.getAllProductos();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const handleProductSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedProductId(id);

        if (!id) {
            setFormData(null);
            return;
        }

        try {
            // Fetch FULL product details
            const response = await apiClient.get(config.endpoints.productos.detail(id));
            const product = response.data.data || response.data;

            // Use service to build initial form data
            const initialData = ProductFormBuilderService.buildInitialFormData(product, config.apiUrl);
            setFormData(initialData);

            // Update Editors
            ProductSyncService.updateEditors(initialData);

            // Sync preview
            ProductSyncService.syncPreview(initialData, {}, activeTab, whatsappSelected);
        } catch (error) {
            console.error("Error fetching product details:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron obtener los detalles del producto."
            });
        }
    };



    // Wrapper to add preview sync after field change
    const handleFieldChange = (field: string, value: any, isEtiqueta = false) => {
        hookFieldChange(field, value, isEtiqueta);
        
        // Sync preview if not a File
        if (!(value instanceof File)) {
            setTimeout(() => {
                setFormData((prev: any) => {
                    if (prev) {
                        ProductSyncService.syncPreview(prev, previews, activeTab, whatsappSelected);
                    }
                    return prev;
                });
            }, 0);
        }
    };

    const handleClearImage = (field: string) => {
        hookClearImage(field);
        
        // Sync preview after clearing
        setTimeout(() => {
            setFormData((prev: any) => {
                if (prev) {
                    ProductSyncService.syncPreview(prev, previews, activeTab, whatsappSelected, { [field]: null });
                }
                return prev;
            });
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        hookFileChange(e, field, (newData, overrides) => {
            // Dispatch specific preview events for WhatsApp messages
            const url = overrides[field] as string;
            ProductSyncService.updateWhatsAppImagePreview(field, url);

            // Sync preview with the new URL
            ProductSyncService.syncPreview(newData, previews, activeTab, whatsappSelected, overrides);
        });
    };

    // Wrapper for save with selectedProductId
    const handleSave = useCallback(async () => {
        await hookSave(selectedProductId, formData);
    }, [selectedProductId, formData, hookSave]);

    if (loadingProducts) {
        return <div className="p-8 text-center text-gray-500">Cargando productos...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800">
                <label className="block text-sm font-bold text-teal-800 dark:text-teal-300 mb-2">
                    Seleccionar Producto para configurar:
                </label>
                <div className="relative">
                    <select
                        value={selectedProductId}
                        onChange={handleProductSelect}
                        className="w-full p-3 pr-10 rounded-lg border border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
                    >
                        <option value="">-- Elige un producto --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {formData && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Sub-Tabs for Product */}
                    <TabNavigation
                        tabs={[
                            { id: 'popups', label: 'Pop-ups' },
                            { id: 'whatsapp', label: 'WhatsApp' },
                            { id: 'correo', label: 'Correo' }
                        ]}
                        activeTab={activeTab}
                        onTabChange={(tab) => setActiveTab(tab as TabType)}
                    />

                    {activeTab === 'popups' && (
                        <PopupSection
                            formData={formData}
                            previews={previews}
                            onFieldChange={handleFieldChange}
                            onFileChange={handleFileChange}
                            onClearImage={handleClearImage}
                        />
                    )}

                    {activeTab === 'whatsapp' && (
                        <WhatsAppSection
                            formData={formData}
                            previews={previews}
                            onFieldChange={handleFieldChange}
                            onFileChange={handleFileChange}
                            onClearImage={handleClearImage}
                            whatsappSelected={whatsappSelected}
                            onWhatsappSelectChange={setWhatsappSelected}
                        />
                    )}

                    {activeTab === 'correo' && (
                        <EmailSection
                            formData={formData}
                            previews={previews}
                            onFieldChange={handleFieldChange}
                            onFileChange={handleFileChange}
                            onClearImage={handleClearImage}
                        />
                    )}
                </div>
            )}

            {!formData && !loadingProducts && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 font-medium text-lg">Selecciona un producto para comenzar a configurar su pop-up</p>
                </div>
            )}
        </div>
    );
};

export default TabProducto;
