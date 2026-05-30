import Swal from "sweetalert2";
import { getPopupSettings, updatePopupSettingsFormData, isHexColor } from "../../lib/api/popupSettings";
import { getSettingValue } from "./popupsHelpers";
import { currentInicioImages, whatsappData, emailsState, sharedState } from "./popupsState";
import { addFileToForm } from "./popupsImages";

export function initSettings(updatePreview: (settings?: any, mode?: string | null) => void, setStatus: (msg: string, type?: string) => void) {
    async function loadSettings() {
        setStatus("Cargando...", "loading");
        try {
            const settings = (await getPopupSettings()) as any;
            if (settings) {
                sharedState.savedHomeSettings = settings;
                currentInicioImages.popup_image_url = settings.image1 || settings.popup_image_url || null;
                currentInicioImages.popup_image2_url = settings.image2 || settings.popup_image2_url || null;
                currentInicioImages.popup_mobile_image_url = settings.imageMobile || settings.popup_mobile_image_url || null;
                currentInicioImages.popup_mobile_image2_url = settings.imageMobile2 || settings.popup_mobile_image2_url || null;
                currentInicioImages.whatsappImage = settings.whatsappImage || null;
                currentInicioImages.whatsappImage2 = settings.whatsappImage2 || null;
                currentInicioImages.whatsappImage3 = settings.whatsappImage3 || null;
                currentInicioImages.emailImage = settings.emailImage || null;

                const btnBgColorInput = document.getElementById("btnBgColor") as HTMLInputElement | null;
                const btnTextColorInput = document.getElementById("btnTextColor") as HTMLInputElement | null;
                const btnTextInput = document.getElementById("btnText") as HTMLInputElement | null;

                if (btnBgColorInput)
                    btnBgColorInput.value = settings.button_bg_color || settings.btnBgColor || "#14b8a6";
                if (btnTextColorInput)
                    btnTextColorInput.value = settings.button_text_color || settings.btnTextColor || "#ffffff";

                if (btnTextInput) {
                    const bText = settings.button_text || settings.btnText || "CONOCER MAS";
                    btnTextInput.value = bText;
                }

                const popupInicioDelayValue = String(getSettingValue(settings, ["popup_start_delay_minutes", "popupInicioDelay"], 0));
                const popupProductosDelayValue = String(getSettingValue(settings, ["product_popup_delay_minutes", "popupProductosDelay"], 0));

                const popupInicioDelayInput = document.getElementById("popupInicioDelay") as HTMLSelectElement | null;
                const popupProductosDelayInput = document.getElementById("popupProductosDelay") as HTMLSelectElement | null;
                if (popupInicioDelayInput) popupInicioDelayInput.value = popupInicioDelayValue;
                if (popupProductosDelayInput) popupProductosDelayInput.value = popupProductosDelayValue;

                const whatsappMessageInput = document.getElementById("whatsappMessage") as HTMLInputElement | null;
                const whatsappMessageInput2 = document.getElementById("whatsappMessage2") as HTMLInputElement | null;
                const whatsappMessageInput3 = document.getElementById("whatsappMessage3") as HTMLInputElement | null;
                const whatsappTimeInput1 = document.getElementById("whatsappTime1") as HTMLSelectElement | null;
                const whatsappTimeInput2 = document.getElementById("whatsappTime2") as HTMLSelectElement | null;
                const whatsappTimeInput3 = document.getElementById("whatsappTime3") as HTMLSelectElement | null;

                const whatsappMessage1Value = getSettingValue(settings, ["whatsappMessage", "whatsapp_message", "texto_alt_whatsapp", "mensaje_whatsapp"], "");
                const whatsappMessage2Value = getSettingValue(settings, ["whatsappMessage2", "whatsapp_message_2", "mensaje_whatsapp_2"], "");
                const whatsappMessage3Value = getSettingValue(settings, ["whatsappMessage3", "whatsapp_message_3", "mensaje_whatsapp_3"], "");

                const whatsappTime1Value = String(getSettingValue(settings, ["whatsappTime1", "whatsapp_time_1"], 0));
                const whatsappTime2Value = String(getSettingValue(settings, ["whatsappTime2", "whatsapp_time_2"], 0));
                const whatsappTime3Value = String(getSettingValue(settings, ["whatsappTime3", "whatsapp_time_3"], 0));

                if (whatsappMessageInput) whatsappMessageInput.value = whatsappMessage1Value;
                if (whatsappMessageInput2) whatsappMessageInput2.value = whatsappMessage2Value;
                if (whatsappMessageInput3) whatsappMessageInput3.value = whatsappMessage3Value;

                if (whatsappTimeInput1) whatsappTimeInput1.value = whatsappTime1Value;
                if (whatsappTimeInput2) whatsappTimeInput2.value = whatsappTime2Value;
                if (whatsappTimeInput3) whatsappTimeInput3.value = whatsappTime3Value;

                window.dispatchEvent(new CustomEvent("timepicker-sync", {
                    detail: { id: "whatsappTime1", value: Number(whatsappTime1Value) || 0 },
                }));
                window.dispatchEvent(new CustomEvent("timepicker-sync", {
                    detail: { id: "whatsappTime2", value: Number(whatsappTime2Value) || 0 },
                }));
                window.dispatchEvent(new CustomEvent("timepicker-sync", {
                    detail: { id: "whatsappTime3", value: Number(whatsappTime3Value) || 0 },
                }));

                whatsappData["1"] = { text: whatsappMessage1Value, image: currentInicioImages.whatsappImage };
                whatsappData["2"] = { text: whatsappMessage2Value, image: currentInicioImages.whatsappImage2 };
                whatsappData["3"] = { text: whatsappMessage3Value, image: currentInicioImages.whatsappImage3 };

                window.dispatchEvent(new CustomEvent("update-whatsapp-editor-1", { detail: whatsappMessage1Value }));
                window.dispatchEvent(new CustomEvent("update-whatsapp-editor-2", { detail: whatsappMessage2Value }));
                window.dispatchEvent(new CustomEvent("update-whatsapp-editor-3", { detail: whatsappMessage3Value }));

                (window as any).popupsWhatsapp?.syncWhatsAppPreview?.(sharedState.currentSelectedWaMessage || "1");

                // Map all 3 emails from settings
                const mapEmail = (idx: string, suffix: string = "") => {
                    emailsState[idx].title = settings[`emailTitle${suffix}`] || settings[`email_subject${suffix}`] || (idx === "1" ? "Solicitud de información - Popup Web" : "");
                    emailsState[idx].body = settings[`emailBody${suffix}`] || settings[`email_message${suffix}`] || "";
                    emailsState[idx].imageUrl = settings[`emailImage${suffix}`] || settings[`email_image_url${suffix}`] || null;
                    emailsState[idx].btnText = settings[`email_btn_text${suffix}`] || settings[`emailBtnText${suffix}`] || "Ver Productos";
                    emailsState[idx].btnLink = settings[`email_btn_link${suffix}`] || settings[`emailBtnLink${suffix}`] || "https://tami.com/productos";
                    emailsState[idx].btnBgColor = settings[`email_btn_bg_color${suffix}`] || settings[`emailBtnBgColor${suffix}`] || "#0b1c3c";
                    emailsState[idx].btnTextColor = settings[`email_btn_text_color${suffix}`] || settings[`emailBtnTextColor${suffix}`] || "#ffffff";
                    emailsState[idx].delay = String(settings[`email_send_delay_minutes${suffix}`] || settings[`emailSendDelay${suffix}`] || 5);
                };

                mapEmail("1", "");
                mapEmail("2", "_2");
                mapEmail("3", "_3");

                // Initialize UI with Email 1
                sharedState.currentEmailIdx = "1";
                const emailSelector = document.getElementById("emailSelector") as HTMLSelectElement | null;
                if (emailSelector) emailSelector.value = "1";
                (window as any).popupsEmail?.syncUIFromEmailState?.("1");

                const restoreImg = (url: string | null, key: string, clearId: string) => {
                    if (url) {
                        updatePreview({ [key]: url });
                        document.getElementById(clearId)?.classList.remove("hidden");
                    }
                };

                restoreImg(settings.image1, "popup_image_url", "clearImage1");
                restoreImg(settings.image2, "popup_image2_url", "clearImage2");

                // Inicializar imágenes móviles en el componente React puente
                window.dispatchEvent(new CustomEvent('inicio-mobile-settings-loaded', {
                    detail: {
                        imageMobile: settings.imageMobile || settings.popup_mobile_image_url || null,
                        imageMobile2: settings.imageMobile2 || settings.popup_mobile_image2_url || null,
                        count: 2
                    }
                }));

                updatePreview({
                    popup_image_url: settings.image1 || settings.popup_image_url || null,
                    popup_image2_url: settings.image2 || settings.popup_image2_url || null,
                    popup_mobile_image_url: settings.imageMobile || settings.popup_mobile_image_url || null,
                    popup_mobile_image2_url: settings.imageMobile2 || settings.popup_mobile_image2_url || null,
                    button_bg_color: settings.button_bg_color,
                    button_text_color: settings.button_text_color,
                    button_text: settings.button_text || "CONOCER MAS",
                    popup_start_delay_minutes: settings.popup_start_delay_minutes,
                    product_popup_delay_minutes: settings.product_popup_delay_minutes,
                    popup_mobile_image_count: 2,
                });
            }

            setStatus("Configuración cargada.", "idle");
        } catch (err) {
            console.error(err);
            setStatus("Error al cargar configuración.", "error");
        }
    }

    loadSettings();

    // SAVE SETTINGS
    const btnGuardarPopups = document.getElementById("btnGuardarPopups") as HTMLButtonElement | null;
    btnGuardarPopups?.addEventListener("click", async () => {
        if (!btnGuardarPopups) return;
        const originalText = btnGuardarPopups.innerText;
        btnGuardarPopups.setAttribute('data-original-text', originalText);
        btnGuardarPopups.innerText = "Guardando...";
        btnGuardarPopups.disabled = true;
        setStatus("Guardando cambios...", "loading");

        try {
            const sectionProducto = document.getElementById("sectionProducto");
            // Detectar qué pestaña está activa
            const isProductoTab = sectionProducto && !sectionProducto.classList.contains("hidden");
            const currentPopupType = isProductoTab ? "producto" : "inicio";
            const formData = new FormData();
            formData.append("popup_type", currentPopupType);

            const btnBgColorInput = document.getElementById("btnBgColor") as HTMLInputElement | null;
            const btnTextColorInput = document.getElementById("btnTextColor") as HTMLInputElement | null;
            const btnTextInput = document.getElementById("btnText") as HTMLInputElement | null;
            const popupInicioDelayInput = document.getElementById("popupInicioDelay") as HTMLSelectElement | null;
            const popupProductosDelayInput = document.getElementById("popupProductosDelay") as HTMLSelectElement | null;

            const bgColor = btnBgColorInput?.value || "#14b8a6";
            const textColor = btnTextColorInput?.value || "#ffffff";
            const delay = parseInt(popupInicioDelayInput?.value || "60");

            let productDelayValue = "60";
            if (isProductoTab && popupProductosDelayInput) {
                productDelayValue = popupProductosDelayInput.value;
            }

            if (!isHexColor(bgColor) || !isHexColor(textColor)) {
                throw new Error("Colores no válidos.");
            }

            formData.append("button_bg_color", bgColor);
            formData.append("button_text_color", textColor);
            if (btnTextInput) {
                formData.append("button_text", btnTextInput.value);
            }
            formData.append("popup_start_delay_minutes", delay.toString());

            formData.append("popup_mobile_image_count", "2");

            if (isProductoTab) {
                formData.append("product_popup_delay_minutes", productDelayValue);
                window.dispatchEvent(new CustomEvent("request-save-product-popup"));
                return; // Stop execution here, the React component handles the rest of the save process
            }

            const whatsappMessage = document.getElementById("whatsappMessage") as HTMLInputElement | null;
            const whatsappMessage2 = document.getElementById("whatsappMessage2") as HTMLInputElement | null;
            const whatsappMessage3 = document.getElementById("whatsappMessage3") as HTMLInputElement | null;

            if (whatsappMessage) formData.append("whatsappMessage", whatsappMessage.value);
            if (whatsappMessage2) formData.append("whatsappMessage2", whatsappMessage2.value);
            if (whatsappMessage3) formData.append("whatsappMessage3", whatsappMessage3.value);

            const whatsappTime1 = document.getElementById("whatsappTime1") as HTMLInputElement | null;
            const whatsappTime2 = document.getElementById("whatsappTime2") as HTMLInputElement | null;
            const whatsappTime3 = document.getElementById("whatsappTime3") as HTMLInputElement | null;

            if (whatsappTime1) formData.append("whatsappTime1", whatsappTime1.value || "0");
            if (whatsappTime2) formData.append("whatsappTime2", whatsappTime2.value || "0");
            if (whatsappTime3) formData.append("whatsappTime3", whatsappTime3.value || "0");

            formData.append("whatsapp_enabled", "1");
            formData.append("email_enabled", "1");

            // Save all 3 emails
            (window as any).popupsEmail?.saveCurrentEmailToState?.();

            const appendEmailToFormData = (idx: string, suffix: string = "") => {
                const state = emailsState[idx];
                formData.append(`emailTitle${suffix}`, state.title);
                formData.append(`emailBody${suffix}`, state.body);
                formData.append(`email_btn_text${suffix}`, state.btnText);
                formData.append(`email_btn_link${suffix}`, state.btnLink);
                formData.append(`email_btn_bg_color${suffix}`, state.btnBgColor);
                formData.append(`email_btn_text_color${suffix}`, state.btnTextColor);
                formData.append(`email_send_delay_minutes${suffix}`, state.delay);

                if (state.file) {
                    formData.append(`emailImage${suffix}`, state.file);
                } else if (state.deleteImage === "1") {
                    formData.append(`delete_emailImage${suffix}`, "1");
                }
            };

            appendEmailToFormData("1", "");
            appendEmailToFormData("2", "_2");
            appendEmailToFormData("3", "_3");

            addFileToForm(formData, "popupImage1", "image1");
            addFileToForm(formData, "popupImage2", "image2");
            addFileToForm(formData, "popupImageMobile", "imageMobile");
            addFileToForm(formData, "popupImageMobile2", "imageMobile2");
            addFileToForm(formData, "whatsappImage", "whatsappImage");
            addFileToForm(formData, "whatsappImage2", "whatsappImage2");
            addFileToForm(formData, "whatsappImage3", "whatsappImage3");

            await updatePopupSettingsFormData(formData);

            setStatus("¡Guardado exitosamente!", "success");
            await Swal.fire({ icon: "success", title: "Configuración guardada", showConfirmButton: false, timer: 1500 });
            setTimeout(() => setStatus(""), 3000);
        } catch (error: any) {
            console.error(error);
            const errMessage = error instanceof Error ? error.message : String(error);
            setStatus("Error al guardar: " + errMessage, "error");
            await Swal.fire({ icon: "error", title: "Error", text: `❌ ${errMessage}` });
        } finally {
            const btnGuardarPopupsEl = document.getElementById("btnGuardarPopups") as HTMLButtonElement | null;
            if (btnGuardarPopupsEl) {
                btnGuardarPopupsEl.innerText = btnGuardarPopupsEl.getAttribute('data-original-text') || 'Guardar';
                btnGuardarPopupsEl.disabled = false;
            }
        }
    });

    window.addEventListener("product-popup-save-finished", () => {
        const btnGuardarPopupsEl = document.getElementById("btnGuardarPopups") as HTMLButtonElement | null;
        if (btnGuardarPopupsEl) {
            btnGuardarPopupsEl.innerText = btnGuardarPopupsEl.getAttribute('data-original-text') || 'Guardar Cambios';
            btnGuardarPopupsEl.disabled = false;
        }
        setStatus("Configuración guardada.", "success");
        setTimeout(() => setStatus(""), 3000);
    });
}

export default initSettings;
