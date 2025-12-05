/**
 * i18n - Internationalization system
 *
 * Provides multi-language support for GitGame
 *
 * Usage:
 *   import { i18n } from './utils/i18n.js';
 *
 *   i18n.setLanguage('es');
 *   const text = i18n.t('menu.play');
 *   const formatted = i18n.t('score.final', { score: 100 });
 */

import { logger } from './Logger.js';

class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.translations = {};
        this.loadedLanguages = new Set();

        // Load default language
        this.loadTranslations();

        logger.info('i18n', 'i18n initialized', {
            language: this.currentLanguage
        });
    }

    /**
     * Load translations from embedded data
     */
    loadTranslations() {
        // English (default)
        this.translations.en = {
            menu: {
                play: 'Play',
                settings: 'Settings',
                quit: 'Quit',
                back: 'Back to Menu'
            },
            game: {
                paused: 'Paused',
                gameOver: 'Game Over',
                score: 'Score',
                highScore: 'High Score',
                level: 'Level',
                lives: 'Lives'
            },
            modes: {
                gitSurvivor: 'Git Survivor',
                codeDefense: 'Code Defense',
                prRush: 'PR Rush',
                devCommander: 'Dev Commander'
            },
            score: {
                final: 'Final Score: {{score}}',
                enemies: 'Enemies Defeated: {{count}}',
                time: 'Time Survived: {{time}}'
            },
            powerups: {
                health: 'Health Boost',
                speed: 'Speed Boost',
                damage: 'Damage Boost',
                shield: 'Shield'
            },
            messages: {
                loading: 'Loading...',
                error: 'An error occurred',
                retry: 'Retry',
                success: 'Success!',
                saved: 'Game Saved',
                loaded: 'Game Loaded'
            },
            humor: {
                gitConflict: 'Merge conflict incoming!',
                memoryLeak: 'Memory leak detected!',
                nullPointer: 'Null pointer exception!',
                stackoverflow: 'Stack overflow!',
                worksOnMyMachine: 'But it works on my machine...'
            }
        };

        // Spanish
        this.translations.es = {
            menu: {
                play: 'Jugar',
                settings: 'Configuración',
                quit: 'Salir',
                back: 'Volver al Menú'
            },
            game: {
                paused: 'Pausado',
                gameOver: 'Fin del Juego',
                score: 'Puntuación',
                highScore: 'Puntuación Máxima',
                level: 'Nivel',
                lives: 'Vidas'
            },
            modes: {
                gitSurvivor: 'Git Survivor',
                codeDefense: 'Defensa de Código',
                prRush: 'Prisa de PR',
                devCommander: 'Comandante Dev'
            },
            score: {
                final: 'Puntuación Final: {{score}}',
                enemies: 'Enemigos Derrotados: {{count}}',
                time: 'Tiempo Sobrevivido: {{time}}'
            },
            powerups: {
                health: 'Impulso de Salud',
                speed: 'Impulso de Velocidad',
                damage: 'Impulso de Daño',
                shield: 'Escudo'
            },
            messages: {
                loading: 'Cargando...',
                error: 'Ocurrió un error',
                retry: 'Reintentar',
                success: '¡Éxito!',
                saved: 'Juego Guardado',
                loaded: 'Juego Cargado'
            },
            humor: {
                gitConflict: '¡Conflicto de fusión entrante!',
                memoryLeak: '¡Fuga de memoria detectada!',
                nullPointer: '¡Excepción de puntero nulo!',
                stackoverflow: '¡Desbordamiento de pila!',
                worksOnMyMachine: 'Pero funciona en mi máquina...'
            }
        };

        // French
        this.translations.fr = {
            menu: {
                play: 'Jouer',
                settings: 'Paramètres',
                quit: 'Quitter',
                back: 'Retour au Menu'
            },
            game: {
                paused: 'En Pause',
                gameOver: 'Fin du Jeu',
                score: 'Score',
                highScore: 'Meilleur Score',
                level: 'Niveau',
                lives: 'Vies'
            },
            modes: {
                gitSurvivor: 'Git Survivor',
                codeDefense: 'Défense de Code',
                prRush: 'Rush PR',
                devCommander: 'Commandant Dev'
            },
            score: {
                final: 'Score Final: {{score}}',
                enemies: 'Ennemis Vaincus: {{count}}',
                time: 'Temps Survécu: {{time}}'
            },
            powerups: {
                health: 'Boost de Santé',
                speed: 'Boost de Vitesse',
                damage: 'Boost de Dégâts',
                shield: 'Bouclier'
            },
            messages: {
                loading: 'Chargement...',
                error: 'Une erreur s\'est produite',
                retry: 'Réessayer',
                success: 'Succès!',
                saved: 'Jeu Sauvegardé',
                loaded: 'Jeu Chargé'
            },
            humor: {
                gitConflict: 'Conflit de fusion en approche!',
                memoryLeak: 'Fuite de mémoire détectée!',
                nullPointer: 'Exception pointeur nul!',
                stackoverflow: 'Débordement de pile!',
                worksOnMyMachine: 'Mais ça marche sur ma machine...'
            }
        };

        // German
        this.translations.de = {
            menu: {
                play: 'Spielen',
                settings: 'Einstellungen',
                quit: 'Beenden',
                back: 'Zurück zum Menü'
            },
            game: {
                paused: 'Pausiert',
                gameOver: 'Spiel Vorbei',
                score: 'Punktzahl',
                highScore: 'Highscore',
                level: 'Level',
                lives: 'Leben'
            },
            modes: {
                gitSurvivor: 'Git Survivor',
                codeDefense: 'Code-Verteidigung',
                prRush: 'PR-Ansturm',
                devCommander: 'Dev-Kommandant'
            },
            score: {
                final: 'Endpunktzahl: {{score}}',
                enemies: 'Besiegte Feinde: {{count}}',
                time: 'Überlebte Zeit: {{time}}'
            },
            powerups: {
                health: 'Gesundheitsschub',
                speed: 'Geschwindigkeitsschub',
                damage: 'Schadensschub',
                shield: 'Schild'
            },
            messages: {
                loading: 'Lädt...',
                error: 'Ein Fehler ist aufgetreten',
                retry: 'Wiederholen',
                success: 'Erfolg!',
                saved: 'Spiel Gespeichert',
                loaded: 'Spiel Geladen'
            },
            humor: {
                gitConflict: 'Merge-Konflikt im Anmarsch!',
                memoryLeak: 'Speicherleck erkannt!',
                nullPointer: 'Null-Zeiger-Ausnahme!',
                stackoverflow: 'Stack-Überlauf!',
                worksOnMyMachine: 'Aber auf meiner Maschine funktioniert es...'
            }
        };

        this.loadedLanguages.add('en');
        this.loadedLanguages.add('es');
        this.loadedLanguages.add('fr');
        this.loadedLanguages.add('de');
    }

    /**
     * Set current language
     */
    setLanguage(languageCode) {
        if (!this.translations[languageCode]) {
            logger.warn('i18n', 'Language not available, using fallback', {
                requested: languageCode,
                fallback: this.fallbackLanguage
            });
            return;
        }

        this.currentLanguage = languageCode;

        // Save to localStorage
        try {
            localStorage.setItem('language', languageCode);
        } catch (error) {
            logger.warn('i18n', 'Could not save language preference', { error });
        }

        logger.info('i18n', 'Language changed', { language: languageCode });
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     */
    getAvailableLanguages() {
        return [
            { code: 'en', name: 'English', native: 'English' },
            { code: 'es', name: 'Spanish', native: 'Español' },
            { code: 'fr', name: 'French', native: 'Français' },
            { code: 'de', name: 'German', native: 'Deutsch' }
        ];
    }

    /**
     * Translate a key
     * Supports nested keys with dot notation and variable interpolation
     */
    t(key, variables = {}) {
        const translation = this.getTranslation(key);

        if (translation === null) {
            logger.warn('i18n', 'Translation missing', {
                key,
                language: this.currentLanguage
            });
            return key;
        }

        // Replace variables in translation
        return this.interpolate(translation, variables);
    }

    /**
     * Get translation for a key
     */
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        // Traverse nested object
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Try fallback language
                value = this.translations[this.fallbackLanguage];
                for (const fk of keys) {
                    if (value && typeof value === 'object' && fk in value) {
                        value = value[fk];
                    } else {
                        return null;
                    }
                }
                break;
            }
        }

        return typeof value === 'string' ? value : null;
    }

    /**
     * Interpolate variables in translation string
     */
    interpolate(text, variables) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? variables[key] : match;
        });
    }

    /**
     * Detect browser language
     */
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0]; // Get 'en' from 'en-US'

        if (this.translations[langCode]) {
            this.setLanguage(langCode);
        }

        return langCode;
    }

    /**
     * Load language from localStorage
     */
    loadSavedLanguage() {
        try {
            const saved = localStorage.getItem('language');
            if (saved && this.translations[saved]) {
                this.setLanguage(saved);
                return saved;
            }
        } catch (error) {
            logger.warn('i18n', 'Could not load saved language', { error });
        }

        return null;
    }
}

// Export singleton instance
export const i18n = new I18n();
export default I18n;
