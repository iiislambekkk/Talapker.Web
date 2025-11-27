
const createMultiLingualFormConfig = (
    label: string,
    placeholder: string,
    customTranslations?: {
        en?: { label?: string; placeholder?: string };
        kk?: { label?: string; placeholder?: string };
        ru?: { label?: string; placeholder?: string };
    }
) => {
    return [
        {
            code: "en" as const,
            label: customTranslations?.en?.label || `${label} in English`,
            placeholder: customTranslations?.en?.placeholder || `${placeholder} in English`
        },
        {
            code: "kk" as const,
            label: customTranslations?.kk?.label || `${label} қазақша`,
            placeholder: customTranslations?.kk?.placeholder || `${placeholder} қазақша`
        },
        {
            code: "ru" as const,
            label: customTranslations?.ru?.label || `${label} на русском`,
            placeholder: customTranslations?.ru?.placeholder || `${placeholder} на русском`
        },
    ];
};

export default createMultiLingualFormConfig;