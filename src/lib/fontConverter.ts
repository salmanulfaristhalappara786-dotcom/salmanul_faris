/**
 * Basic Unicode-to-MLTT (Malayalam Legacy) Converter
 * Used for legacy fonts like ML-TT-Revathi, ML-TT-Karthika, etc.
 */

export const unicodeToMltt = (text: string): string => {
    if (!text) return "";

    // Mapping for common vowels and consonants
    // This is a simplified version of the ML-TT (Kartika/Revathi) mapping
    const mappings: Record<string, string> = {
        'അ': 'A', 'ആ': 'B', 'ഇ': 'C', 'ഈ': 'D', 'ഉ': 'E', 'ഊ': 'F', 'ഋ': 'G', 'എ': 'H', 'ഏ': 'I', 'ഐ': 'J', 'ഒ': 'K', 'ഓ': 'L', 'ഔ': 'M',
        'ക': 'N', 'ഖ': 'O', 'ഗ': 'P', 'ഘ': 'Q', 'ങ': 'R',
        'ച': 'S', 'ഛ': 'T', 'ജ': 'U', '展示': 'V', 'ഞ': 'W',
        'ട': 'X', 'ഠ': 'Y', 'ഡ': 'Z', 'ഢ': '[', 'ണ': '\\',
        'ത': 'a', 'ഥ': 'b', 'ദ': 'c', 'ധ': 'd', 'ന': 'e',
        'പ': 'f', 'ഫ': 'g', 'ബ': 'h', 'ഭ': 'i', 'മ': 'j',
        'യ': 'k', 'ര': 'l', 'ല': 'm', 'വ': 'n', 'ശ': 'o', 'ഷ': 'p', 'സ': 'q', 'ഹ': 'r', 'ള': 's', 'ഴ': 't', 'റ': 'u',
        
        // Vowel signs (Matras)
        'ാ': 'v', 'ി': 'w', 'ീ': 'x', 'ു': 'y', 'ൂ': 'z', 'ൃ': '{', 'െ': '|', 'േ': '}', 'ൈ': '~', 'ൊ': '!', 'ോ': '@', 'ൗ': '#',
        
        // Chillu letters
        'ൻ': 'e\\', 'ർ': 'l\\', 'ൽ': 'm\\', 'ൾ': 's\\', 'ൺ': '\\\\', 'ക്': 'N\\',
        
        // Chandrakkala
        '്': '\\'
    };

    // Note: Legacy fonts are extremely complex because of positioning.
    // This basic mapping works for simple letters but might need adjustment for complex ligatures.
    
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        result += mappings[char] || char;
    }

    return result;
};
