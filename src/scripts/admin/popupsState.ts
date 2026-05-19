export type WhatsappMessageKey = "1" | "2" | "3";


export const currentInicioImages: any = {
    popup_image_url: null,
    popup_image2_url: null,
    popup_mobile_image_url: null,
    popup_mobile_image2_url: null,
    whatsappImage: null,
    whatsappImage2: null,
    whatsappImage3: null,
    emailImage: null,
};

export const whatsappData: Record<WhatsappMessageKey, { text: string; image: string | null }> = {
    "1": { text: "", image: null },
    "2": { text: "", image: null },
    "3": { text: "", image: null },
};

export const emailsState: any = {
    "1": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" },
    "2": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" },
    "3": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" },
};

export const sharedState: any = {
    currentMode: window.innerWidth < 1024 ? "mobile" : "desktop",
    currentSelectedWaMessage: "1",
    currentEmailIdx: "1",
    savedHomeSettings: null,
};
