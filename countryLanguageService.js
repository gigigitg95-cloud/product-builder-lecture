/**
 * Country Language Service
 * Provides data about countries and their official/spoken languages
 */

const countryLanguages = [
    { country: "Afghanistan", code: "AF", languages: ["Pashto", "Dari"] },
    { country: "Albania", code: "AL", languages: ["Albanian"] },
    { country: "Algeria", code: "DZ", languages: ["Arabic", "Berber"] },
    { country: "Argentina", code: "AR", languages: ["Spanish"] },
    { country: "Australia", code: "AU", languages: ["English"] },
    { country: "Austria", code: "AT", languages: ["German"] },
    { country: "Bangladesh", code: "BD", languages: ["Bengali"] },
    { country: "Belgium", code: "BE", languages: ["Dutch", "French", "German"] },
    { country: "Brazil", code: "BR", languages: ["Portuguese"] },
    { country: "Bulgaria", code: "BG", languages: ["Bulgarian"] },
    { country: "Cambodia", code: "KH", languages: ["Khmer"] },
    { country: "Canada", code: "CA", languages: ["English", "French"] },
    { country: "Chile", code: "CL", languages: ["Spanish"] },
    { country: "China", code: "CN", languages: ["Mandarin Chinese"] },
    { country: "Colombia", code: "CO", languages: ["Spanish"] },
    { country: "Croatia", code: "HR", languages: ["Croatian"] },
    { country: "Cuba", code: "CU", languages: ["Spanish"] },
    { country: "Czech Republic", code: "CZ", languages: ["Czech"] },
    { country: "Denmark", code: "DK", languages: ["Danish"] },
    { country: "Egypt", code: "EG", languages: ["Arabic"] },
    { country: "Estonia", code: "EE", languages: ["Estonian"] },
    { country: "Ethiopia", code: "ET", languages: ["Amharic", "Oromo", "Tigrinya"] },
    { country: "Finland", code: "FI", languages: ["Finnish", "Swedish"] },
    { country: "France", code: "FR", languages: ["French"] },
    { country: "Germany", code: "DE", languages: ["German"] },
    { country: "Greece", code: "GR", languages: ["Greek"] },
    { country: "Hungary", code: "HU", languages: ["Hungarian"] },
    { country: "Iceland", code: "IS", languages: ["Icelandic"] },
    { country: "India", code: "IN", languages: ["Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu"] },
    { country: "Indonesia", code: "ID", languages: ["Indonesian"] },
    { country: "Iran", code: "IR", languages: ["Persian"] },
    { country: "Iraq", code: "IQ", languages: ["Arabic", "Kurdish"] },
    { country: "Ireland", code: "IE", languages: ["Irish", "English"] },
    { country: "Israel", code: "IL", languages: ["Hebrew", "Arabic"] },
    { country: "Italy", code: "IT", languages: ["Italian"] },
    { country: "Japan", code: "JP", languages: ["Japanese"] },
    { country: "Jordan", code: "JO", languages: ["Arabic"] },
    { country: "Kazakhstan", code: "KZ", languages: ["Kazakh", "Russian"] },
    { country: "Kenya", code: "KE", languages: ["Swahili", "English"] },
    { country: "South Korea", code: "KR", languages: ["Korean"] },
    { country: "Kuwait", code: "KW", languages: ["Arabic"] },
    { country: "Laos", code: "LA", languages: ["Lao"] },
    { country: "Latvia", code: "LV", languages: ["Latvian"] },
    { country: "Lebanon", code: "LB", languages: ["Arabic"] },
    { country: "Lithuania", code: "LT", languages: ["Lithuanian"] },
    { country: "Luxembourg", code: "LU", languages: ["Luxembourgish", "French", "German"] },
    { country: "Malaysia", code: "MY", languages: ["Malay"] },
    { country: "Mexico", code: "MX", languages: ["Spanish"] },
    { country: "Mongolia", code: "MN", languages: ["Mongolian"] },
    { country: "Morocco", code: "MA", languages: ["Arabic", "Berber"] },
    { country: "Myanmar", code: "MM", languages: ["Burmese"] },
    { country: "Nepal", code: "NP", languages: ["Nepali"] },
    { country: "Netherlands", code: "NL", languages: ["Dutch"] },
    { country: "New Zealand", code: "NZ", languages: ["English", "Maori"] },
    { country: "Nigeria", code: "NG", languages: ["English", "Hausa", "Yoruba", "Igbo"] },
    { country: "Norway", code: "NO", languages: ["Norwegian"] },
    { country: "Pakistan", code: "PK", languages: ["Urdu", "English"] },
    { country: "Peru", code: "PE", languages: ["Spanish", "Quechua", "Aymara"] },
    { country: "Philippines", code: "PH", languages: ["Filipino", "English"] },
    { country: "Poland", code: "PL", languages: ["Polish"] },
    { country: "Portugal", code: "PT", languages: ["Portuguese"] },
    { country: "Qatar", code: "QA", languages: ["Arabic"] },
    { country: "Romania", code: "RO", languages: ["Romanian"] },
    { country: "Russia", code: "RU", languages: ["Russian"] },
    { country: "Saudi Arabia", code: "SA", languages: ["Arabic"] },
    { country: "Serbia", code: "RS", languages: ["Serbian"] },
    { country: "Singapore", code: "SG", languages: ["English", "Malay", "Mandarin", "Tamil"] },
    { country: "Slovakia", code: "SK", languages: ["Slovak"] },
    { country: "Slovenia", code: "SI", languages: ["Slovenian"] },
    { country: "South Africa", code: "ZA", languages: ["Afrikaans", "English", "Zulu", "Xhosa", "Sotho"] },
    { country: "Spain", code: "ES", languages: ["Spanish", "Catalan", "Galician", "Basque"] },
    { country: "Sri Lanka", code: "LK", languages: ["Sinhala", "Tamil"] },
    { country: "Sweden", code: "SE", languages: ["Swedish"] },
    { country: "Switzerland", code: "CH", languages: ["German", "French", "Italian", "Romansh"] },
    { country: "Syria", code: "SY", languages: ["Arabic"] },
    { country: "Taiwan", code: "TW", languages: ["Mandarin Chinese"] },
    { country: "Thailand", code: "TH", languages: ["Thai"] },
    { country: "Turkey", code: "TR", languages: ["Turkish"] },
    { country: "Ukraine", code: "UA", languages: ["Ukrainian"] },
    { country: "United Arab Emirates", code: "AE", languages: ["Arabic"] },
    { country: "United Kingdom", code: "GB", languages: ["English"] },
    { country: "United States", code: "US", languages: ["English"] },
    { country: "Uruguay", code: "UY", languages: ["Spanish"] },
    { country: "Uzbekistan", code: "UZ", languages: ["Uzbek"] },
    { country: "Venezuela", code: "VE", languages: ["Spanish"] },
    { country: "Vietnam", code: "VN", languages: ["Vietnamese"] },
    { country: "Yemen", code: "YE", languages: ["Arabic"] },
    { country: "Zimbabwe", code: "ZW", languages: ["English", "Shona", "Ndebele"] }
];

/**
 * Country Language Service
 */
const CountryLanguageService = {
    /**
     * Get all countries with their languages
     * @returns {Array} Array of country objects with code and languages
     */
    getAllCountries() {
        return countryLanguages;
    },

    /**
     * Get languages for a specific country
     * @param {string} countryName - Name of the country
     * @returns {Array|null} Array of languages or null if country not found
     */
    getLanguagesByCountry(countryName) {
        const country = countryLanguages.find(
            c => c.country.toLowerCase() === countryName.toLowerCase()
        );
        return country ? country.languages : null;
    },

    /**
     * Get languages by country code
     * @param {string} countryCode - Two-letter country code (ISO 3166-1 alpha-2)
     * @returns {Array|null} Array of languages or null if country not found
     */
    getLanguagesByCode(countryCode) {
        const country = countryLanguages.find(
            c => c.code.toUpperCase() === countryCode.toUpperCase()
        );
        return country ? country.languages : null;
    },

    /**
     * Find countries that speak a specific language
     * @param {string} language - Language name
     * @returns {Array} Array of country names that speak the language
     */
    getCountriesByLanguage(language) {
        return countryLanguages
            .filter(c => c.languages.some(
                l => l.toLowerCase() === language.toLowerCase()
            ))
            .map(c => c.country);
    },

    /**
     * Search countries by name (partial match)
     * @param {string} searchTerm - Search term
     * @returns {Array} Array of matching country objects
     */
    searchCountries(searchTerm) {
        const term = searchTerm.toLowerCase();
        return countryLanguages.filter(c =>
            c.country.toLowerCase().includes(term)
        );
    },

    /**
     * Get total number of countries
     * @returns {number} Total count of countries
     */
    getCountryCount() {
        return countryLanguages.length;
    },

    /**
     * Get all unique languages
     * @returns {Array} Sorted array of unique language names
     */
    getAllLanguages() {
        const languages = new Set();
        countryLanguages.forEach(c => {
            c.languages.forEach(l => languages.add(l));
        });
        return Array.from(languages).sort();
    },

    /**
     * Get a random country
     * @returns {Object} Random country object
     */
    getRandomCountry() {
        const randomIndex = Math.floor(Math.random() * countryLanguages.length);
        return countryLanguages[randomIndex];
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryLanguageService;
}
