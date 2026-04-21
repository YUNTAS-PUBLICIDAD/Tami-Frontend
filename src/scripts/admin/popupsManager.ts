import {
    getPopupSettings,
    updatePopupSettingsFormData,
    isHexColor,
} from "../../lib/api/popupSettings";

export function initPopupManager() {
    const tabPopups = document.getElementById("tabPopups");
    const tabWhatsapp = document.getElementById("tabWhatsapp");
    const tabCorreo = document.getElementById("tabCorreo");

    const btnDesktop = document.getElementById("btnDesktop");
    const btnMobile = document.getElementById("btnMobile");

    const contentPopups = document.getElementById("contentPopups");
    const contentWhatsapp = document.getElementById("contentWhatsapp");
    const contentCorreo = document.getElementById("contentCorreo");

    const previewScrollModalContainer = document.getElementById(
        "previewScrollModalContainer",
    );
    const previewWhatsapp = document.getElementById("previewWhatsapp");
    const previewCorreo = document.getElementById("previewCorreo");
    const previewOverlay = document.getElementById("previewOverlay");
    const previewModesToggle =
        document.getElementById("previewModesToggle");
    const previewStage = document.getElementById("previewStage");
    const previewWhatsappText = document.getElementById("previewWhatsappText");
    const statusElement = document.getElementById("popupStatus");

    const isMobileScreen = window.innerWidth < 1024;
    let currentMode = isMobileScreen ? "mobile" : "desktop";

    if (
        !tabPopups ||
        !tabWhatsapp ||
        !tabCorreo ||
        !btnDesktop ||
        !btnMobile
    ) {
        setTimeout(initPopupManager, 200);
        return;
    }

    const tabs = [tabPopups, tabWhatsapp, tabCorreo];
    const contents = [contentPopups, contentWhatsapp, contentCorreo];

    const activeModeClasses = [
        "bg-white",
        "dark:bg-gray-700",
        "text-teal-600",
        "dark:text-teal-400",
        "shadow-sm",
    ];
    const inactiveModeClasses = [
        "text-gray-500",
        "dark:text-gray-400",
        "hover:text-gray-700",
        "dark:hover:text-gray-200",
    ];

    // Apply initial classes based on mobile screen size
    if (isMobileScreen) {
        btnMobile.classList.remove(...inactiveModeClasses);
        btnMobile.classList.add(...activeModeClasses);
        btnDesktop.classList.remove(...activeModeClasses);
        btnDesktop.classList.add(...inactiveModeClasses);
    } else {
        btnDesktop.classList.remove(...inactiveModeClasses);
        btnDesktop.classList.add(...activeModeClasses);
        btnMobile.classList.remove(...activeModeClasses);
        btnMobile.classList.add(...inactiveModeClasses);
    }

    function updatePreview(settings = {}, mode: string | null = null) {
        console.log("[popupsManager.ts] Dispatching updatePreview:", {
            settings,
            mode,
        });
        window.dispatchEvent(
            new CustomEvent("update-popup-preview", {
                detail: { settings, mode },
            }),
        );
    }

    function setStatus(
        message: string,
        type: "success" | "error" | "loading" | "idle" = "idle",
    ) {
        if (!statusElement) return;
        statusElement.textContent = message;
        statusElement.className = "text-sm mt-2";
        if (type === "success")
            statusElement.classList.add("text-teal-600");
        else if (type === "error")
            statusElement.classList.add("text-red-500");
        else if (type === "loading")
            statusElement.classList.add("text-amber-500");
        else
            statusElement.classList.add(
                "text-gray-600",
                "dark:text-gray-300",
            );
    }

    function activarTab(tab: HTMLElement, content: HTMLElement | null, type: string) {
        const activeClasses = [
            "bg-teal-600",
            "dark:bg-teal-500",
            "text-white",
            "shadow-sm",
        ];
        const inactiveClasses = [
            "text-gray-500",
            "dark:text-gray-400",
            "hover:bg-gray-100",
            "dark:hover:bg-gray-700/50",
            "hover:text-gray-700",
            "dark:hover:text-gray-200",
        ];

        tabs.forEach((t) => {
            t.classList.remove(...activeClasses);
            t.classList.add(...inactiveClasses);
        });
        contents.forEach((c) => c?.classList.add("hidden"));
        if (previewWhatsapp) previewWhatsapp.classList.add("hidden");
        if (previewCorreo) previewCorreo.classList.add("hidden");

        tab.classList.remove(...inactiveClasses);
        tab.classList.add(...activeClasses);
        content?.classList.remove("hidden");

        if (previewScrollModalContainer) {
            type === "popups" ? previewScrollModalContainer.classList.remove("hidden") : previewScrollModalContainer.classList.add("hidden");
        }
        if (previewOverlay) previewOverlay.classList.add("hidden");
        if (previewModesToggle) {
            type === "popups" ? previewModesToggle.classList.remove("hidden") : previewModesToggle.classList.add("hidden");
        }
        if (previewStage) {
            type === "correo" ? previewStage.classList.add("is-gmail") : previewStage.classList.remove("is-gmail");
            type === "popups" && currentMode === "mobile" ? previewStage.classList.add("is-mobile-view") : previewStage.classList.remove("is-mobile-view");
        }

        if (type === "popups") {
            updatePreview({}, currentMode);
        } else if (type === "whatsapp" && previewWhatsapp) {
            previewWhatsapp.classList.remove("hidden");
        } else if (type === "correo" && previewCorreo) {
            previewCorreo.classList.remove("hidden");
        }
    }

    tabPopups.onclick = () =>
        activarTab(tabPopups, contentPopups, "popups");
    tabWhatsapp.onclick = () =>
        activarTab(tabWhatsapp, contentWhatsapp, "whatsapp");
    tabCorreo.onclick = () =>
        activarTab(tabCorreo, contentCorreo, "correo");

    activarTab(tabPopups, contentPopups, "popups");

    btnDesktop.onclick = () => {
        currentMode = "desktop";
        btnDesktop.classList.remove(...inactiveModeClasses);
        btnDesktop.classList.add(...activeModeClasses);
        btnMobile.classList.remove(...activeModeClasses);
        btnMobile.classList.add(...inactiveModeClasses);
        if (previewStage) previewStage.classList.remove("is-mobile-view");
        updatePreview({}, "desktop");
    };

    btnMobile.onclick = () => {
        currentMode = "mobile";
        btnMobile.classList.remove(...inactiveModeClasses);
        btnMobile.classList.add(...activeModeClasses);
        btnDesktop.classList.remove(...activeModeClasses);
        btnDesktop.classList.add(...inactiveModeClasses);
        if (previewStage) previewStage.classList.add("is-mobile-view");
        updatePreview({}, "mobile");
    };

    window.addEventListener("resize", () => {
        const isNowMobile = window.innerWidth < 1024;
        if (isNowMobile && currentMode !== "mobile") {
            // Forzar modo móvil si la pantalla se reduce
            if (btnMobile) btnMobile.click();
        }
    });

    // SYNC INPUTS TO PREVIEW
    const textareaWhatsapp = document.getElementById(
        "whatsappMessage",
    ) as HTMLTextAreaElement;
    function formatWhatsAppTextToHTML(text: string | null) {
        if (!text) return "";
        let html = text;

        // Si el texto ya tiene formato HTML (del nuevo editor), no escapamos los tags
        const hasHTML = /<[a-z][\s\S]*>/i.test(html);

        if (!hasHTML) {
            // Escape basic tags only if it's plain text to prevent injection
            html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        // format whatsapp markdown
        html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
        html = html.replace(/_(.*?)_/g, "<em>$1</em>");
        html = html.replace(/~(.*?)~/g, "<del>$1</del>");
        html = html.replace(/\n/g, "<br>");
        return html;
    }

    textareaWhatsapp?.addEventListener("input", () => {
        if (previewWhatsappText)
            previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(textareaWhatsapp.value);
    });

    window.addEventListener("update-whatsapp-preview", (e: any) => {
        if (previewWhatsappText) {
            previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(e.detail);
        }
    });

    const emailTitle = document.getElementById(
        "emailTitle",
    ) as HTMLInputElement;
    const emailBody = document.getElementById(
        "emailBody",
    ) as HTMLTextAreaElement;
    const previewCorreoTitle =
        document.getElementById("previewCorreoTitle");
    const previewCorreoBody = document.getElementById("previewCorreoBody");
    emailTitle?.addEventListener("input", () => {
        if (previewCorreoTitle)
            previewCorreoTitle.textContent = emailTitle.value;
    });
    emailBody?.addEventListener("input", () => {
        if (previewCorreoBody)
            previewCorreoBody.textContent = emailBody.value;
    });

    // Colores del Botón
    const btnTextInput = document.getElementById("btnText") as HTMLInputElement;
    const btnBgColorInput = document.getElementById(
        "btnBgColor",
    ) as HTMLInputElement;
    const btnTextColorInput = document.getElementById(
        "btnTextColor",
    ) as HTMLInputElement;

    if (btnTextInput) {
        const handleBtnTextChange = () => {
            const val = btnTextInput.value;
            updatePreview({ button_text: val });
        };
        btnTextInput.addEventListener("input", handleBtnTextChange);
    }

    if (btnBgColorInput) {
        const handleBgChange = () => {
            const val = btnBgColorInput.value;
            updatePreview({ button_bg_color: val });
        };
        btnBgColorInput.addEventListener("input", handleBgChange);
        btnBgColorInput.addEventListener("change", handleBgChange);
    }

    if (btnTextColorInput) {
        const handleTextChange = () => {
            const val = btnTextColorInput.value;
            updatePreview({ button_text_color: val });
        };
        btnTextColorInput.addEventListener("input", handleTextChange);
        btnTextColorInput.addEventListener("change", handleTextChange);
    }

    // Botón Correo
    const emailBtnTextInput = document.getElementById("emailBtnText") as HTMLInputElement;
    const emailBtnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement;
    const emailBtnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement;
    const emailBtnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement;
    const previewEmailBtn = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;

    if (emailBtnTextInput) {
        const handleEmailBtnTextChange = () => {
            const val = emailBtnTextInput.value;
            if (previewEmailBtn) previewEmailBtn.textContent = val || "Ver Productos";
        };
        emailBtnTextInput.addEventListener("input", handleEmailBtnTextChange);
    }
    if (emailBtnLinkInput) {
        const handleEmailBtnLinkChange = () => {
            const val = emailBtnLinkInput.value;
            if (previewEmailBtn && 'href' in previewEmailBtn) previewEmailBtn.href = val || "#";
        };
        emailBtnLinkInput.addEventListener("input", handleEmailBtnLinkChange);
    }
    if (emailBtnBgColorInput) {
        const handleEmailBtnBgChange = () => {
            const val = emailBtnBgColorInput.value;
            if (previewEmailBtn) previewEmailBtn.style.backgroundColor = val;
        };
        emailBtnBgColorInput.addEventListener("input", handleEmailBtnBgChange);
        emailBtnBgColorInput.addEventListener("change", handleEmailBtnBgChange);
    }
    if (emailBtnTextColorInput) {
        const handleEmailBtnTextColChange = () => {
            const val = emailBtnTextColorInput.value;
            if (previewEmailBtn) previewEmailBtn.style.color = val;
        };
        emailBtnTextColorInput.addEventListener("input", handleEmailBtnTextColChange);
        emailBtnTextColorInput.addEventListener("change", handleEmailBtnTextColChange);
    }


    const popupInicioDelayInput = document.getElementById(
        "popupInicioDelay",
    ) as HTMLSelectElement;
    popupInicioDelayInput?.addEventListener("change", () => {
        const val = popupInicioDelayInput.value;
        updatePreview({
            popup_start_delay_minutes: parseInt(val),
        });
    });

    const popupProductosDelayInput = document.getElementById(
        "popupProductosDelay",
    ) as HTMLSelectElement;
    popupProductosDelayInput?.addEventListener("change", () => {
        const val = popupProductosDelayInput.value;
        updatePreview({
            product_popup_delay_minutes: parseInt(val),
        });
    });

    // IMAGE UPLOADS
    const popupImage1 = document.getElementById(
        "popupImage1",
    ) as HTMLInputElement;
    const popupImage2 = document.getElementById(
        "popupImage2",
    ) as HTMLInputElement;
    const popupImageMobile = document.getElementById(
        "popupImageMobile",
    ) as HTMLInputElement;
    const popupImageMobile2 = document.getElementById(
        "popupImageMobile2",
    ) as HTMLInputElement;
    const whatsappImage = document.getElementById(
        "whatsappImage",
    ) as HTMLInputElement;
    const emailImage = document.getElementById(
        "emailImage",
    ) as HTMLInputElement;

    const clearImage1 = document.getElementById("clearImage1");
    const clearImage2 = document.getElementById("clearImage2");
    const clearImageMobile = document.getElementById("clearImageMobile");
    const clearImageMobile2 = document.getElementById("clearImageMobile2");
    const clearEmailImage = document.getElementById("clearEmailImage");

    function handleImageUpload(
        input: HTMLInputElement,
        callback: (url: string | ArrayBuffer | null | undefined) => void,
    ) {
        if (input && input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => callback(e.target?.result);
            reader.readAsDataURL(input.files[0]);
        }
    }

    function bindImageEvents(
        inputId: string,
        clearBtnId: string,
        previewKey: string,
        storageKey: string,
        deleteId: string
    ) {
        const input = document.getElementById(inputId) as HTMLInputElement;
        const clearBtn = document.getElementById(clearBtnId);

        input?.addEventListener("change", function (this: HTMLInputElement) {
            handleImageUpload(this, (url) => {
                updatePreview({ [previewKey]: url as string });
                clearBtn?.classList.remove("hidden");
                const del = document.getElementById(deleteId) as HTMLInputElement;
                if (del) del.value = "0";
            });
        });

        clearBtn?.addEventListener("click", () => {
            if (input) input.value = "";
            updatePreview({ [previewKey]: null });
            clearBtn?.classList.add("hidden");
            const del = document.getElementById(deleteId) as HTMLInputElement;
            if (del) del.value = "1";
        });
    }

    bindImageEvents("popupImage1", "clearImage1", "popup_image_url", "popupImage", "delete_popupImage1");
    bindImageEvents("popupImage2", "clearImage2", "popup_image2_url", "popupImage2", "delete_popupImage2");
    bindImageEvents("popupImageMobile", "clearImageMobile", "popup_mobile_image_url", "popupImageMobile", "delete_popupImageMobile");
    bindImageEvents("popupImageMobile2", "clearImageMobile2", "popup_mobile_image2_url", "popupImageMobile2", "delete_popupImageMobile2");

    emailImage?.addEventListener("change", function () {
        handleImageUpload(this, (url) => {
            const previewImg = document.getElementById(
                "previewEmailImageThumb",
            );
            const container = document.getElementById(
                "previewEmailAttachementContainer",
            );
            if (previewImg && container) {
                previewImg.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
                container.classList.remove("hidden");
            }
            clearEmailImage?.classList.remove("hidden");
        });
    });
    clearEmailImage?.addEventListener("click", () => {
        if (emailImage) emailImage.value = "";
        const previewImg = document.getElementById(
            "previewEmailImageThumb",
        );
        const container = document.getElementById(
            "previewEmailAttachementContainer",
        );
        if (previewImg && container) {
            previewImg.innerHTML = "";
            container.classList.add("hidden");
        }
        if (clearEmailImage) clearEmailImage.classList.add("hidden");
        const del = document.getElementById(
            "delete_emailImage",
        ) as HTMLInputElement;
        if (del) del.value = "1";
    });

    // Event for Email Preview update from EmailEditor.tsx (Rich Text)
    window.addEventListener("update-email-preview", (e: any) => {
        const previewCorreoBody =
            document.getElementById("previewCorreoBody");
        if (previewCorreoBody) {
            previewCorreoBody.innerHTML = e.detail;
        }
    });

    whatsappImage?.addEventListener("change", function () {
        handleImageUpload(this, (url) => {
            const previewWAImg = document.getElementById(
                "previewWhatsappImageContainer",
            );
            if (previewWAImg) {
                previewWAImg.innerHTML = `<img src="${url}" class="w-full h-auto object-contain">`;
                previewWAImg.classList.remove("hidden");
            }
            document
                .getElementById("clearWhatsappImage")
                ?.classList.remove("hidden");
        });
    });

    document
        .getElementById("clearWhatsappImage")
        ?.addEventListener("click", () => {
            if (whatsappImage) whatsappImage.value = "";
            const previewWAImg = document.getElementById(
                "previewWhatsappImageContainer",
            );
            if (previewWAImg) {
                previewWAImg.innerHTML = "";
                previewWAImg.classList.add("hidden");
            }
            document
                .getElementById("clearWhatsappImage")
                ?.classList.add("hidden");
        });

    // LOAD SETTINGS FROM API
    async function loadSettings() {
        setStatus("Cargando...", "loading");
        try {
            const settings = (await getPopupSettings()) as any;
            if (settings) {
                if (btnBgColorInput)
                    btnBgColorInput.value =
                        settings.button_bg_color ||
                        settings.btnBgColor ||
                        "#14b8a6";
                if (btnTextColorInput)
                    btnTextColorInput.value =
                        settings.button_text_color ||
                        settings.btnTextColor ||
                        "#ffffff";

                if (btnTextInput) {
                    const bText = settings.button_text || settings.btnText || "CONOCER MAS";
                    btnTextInput.value = bText;
                }

                if (emailBtnTextInput) {
                    const text = settings.email_btn_text || settings.emailBtnText || "Ver Productos";
                    emailBtnTextInput.value = text;
                    if (previewEmailBtn) previewEmailBtn.textContent = text;
                }
                if (emailBtnLinkInput) {
                    const link = settings.email_btn_link || settings.emailBtnLink || "https://tami.com/productos";
                    emailBtnLinkInput.value = link;
                    if (previewEmailBtn && 'href' in previewEmailBtn) previewEmailBtn.href = link;
                }
                if (emailBtnBgColorInput) {
                    const bgCol = settings.email_btn_bg_color || settings.emailBtnBgColor || "#0b1c3c";
                    emailBtnBgColorInput.value = bgCol;
                    if (previewEmailBtn) previewEmailBtn.style.backgroundColor = bgCol;
                }
                if (emailBtnTextColorInput) {
                    const textCol = settings.email_btn_text_color || settings.emailBtnTextColor || "#ffffff";
                    emailBtnTextColorInput.value = textCol;
                    if (previewEmailBtn) previewEmailBtn.style.color = textCol;
                }
                if (popupInicioDelayInput)
                    popupInicioDelayInput.value = String(
                        settings.popup_start_delay_minutes ||
                        settings.popupInicioDelay ||
                        60,
                    );

                const popupProductosDelay = document.getElementById(
                    "popupProductosDelay",
                ) as HTMLSelectElement;
                if (popupProductosDelay)
                    popupProductosDelay.value = String(
                        settings.product_popup_delay_minutes ||
                        settings.popupProductosDelay ||
                        60,
                    );

                if (settings.whatsappMessage) {
                    const whatsappMessageHidden = document.getElementById(
                        "whatsappMessage",
                    ) as HTMLInputElement;
                    if (whatsappMessageHidden) {
                        whatsappMessageHidden.value = settings.whatsappMessage;
                    }

                    if (previewWhatsappText) {
                        previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(settings.whatsappMessage);
                    }

                    window.dispatchEvent(
                        new CustomEvent("update-whatsapp-editor", {
                            detail: settings.whatsappMessage,
                        }),
                    );
                }

                const emailTitleInput = document.getElementById(
                    "emailTitle",
                ) as HTMLInputElement;
                if (emailTitleInput && settings.emailTitle) {
                    emailTitleInput.value = settings.emailTitle;
                    if (previewCorreoTitle)
                        previewCorreoTitle.textContent =
                            settings.emailTitle;
                }

                if (settings.whatsappImage) {
                    const previewWAImg = document.getElementById(
                        "previewWhatsappImageContainer",
                    );
                    if (previewWAImg) {
                        previewWAImg.innerHTML = `<img src="${settings.whatsappImage}" class="w-full h-auto object-contain">`;
                        previewWAImg.classList.remove("hidden");
                    }
                    document
                        .getElementById("clearWhatsappImage")
                        ?.classList.remove("hidden");
                }

                if (settings.emailImage) {
                    const previewImg = document.getElementById(
                        "previewEmailImageThumb",
                    );
                    const container = document.getElementById(
                        "previewEmailAttachementContainer",
                    );
                    if (previewImg && container) {
                        previewImg.innerHTML = `<img src="${settings.emailImage}" class="w-full h-full object-cover">`;
                        container.classList.remove("hidden");
                    }
                    if (clearEmailImage) clearEmailImage.classList.remove("hidden");
                }

                if (settings.emailBody) {
                    const previewCorreoBody =
                        document.getElementById("previewCorreoBody");
                    if (previewCorreoBody) {
                        previewCorreoBody.innerHTML = settings.emailBody;
                    }
                    window.dispatchEvent(
                        new CustomEvent("update-email-editor", {
                            detail: settings.emailBody,
                        }),
                    );
                }

                const restoreImg = (url: string | null, key: string, clearId: string) => {
                    if (url) {
                        updatePreview({ [key]: url });
                        document.getElementById(clearId)?.classList.remove("hidden");
                    }
                };

                restoreImg(settings.image1, "popup_image_url", "clearImage1");
                restoreImg(settings.image2, "popup_image2_url", "clearImage2");
                restoreImg(settings.imageMobile, "popup_mobile_image_url", "clearImageMobile");
                restoreImg(settings.imageMobile2, "popup_mobile_image2_url", "clearImageMobile2");

                updatePreview({
                    button_bg_color: settings.button_bg_color,
                    button_text_color: settings.button_text_color,
                    button_text: settings.button_text || "CONOCER MAS",
                    popup_start_delay_minutes: settings.popup_start_delay_minutes,
                    product_popup_delay_minutes: settings.product_popup_delay_minutes,
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
    const btnGuardarPopups = document.getElementById(
        "btnGuardarPopups",
    ) as HTMLButtonElement | null;
    btnGuardarPopups?.addEventListener("click", async () => {
        if (!btnGuardarPopups) return;
        const originalText = btnGuardarPopups.innerText;
        btnGuardarPopups.innerText = "Guardando...";
        btnGuardarPopups.disabled = true;
        setStatus("Guardando cambios...", "loading");

        try {
            const bgColor = btnBgColorInput?.value || "#14b8a6";
            const textColor = btnTextColorInput?.value || "#ffffff";
            const delay = parseInt(popupInicioDelayInput?.value || "60");
            const productDelay = parseInt(
                popupProductosDelayInput?.value || "60",
            );

            if (!isHexColor(bgColor) || !isHexColor(textColor)) {
                throw new Error("Colores no válidos.");
            }

            const formData = new FormData();
            formData.append("button_bg_color", bgColor);
            formData.append("button_text_color", textColor);
            if (btnTextInput) {
                formData.append("button_text", btnTextInput.value);
            }
            formData.append("popup_start_delay_minutes", delay.toString());

            const popupProductosDelay = document.getElementById(
                "popupProductosDelay",
            ) as HTMLSelectElement;
            if (popupProductosDelay)
                formData.append(
                    "product_popup_delay_minutes",
                    popupProductosDelay.value,
                );

            const whatsappMessage = document.getElementById(
                "whatsappMessage",
            ) as HTMLInputElement;
            if (whatsappMessage)
                formData.append("whatsappMessage", whatsappMessage.value);
            formData.append("whatsapp_enabled", "1");

            const emailTitle = document.getElementById(
                "emailTitle",
            ) as HTMLInputElement;
            const emailBodyInput = document.getElementById(
                "emailBody",
            ) as HTMLInputElement;
            if (emailTitle) formData.append("emailTitle", emailTitle.value);
            if (emailBodyInput) {
                formData.append("emailBody", emailBodyInput.value);
            }
            formData.append("email_enabled", "1");

            if (emailBtnTextInput) formData.append("email_btn_text", emailBtnTextInput.value);
            if (emailBtnLinkInput) formData.append("email_btn_link", emailBtnLinkInput.value);
            if (emailBtnBgColorInput) formData.append("email_btn_bg_color", emailBtnBgColorInput.value);
            if (emailBtnTextColorInput) formData.append("email_btn_text_color", emailBtnTextColorInput.value);

            const addFile = (id: string, name: string) => {
                const input = document.getElementById(
                    id,
                ) as HTMLInputElement;
                if (input && input.files && input.files.length > 0) {
                    formData.append(name, input.files[0]);
                } else {
                    const deleteInput = document.getElementById(
                        "delete_" + id,
                    ) as HTMLInputElement;
                    if (deleteInput && deleteInput.value === "1") {
                        formData.append("delete_" + name, "1");
                    }
                }
            };

            addFile("popupImage1", "image1");
            addFile("popupImage2", "image2");
            addFile("popupImageMobile", "imageMobile");
            addFile("popupImageMobile2", "imageMobile2");
            addFile("whatsappImage", "whatsappImage");
            addFile("emailImage", "emailImage");

            await updatePopupSettingsFormData(formData);

            setStatus("¡Guardado exitosamente!", "success");

            // Limpiar almacenamiento local temporal después de guardar
            const keysToRemove = [
                "popupBtnText", "popupBtnBgColor", "popupBtnTextColor",
                "emailBtnText", "emailBtnLink", "emailBtnBgColor", "emailBtnTextColor",
                "popupDelay", "popupProductDelay",
                "popupImage", "popupImage2", "popupImageMobile", "popupImageMobile2"
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));

            setTimeout(() => {
                setStatus("", "idle");
            }, 3000);
        } catch (error: any) {
            console.error(error);
            const errMessage =
                error instanceof Error ? error.message : String(error);
            setStatus("Error al guardar: " + errMessage, "error");
        } finally {
            btnGuardarPopups.innerText = originalText;
            btnGuardarPopups.disabled = false;
        }
    });

}
