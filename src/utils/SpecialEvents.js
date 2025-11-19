// Special Events System - Seasonal events, timed challenges, and bonuses

import { gameData } from './GameData.js';

export default class SpecialEvents {
    constructor() {
        this.activeEvents = [];
        this.checkEvents();
    }

    // Check and activate current events
    checkEvents() {
        const now = new Date();
        const events = this.getAllEvents();

        this.activeEvents = events.filter(event => this.isEventActive(event, now));

        // Save active events to game data
        if (!gameData.data.events) {
            gameData.data.events = {
                completed: [],
                rewards: []
            };
        }

        return this.activeEvents;
    }

    // All special events
    getAllEvents() {
        return [
            // Seasonal Events
            {
                id: 'halloween',
                name: '🎃 Hackoween',
                description: 'Spooky bugs haunt the codebase!',
                type: 'seasonal',
                startMonth: 10,
                startDay: 20,
                endMonth: 10,
                endDay: 31,
                bonuses: {
                    scoreMultiplier: 1.5,
                    spawnRate: 1.3,
                    specialEnemies: true,
                    theme: 'halloween'
                },
                rewards: {
                    coins: 1000,
                    skin: 'vampire'
                }
            },
            {
                id: 'christmas',
                name: '🎄 Code Mas',
                description: 'Santa brings bug fixes!',
                type: 'seasonal',
                startMonth: 12,
                startDay: 15,
                endMonth: 12,
                endDay: 31,
                bonuses: {
                    scoreMultiplier: 2.0,
                    powerUpChance: 2.0,
                    specialPowerUps: true,
                    theme: 'christmas'
                },
                rewards: {
                    coins: 2000,
                    trail: 'snowflake'
                }
            },
            {
                id: 'newyear',
                name: '🎊 New Year Reset',
                description: 'Fresh commits, fresh start!',
                type: 'seasonal',
                startMonth: 1,
                startDay: 1,
                endMonth: 1,
                endDay: 7,
                bonuses: {
                    scoreMultiplier: 1.5,
                    xpBoost: 2.0,
                    allPowerUpsUnlocked: true
                },
                rewards: {
                    coins: 1500,
                    color: 'gold'
                }
            },
            {
                id: 'aprilfools',
                name: '😜 April Fools',
                description: 'Everything is backwards!',
                type: 'seasonal',
                startMonth: 4,
                startDay: 1,
                endMonth: 4,
                endDay: 1,
                bonuses: {
                    chaos: true,
                    randomEffects: true,
                    funnyMode: true
                },
                rewards: {
                    coins: 500,
                    achievement: 'fool'
                }
            },

            // Weekend Events
            {
                id: 'weekend_warrior',
                name: '⚔️ Weekend Warrior',
                description: 'Double XP on weekends!',
                type: 'recurring',
                dayOfWeek: [0, 6], // Saturday and Sunday
                bonuses: {
                    xpBoost: 2.0,
                    scoreMultiplier: 1.5
                },
                rewards: {
                    coins: 200
                }
            },

            // Monthly Events
            {
                id: 'first_friday',
                name: '🎉 Feature Friday',
                description: 'First Friday of the month - ship it!',
                type: 'monthly',
                dayOfMonth: [1, 2, 3, 4, 5, 6, 7], // First week
                dayOfWeek: [5], // Friday
                bonuses: {
                    scoreMultiplier: 2.0,
                    unlockAllModes: true
                },
                rewards: {
                    coins: 500
                }
            },

            // Hourly Events
            {
                id: 'happy_hour',
                name: '☕ Happy Hour',
                description: 'Coffee break time! (3-4 PM)',
                type: 'hourly',
                startHour: 15,
                endHour: 16,
                bonuses: {
                    coffeeBonus: 2.0,
                    energyRestore: true
                },
                rewards: {
                    coins: 50
                }
            },
            {
                id: 'midnight_coder',
                name: '🌙 Midnight Coder',
                description: 'Night owl mode! (12-4 AM)',
                type: 'hourly',
                startHour: 0,
                endHour: 4,
                bonuses: {
                    scoreMultiplier: 1.8,
                    darkMode: true
                },
                rewards: {
                    coins: 300,
                    skin: 'vampire'
                }
            },

            // Special Themed Events
            {
                id: 'bug_bounty',
                name: '🐛 Bug Bounty Week',
                description: 'Extra rewards for squashing bugs!',
                type: 'timed',
                probability: 0.1, // 10% chance per week
                duration: 7, // days
                bonuses: {
                    enemyRewards: 2.0,
                    scoreMultiplier: 1.5
                },
                rewards: {
                    coins: 1000
                }
            },
            {
                id: 'security_audit',
                name: '🔒 Security Audit',
                description: 'PR Rush gets extra security challenges!',
                type: 'timed',
                probability: 0.15,
                duration: 3,
                bonuses: {
                    prRushBonus: true,
                    securityFocus: true
                },
                rewards: {
                    coins: 800,
                    achievement: 'security_expert'
                }
            },
            {
                id: 'deploy_day',
                name: '🚀 Deployment Day',
                description: 'Ship to production!',
                type: 'timed',
                probability: 0.2,
                duration: 1,
                bonuses: {
                    deploymentBonus: 3.0,
                    successRewards: 2.0
                },
                rewards: {
                    coins: 500
                }
            }
        ];
    }

    // Check if event is currently active
    isEventActive(event, now = new Date()) {
        switch (event.type) {
            case 'seasonal':
                return this.checkSeasonalEvent(event, now);

            case 'recurring':
                return this.checkRecurringEvent(event, now);

            case 'monthly':
                return this.checkMonthlyEvent(event, now);

            case 'hourly':
                return this.checkHourlyEvent(event, now);

            case 'timed':
                return this.checkTimedEvent(event, now);

            default:
                return false;
        }
    }

    // Check seasonal events (month/day based)
    checkSeasonalEvent(event, now) {
        const month = now.getMonth() + 1; // 0-indexed
        const day = now.getDate();

        if (event.startMonth === event.endMonth) {
            return month === event.startMonth &&
                   day >= event.startDay &&
                   day <= event.endDay;
        } else {
            // Cross-month event
            return (month === event.startMonth && day >= event.startDay) ||
                   (month === event.endMonth && day <= event.endDay) ||
                   (month > event.startMonth && month < event.endMonth);
        }
    }

    // Check recurring events (day of week)
    checkRecurringEvent(event, now) {
        const dayOfWeek = now.getDay();
        return event.dayOfWeek.includes(dayOfWeek);
    }

    // Check monthly events
    checkMonthlyEvent(event, now) {
        const dayOfMonth = now.getDate();
        const dayOfWeek = now.getDay();

        return event.dayOfMonth.includes(dayOfMonth) &&
               event.dayOfWeek.includes(dayOfWeek);
    }

    // Check hourly events
    checkHourlyEvent(event, now) {
        const hour = now.getHours();
        return hour >= event.startHour && hour < event.endHour;
    }

    // Check timed events (random activation with persistence)
    checkTimedEvent(event, now) {
        // Check if event is stored as active
        if (gameData.data.events && gameData.data.events.active) {
            const activeEvent = gameData.data.events.active[event.id];
            if (activeEvent) {
                const endDate = new Date(activeEvent.endDate);
                if (now < endDate) {
                    return true; // Still active
                } else {
                    // Event ended, clean up
                    delete gameData.data.events.active[event.id];
                    gameData.save();
                    return false;
                }
            }
        }

        // Random chance to activate
        if (Math.random() < event.probability / 100) { // Check once per day
            this.activateTimedEvent(event, now);
            return true;
        }

        return false;
    }

    // Activate a timed event
    activateTimedEvent(event, now = new Date()) {
        if (!gameData.data.events) {
            gameData.data.events = { active: {}, completed: [], rewards: [] };
        }
        if (!gameData.data.events.active) {
            gameData.data.events.active = {};
        }

        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + event.duration);

        gameData.data.events.active[event.id] = {
            startDate: now.toISOString(),
            endDate: endDate.toISOString()
        };

        gameData.save();
    }

    // Get active events
    getActiveEvents() {
        this.checkEvents(); // Refresh
        return this.activeEvents;
    }

    // Get combined bonuses from all active events
    getCombinedBonuses() {
        const bonuses = {
            scoreMultiplier: 1,
            xpBoost: 1,
            powerUpChance: 1,
            spawnRate: 1,
            enemyRewards: 1
        };

        this.activeEvents.forEach(event => {
            if (event.bonuses) {
                Object.keys(event.bonuses).forEach(key => {
                    if (typeof event.bonuses[key] === 'number') {
                        if (bonuses[key]) {
                            bonuses[key] *= event.bonuses[key];
                        } else {
                            bonuses[key] = event.bonuses[key];
                        }
                    } else {
                        bonuses[key] = event.bonuses[key];
                    }
                });
            }
        });

        return bonuses;
    }

    // Complete event and claim rewards
    completeEvent(eventId) {
        const event = this.getAllEvents().find(e => e.id === eventId);
        if (!event) return null;

        // Check if already completed
        if (gameData.data.events.completed.includes(eventId)) {
            return { alreadyCompleted: true };
        }

        // Mark as completed
        gameData.data.events.completed.push(eventId);
        gameData.save();

        return event.rewards;
    }

    // Get event notification text
    getEventNotification() {
        if (this.activeEvents.length === 0) return null;

        const event = this.activeEvents[0]; // Show first active event
        return {
            title: event.name,
            description: event.description,
            icon: event.name.split(' ')[0] // Extract emoji
        };
    }

    // Check if specific bonus is active
    hasBonus(bonusType) {
        return this.activeEvents.some(event =>
            event.bonuses && event.bonuses[bonusType]
        );
    }

    // Get bonus multiplier for specific type
    getBonusMultiplier(bonusType) {
        let multiplier = 1;

        this.activeEvents.forEach(event => {
            if (event.bonuses && typeof event.bonuses[bonusType] === 'number') {
                multiplier *= event.bonuses[bonusType];
            }
        });

        return multiplier;
    }
}

// Singleton
export const specialEvents = new SpecialEvents();
