// Story Campaign - 50 missions across 5 acts with narrative progression

import { gameData } from './GameData.js';

export default class StoryCampaign {
    constructor() {
        this.initializeCampaign();
    }

    initializeCampaign() {
        if (!gameData.data.campaign) {
            gameData.data.campaign = {
                currentAct: 1,
                currentMission: 1,
                completedMissions: [],
                missionStars: {}, // missionId: stars (1-3)
                unlockedCutscenes: [],
                totalStars: 0
            };
            gameData.save();
        }
    }

    // All 50 campaign missions organized into 5 acts
    getCampaignStructure() {
        return {
            act1: {
                name: 'The Onboarding',
                theme: 'Junior Developer joins the team',
                icon: '👶',
                color: 0x4CAF50,
                missions: this.getAct1Missions()
            },
            act2: {
                name: 'Production Panic',
                theme: 'First major bug in production',
                icon: '🔥',
                color: 0xFF5722,
                missions: this.getAct2Missions()
            },
            act3: {
                name: 'The Legacy Codebase',
                theme: 'Dealing with ancient code',
                icon: '🏛️',
                color: 0x9C27B0,
                missions: this.getAct3Missions()
            },
            act4: {
                name: 'Security Breach',
                theme: 'Defending against attacks',
                icon: '🛡️',
                color: 0xF44336,
                missions: this.getAct4Missions()
            },
            act5: {
                name: 'The Final Release',
                theme: 'Ship the ultimate product',
                icon: '🚀',
                color: 0x2196F3,
                missions: this.getAct5Missions()
            }
        };
    }

    // Act 1: The Onboarding (Missions 1-10)
    getAct1Missions() {
        return [
            {
                id: 'act1_m1',
                number: 1,
                name: 'First Day',
                description: 'Set up your development environment',
                objectives: [
                    'Install dependencies',
                    'Clone the repository',
                    'Run the dev server'
                ],
                mode: 'tutorial',
                difficulty: 'easy',
                rewards: { xp: 100, coins: 500 },
                dialogue: {
                    intro: 'Welcome to DevCorp! Let\'s get you set up.',
                    outro: 'Great! Your environment is ready.'
                }
            },
            {
                id: 'act1_m2',
                number: 2,
                name: 'Hello World',
                description: 'Write your first feature',
                objectives: [
                    'Create a new component',
                    'Add a hello message',
                    'Commit your changes'
                ],
                mode: 'gitSurvivor',
                difficulty: 'easy',
                rewards: { xp: 150, coins: 750 },
                dialogue: {
                    intro: 'Time to write some code! Start with something simple.',
                    outro: 'Nice work! Your first feature is complete.'
                }
            },
            {
                id: 'act1_m3',
                number: 3,
                name: 'Code Review',
                description: 'Review your teammate\'s PR',
                objectives: [
                    'Review 5 pull requests',
                    'Approve or request changes',
                    'Leave helpful comments'
                ],
                mode: 'prRush',
                difficulty: 'easy',
                targetScore: 500,
                rewards: { xp: 200, coins: 1000 },
                dialogue: {
                    intro: 'We do code reviews here. Take a look at these PRs.',
                    outro: 'Good catches! Code quality is important.'
                }
            },
            {
                id: 'act1_m4',
                number: 4,
                name: 'First Bug',
                description: 'Debug a simple issue',
                objectives: [
                    'Find the null pointer bug',
                    'Fix the syntax error',
                    'Test your fix'
                ],
                mode: 'bugBounty',
                difficulty: 'easy',
                targetLevel: 1,
                rewards: { xp: 250, coins: 1200, skin: 'junior_dev' },
                dialogue: {
                    intro: 'Uh oh, there\'s a bug in the code. Can you find it?',
                    outro: 'Bug squashed! You\'re getting the hang of this.'
                }
            },
            {
                id: 'act1_m5',
                number: 5,
                name: 'Team Meeting',
                description: 'Manage your first sprint',
                objectives: [
                    'Complete 3 sprints',
                    'Keep team morale high',
                    'Meet all deadlines'
                ],
                mode: 'devCommander',
                difficulty: 'medium',
                targetSprints: 3,
                rewards: { xp: 300, coins: 1500 },
                dialogue: {
                    intro: 'Welcome to your first sprint planning! Let\'s organize the team.',
                    outro: 'Sprint completed successfully! Good coordination.'
                }
            },
            {
                id: 'act1_m6',
                number: 6,
                name: 'Refactor Time',
                description: 'Clean up some messy code',
                objectives: [
                    'Identify 5 code smells',
                    'Refactor functions',
                    'Improve readability'
                ],
                mode: 'refactorRace',
                difficulty: 'medium',
                targetScore: 1000,
                rewards: { xp: 350, coins: 1800 },
                dialogue: {
                    intro: 'This code works, but it\'s messy. Let\'s clean it up.',
                    outro: 'Much better! Clean code is happy code.'
                }
            },
            {
                id: 'act1_m7',
                number: 7,
                name: 'Testing Basics',
                description: 'Write unit tests',
                objectives: [
                    'Write 10 unit tests',
                    'Achieve 80% coverage',
                    'All tests passing'
                ],
                mode: 'codeDefense',
                difficulty: 'medium',
                targetWave: 5,
                rewards: { xp: 400, coins: 2000 },
                dialogue: {
                    intro: 'Tests are our safety net. Let\'s write some!',
                    outro: 'Good test coverage! This code is well protected.'
                }
            },
            {
                id: 'act1_m8',
                number: 8,
                name: 'Git Conflicts',
                description: 'Resolve your first merge conflict',
                objectives: [
                    'Resolve merge conflicts',
                    'Keep all changes',
                    'Successful merge'
                ],
                mode: 'gitSurvivor',
                difficulty: 'medium',
                targetScore: 1500,
                rewards: { xp: 450, coins: 2500 },
                dialogue: {
                    intro: 'Merge conflicts happen. Time to learn how to resolve them.',
                    outro: 'Conflict resolved! Git mastery +1.'
                }
            },
            {
                id: 'act1_m9',
                number: 9,
                name: 'Performance Tuning',
                description: 'Optimize slow code',
                objectives: [
                    'Find bottlenecks',
                    'Improve load time by 50%',
                    'Reduce memory usage'
                ],
                mode: 'sprintSurvivor',
                difficulty: 'hard',
                targetDistance: 2000,
                rewards: { xp: 500, coins: 3000 },
                dialogue: {
                    intro: 'The app is running slow. Time to optimize!',
                    outro: 'Lightning fast! Great optimization work.'
                }
            },
            {
                id: 'act1_m10',
                number: 10,
                name: 'Boss: The Senior Dev Review',
                description: 'Pass the senior developer\'s code review',
                objectives: [
                    'Survive the review',
                    'Address all feedback',
                    'Earn approval'
                ],
                mode: 'bossRush',
                difficulty: 'hard',
                boss: 'senior_dev',
                rewards: { xp: 1000, coins: 5000, title: 'Act 1 Complete', skin: 'reviewed_dev' },
                dialogue: {
                    intro: 'The senior dev wants to review your work. Show them what you\'ve learned!',
                    outro: 'Impressive! You\'ve earned their respect. Onboarding complete!'
                }
            }
        ];
    }

    // Act 2: Production Panic (Missions 11-20)
    getAct2Missions() {
        return [
            {
                id: 'act2_m1',
                number: 11,
                name: 'Hotfix Required',
                description: 'Emergency bug in production',
                objectives: [
                    'Identify the critical bug',
                    'Deploy hotfix in 5 minutes',
                    'Zero downtime'
                ],
                mode: 'bugBounty',
                difficulty: 'medium',
                timeLimit: 300,
                rewards: { xp: 600, coins: 3500 }
            },
            {
                id: 'act2_m2',
                number: 12,
                name: 'Server Down',
                description: 'The production server crashed',
                objectives: [
                    'Debug the crash',
                    'Restart services',
                    'Prevent future crashes'
                ],
                mode: 'debugDungeon',
                difficulty: 'medium',
                targetRooms: 5,
                rewards: { xp: 650, coins: 4000 }
            },
            {
                id: 'act2_m3',
                number: 13,
                name: 'Database Emergency',
                description: 'Database queries are timing out',
                objectives: [
                    'Optimize slow queries',
                    'Add proper indexes',
                    'Response time under 100ms'
                ],
                mode: 'refactorRace',
                difficulty: 'hard',
                targetScore: 2000,
                rewards: { xp: 700, coins: 4500 }
            },
            {
                id: 'act2_m4',
                number: 14,
                name: 'Traffic Spike',
                description: 'Handle 10x traffic increase',
                objectives: [
                    'Scale infrastructure',
                    'Load balance requests',
                    'Maintain uptime'
                ],
                mode: 'codeDefense',
                difficulty: 'hard',
                targetWave: 10,
                rewards: { xp: 750, coins: 5000 }
            },
            {
                id: 'act2_m5',
                number: 15,
                name: 'Rollback Time',
                description: 'Bad deploy - need to rollback',
                objectives: [
                    'Revert to previous version',
                    'Fix broken features',
                    'Re-deploy safely'
                ],
                mode: 'gitSurvivor',
                difficulty: 'hard',
                targetScore: 2500,
                rewards: { xp: 800, coins: 5500, powerup: 'rollback' }
            },
            {
                id: 'act2_m6',
                number: 16,
                name: 'Customer Complaints',
                description: 'Handle angry customer tickets',
                objectives: [
                    'Fix 10 reported bugs',
                    'Respond to all tickets',
                    'Customer satisfaction 90%+'
                ],
                mode: 'prRush',
                difficulty: 'hard',
                targetScore: 1500,
                rewards: { xp: 850, coins: 6000 }
            },
            {
                id: 'act2_m7',
                number: 17,
                name: 'Memory Leak Hunt',
                description: 'Find and fix memory leaks',
                objectives: [
                    'Profile memory usage',
                    'Identify leak sources',
                    'Reduce memory by 60%'
                ],
                mode: 'debugDungeon',
                difficulty: 'hard',
                targetRooms: 7,
                rewards: { xp: 900, coins: 6500 }
            },
            {
                id: 'act2_m8',
                number: 18,
                name: 'API Rate Limits',
                description: 'Implement rate limiting',
                objectives: [
                    'Add rate limit middleware',
                    'Handle 429 responses',
                    'Cache API calls'
                ],
                mode: 'codeDefense',
                difficulty: 'hard',
                targetWave: 12,
                rewards: { xp: 950, coins: 7000 }
            },
            {
                id: 'act2_m9',
                number: 19,
                name: 'The All-Nighter',
                description: 'Fix everything before deadline',
                objectives: [
                    'Work through the night',
                    'Fix 15 critical bugs',
                    'Deploy before morning'
                ],
                mode: 'sprintSurvivor',
                difficulty: 'very_hard',
                targetDistance: 5000,
                rewards: { xp: 1000, coins: 8000 }
            },
            {
                id: 'act2_m10',
                number: 20,
                name: 'Boss: The Production Outage',
                description: 'Survive the biggest outage of the year',
                objectives: [
                    'Fix cascading failures',
                    'Restore all services',
                    'Write post-mortem'
                ],
                mode: 'bossRush',
                difficulty: 'very_hard',
                boss: 'production_outage',
                rewards: { xp: 2000, coins: 10000, title: 'Crisis Manager', skin: 'firefighter_dev' }
            }
        ];
    }

    // Act 3: The Legacy Codebase (Missions 21-30)
    getAct3Missions() {
        return [
            {
                id: 'act3_m1',
                number: 21,
                name: 'Ancient Code',
                description: 'Understand code from 10 years ago',
                objectives: [
                    'Read through legacy code',
                    'Document what it does',
                    'Find the original author'
                ],
                mode: 'legacyExcavator',
                difficulty: 'medium',
                targetDepth: 5,
                rewards: { xp: 1100, coins: 8500 }
            },
            {
                id: 'act3_m2',
                number: 22,
                name: 'No Documentation',
                description: 'Zero comments, zero docs',
                objectives: [
                    'Reverse engineer functionality',
                    'Write documentation',
                    'Add helpful comments'
                ],
                mode: 'refactorRace',
                difficulty: 'hard',
                targetScore: 3000,
                rewards: { xp: 1150, coins: 9000 }
            },
            {
                id: 'act3_m3',
                number: 23,
                name: 'Spaghetti Code',
                description: 'Untangle the mess',
                objectives: [
                    'Break up 1000-line functions',
                    'Extract repeated code',
                    'Apply SOLID principles'
                ],
                mode: 'refactorRace',
                difficulty: 'hard',
                targetScore: 3500,
                rewards: { xp: 1200, coins: 9500 }
            },
            {
                id: 'act3_m4',
                number: 24,
                name: 'Deprecated Dependencies',
                description: 'Update ancient packages',
                objectives: [
                    'Update all dependencies',
                    'Fix breaking changes',
                    'Pass all tests'
                ],
                mode: 'debugDungeon',
                difficulty: 'hard',
                targetRooms: 8,
                rewards: { xp: 1250, coins: 10000 }
            },
            {
                id: 'act3_m5',
                number: 25,
                name: 'Tech Debt Payment',
                description: 'Address years of tech debt',
                objectives: [
                    'Refactor 10 modules',
                    'Improve code quality 50%',
                    'Reduce complexity'
                ],
                mode: 'refactorRace',
                difficulty: 'very_hard',
                targetScore: 4000,
                rewards: { xp: 1300, coins: 11000, title: 'Debt Collector' }
            },
            {
                id: 'act3_m6',
                number: 26,
                name: 'Magic Numbers',
                description: 'Replace all magic numbers with constants',
                objectives: [
                    'Find all magic numbers',
                    'Create named constants',
                    'Update all references'
                ],
                mode: 'bugBounty',
                difficulty: 'medium',
                targetLevel: 10,
                rewards: { xp: 1350, coins: 11500 }
            },
            {
                id: 'act3_m7',
                number: 27,
                name: 'The God Object',
                description: 'Break up massive class',
                objectives: [
                    'Identify responsibilities',
                    'Extract new classes',
                    'Maintain functionality'
                ],
                mode: 'refactorRace',
                difficulty: 'very_hard',
                targetScore: 4500,
                rewards: { xp: 1400, coins: 12000 }
            },
            {
                id: 'act3_m8',
                number: 28,
                name: 'Callback Hell',
                description: 'Convert to async/await',
                objectives: [
                    'Refactor nested callbacks',
                    'Use promises',
                    'Improve readability'
                ],
                mode: 'refactorRace',
                difficulty: 'hard',
                targetScore: 5000,
                rewards: { xp: 1450, coins: 13000 }
            },
            {
                id: 'act3_m9',
                number: 29,
                name: 'Test Coverage Zero',
                description: 'Add tests to untested code',
                objectives: [
                    'Write 50 unit tests',
                    'Achieve 70% coverage',
                    'Find 5 bugs via testing'
                ],
                mode: 'codeDefense',
                difficulty: 'very_hard',
                targetWave: 15,
                rewards: { xp: 1500, coins: 14000 }
            },
            {
                id: 'act3_m10',
                number: 30,
                name: 'Boss: The Legacy Codebase Monster',
                description: 'Face the ultimate legacy code',
                objectives: [
                    'Survive legacy code review',
                    'Refactor critical paths',
                    'Modernize architecture'
                ],
                mode: 'bossRush',
                difficulty: 'very_hard',
                boss: 'legacy_codebase',
                rewards: { xp: 3000, coins: 20000, title: 'Legacy Master', skin: 'archaeologist_dev' }
            }
        ];
    }

    // Act 4: Security Breach (Missions 31-40)
    getAct4Missions() {
        return [
            {
                id: 'act4_m1',
                number: 31,
                name: 'Security Alert',
                description: 'Detect suspicious activity',
                objectives: [
                    'Monitor security logs',
                    'Identify attack vectors',
                    'Block malicious IPs'
                ],
                mode: 'codeDefense',
                difficulty: 'hard',
                targetWave: 12,
                rewards: { xp: 1600, coins: 15000 }
            },
            {
                id: 'act4_m2',
                number: 32,
                name: 'SQL Injection',
                description: 'Prevent SQL injection attacks',
                objectives: [
                    'Find vulnerable queries',
                    'Use parameterized queries',
                    'Sanitize all inputs'
                ],
                mode: 'bugBounty',
                difficulty: 'hard',
                targetLevel: 12,
                rewards: { xp: 1650, coins: 16000 }
            },
            {
                id: 'act4_m3',
                number: 33,
                name: 'XSS Defense',
                description: 'Protect against XSS attacks',
                objectives: [
                    'Escape user input',
                    'Implement CSP headers',
                    'Validate all output'
                ],
                mode: 'codeDefense',
                difficulty: 'hard',
                targetWave: 14,
                rewards: { xp: 1700, coins: 17000 }
            },
            {
                id: 'act4_m4',
                number: 34,
                name: 'Authentication Bypass',
                description: 'Fix authentication vulnerabilities',
                objectives: [
                    'Implement proper auth',
                    'Use secure sessions',
                    'Add 2FA'
                ],
                mode: 'debugDungeon',
                difficulty: 'very_hard',
                targetRooms: 9,
                rewards: { xp: 1750, coins: 18000 }
            },
            {
                id: 'act4_m5',
                number: 35,
                name: 'Data Breach',
                description: 'Respond to data breach',
                objectives: [
                    'Identify leaked data',
                    'Notify affected users',
                    'Implement encryption'
                ],
                mode: 'gitSurvivor',
                difficulty: 'very_hard',
                targetScore: 5000,
                rewards: { xp: 1800, coins: 19000, title: 'Security Expert' }
            },
            {
                id: 'act4_m6',
                number: 36,
                name: 'DDoS Attack',
                description: 'Defend against DDoS',
                objectives: [
                    'Implement rate limiting',
                    'Use CDN protection',
                    'Maintain availability'
                ],
                mode: 'codeDefense',
                difficulty: 'very_hard',
                targetWave: 18,
                rewards: { xp: 1850, coins: 20000 }
            },
            {
                id: 'act4_m7',
                number: 37,
                name: 'Password Reset Flaw',
                description: 'Fix password reset vulnerability',
                objectives: [
                    'Secure reset tokens',
                    'Implement expiration',
                    'Prevent account takeover'
                ],
                mode: 'bugBounty',
                difficulty: 'hard',
                targetLevel: 15,
                rewards: { xp: 1900, coins: 21000 }
            },
            {
                id: 'act4_m8',
                number: 38,
                name: 'API Security',
                description: 'Secure all API endpoints',
                objectives: [
                    'Add authentication',
                    'Implement rate limits',
                    'Validate all inputs'
                ],
                mode: 'codeDefense',
                difficulty: 'very_hard',
                targetWave: 20,
                rewards: { xp: 1950, coins: 22000 }
            },
            {
                id: 'act4_m9',
                number: 39,
                name: 'Security Audit',
                description: 'Pass the security audit',
                objectives: [
                    'Fix all vulnerabilities',
                    'Update dependencies',
                    'Get A+ rating'
                ],
                mode: 'debugDungeon',
                difficulty: 'very_hard',
                targetRooms: 10,
                rewards: { xp: 2000, coins: 25000 }
            },
            {
                id: 'act4_m10',
                number: 40,
                name: 'Boss: The Hacker',
                description: 'Defend against elite hacker',
                objectives: [
                    'Block all attacks',
                    'Trace the hacker',
                    'Secure the system'
                ],
                mode: 'bossRush',
                difficulty: 'extreme',
                boss: 'security_breach',
                rewards: { xp: 4000, coins: 30000, title: 'Security Guardian', skin: 'hacker_hunter' }
            }
        ];
    }

    // Act 5: The Final Release (Missions 41-50)
    getAct5Missions() {
        return [
            {
                id: 'act5_m1',
                number: 41,
                name: 'Feature Complete',
                description: 'Finish all planned features',
                objectives: [
                    'Complete 20 features',
                    'All tests passing',
                    'Zero critical bugs'
                ],
                mode: 'devCommander',
                difficulty: 'hard',
                targetSprints: 10,
                rewards: { xp: 2100, coins: 26000 }
            },
            {
                id: 'act5_m2',
                number: 42,
                name: 'Performance Goals',
                description: 'Meet performance targets',
                objectives: [
                    'Load time under 2s',
                    'Lighthouse score 95+',
                    'Core Web Vitals green'
                ],
                mode: 'sprintSurvivor',
                difficulty: 'very_hard',
                targetDistance: 8000,
                rewards: { xp: 2200, coins: 27000 }
            },
            {
                id: 'act5_m3',
                number: 43,
                name: 'Documentation Sprint',
                description: 'Document everything',
                objectives: [
                    'Write API documentation',
                    'Create user guides',
                    'Record video tutorials'
                ],
                mode: 'refactorRace',
                difficulty: 'medium',
                targetScore: 6000,
                rewards: { xp: 2300, coins: 28000 }
            },
            {
                id: 'act5_m4',
                number: 44,
                name: 'Load Testing',
                description: 'Stress test the system',
                objectives: [
                    'Simulate 100k users',
                    'No errors under load',
                    'Auto-scaling works'
                ],
                mode: 'codeDefense',
                difficulty: 'very_hard',
                targetWave: 25,
                rewards: { xp: 2400, coins: 29000 }
            },
            {
                id: 'act5_m5',
                number: 45,
                name: 'Beta Release',
                description: 'Launch beta version',
                objectives: [
                    'Deploy to staging',
                    'Run smoke tests',
                    'Get user feedback'
                ],
                mode: 'gitSurvivor',
                difficulty: 'hard',
                targetScore: 7000,
                rewards: { xp: 2500, coins: 30000, title: 'Beta Master' }
            },
            {
                id: 'act5_m6',
                number: 46,
                name: 'Bug Bash',
                description: 'Final bug hunting session',
                objectives: [
                    'Find and fix 25 bugs',
                    'All P0/P1 bugs fixed',
                    'Known issues documented'
                ],
                mode: 'bugBounty',
                difficulty: 'very_hard',
                targetLevel: 20,
                rewards: { xp: 2600, coins: 32000 }
            },
            {
                id: 'act5_m7',
                number: 47,
                name: 'Release Candidate',
                description: 'Prepare RC build',
                objectives: [
                    'Create release branch',
                    'Run full test suite',
                    'Get stakeholder approval'
                ],
                mode: 'devCommander',
                difficulty: 'very_hard',
                targetSprints: 15,
                rewards: { xp: 2700, coins: 34000 }
            },
            {
                id: 'act5_m8',
                number: 48,
                name: 'Pre-Launch Checklist',
                description: 'Complete all launch tasks',
                objectives: [
                    'Deploy infrastructure',
                    'Configure monitoring',
                    'Prepare rollback plan'
                ],
                mode: 'debugDungeon',
                difficulty: 'very_hard',
                targetRooms: 10,
                rewards: { xp: 2800, coins: 36000 }
            },
            {
                id: 'act5_m9',
                number: 49,
                name: 'Launch Day',
                description: 'Deploy to production',
                objectives: [
                    'Deploy without errors',
                    'Monitor all metrics',
                    'Handle launch traffic'
                ],
                mode: 'sprintSurvivor',
                difficulty: 'extreme',
                targetDistance: 10000,
                rewards: { xp: 3000, coins: 40000 }
            },
            {
                id: 'act5_m10',
                number: 50,
                name: 'Boss: The Final Deadline',
                description: 'Ship the product and succeed',
                objectives: [
                    'Meet all requirements',
                    'Zero production errors',
                    'Achieve success metrics'
                ],
                mode: 'bossRush',
                difficulty: 'extreme',
                boss: 'deadline_monster',
                rewards: {
                    xp: 5000,
                    coins: 50000,
                    title: 'Ship It Master',
                    skin: 'legendary_dev',
                    achievement: 'campaign_complete'
                }
            }
        ];
    }

    // Get mission by ID
    getMission(missionId) {
        const campaign = this.getCampaignStructure();

        for (const act of Object.values(campaign)) {
            const mission = act.missions.find(m => m.id === missionId);
            if (mission) return mission;
        }

        return null;
    }

    // Check if mission is unlocked
    isMissionUnlocked(missionId) {
        const mission = this.getMission(missionId);
        if (!mission) return false;

        // Mission 1 is always unlocked
        if (mission.number === 1) return true;

        // Check if previous mission is completed
        const previousMissionNum = mission.number - 1;
        const campaign = this.getCampaignStructure();

        for (const act of Object.values(campaign)) {
            const prevMission = act.missions.find(m => m.number === previousMissionNum);
            if (prevMission) {
                return gameData.data.campaign.completedMissions.includes(prevMission.id);
            }
        }

        return false;
    }

    // Complete a mission
    completeMission(missionId, stars = 1, score = 0) {
        const mission = this.getMission(missionId);
        if (!mission) {
            return { success: false, message: 'Mission not found!' };
        }

        if (!this.isMissionUnlocked(missionId)) {
            return { success: false, message: 'Mission not unlocked!' };
        }

        const campaign = gameData.data.campaign;

        // Add to completed if not already there
        if (!campaign.completedMissions.includes(missionId)) {
            campaign.completedMissions.push(missionId);
        }

        // Update stars (keep highest)
        const currentStars = campaign.missionStars[missionId] || 0;
        if (stars > currentStars) {
            campaign.missionStars[missionId] = stars;
            campaign.totalStars += (stars - currentStars);
        }

        // Apply rewards
        if (mission.rewards.xp) {
            // Add to mastery system
        }

        if (mission.rewards.coins) {
            gameData.data.stats.totalScore += mission.rewards.coins;
        }

        if (mission.rewards.skin) {
            if (!gameData.data.customization.unlockedSkins.includes(mission.rewards.skin)) {
                gameData.data.customization.unlockedSkins.push(mission.rewards.skin);
            }
        }

        if (mission.rewards.title) {
            if (!gameData.data.titles) gameData.data.titles = [];
            if (!gameData.data.titles.includes(mission.rewards.title)) {
                gameData.data.titles.push(mission.rewards.title);
            }
        }

        // Update current mission/act
        if (mission.number > campaign.currentMission) {
            campaign.currentMission = mission.number + 1;
            campaign.currentAct = Math.ceil(campaign.currentMission / 10);
        }

        gameData.save();

        return {
            success: true,
            mission: mission,
            stars: stars,
            rewards: mission.rewards,
            nextMissionUnlocked: this.isMissionUnlocked(this.getNextMissionId(missionId))
        };
    }

    // Get next mission ID
    getNextMissionId(currentMissionId) {
        const mission = this.getMission(currentMissionId);
        if (!mission || mission.number >= 50) return null;

        const campaign = this.getCampaignStructure();

        for (const act of Object.values(campaign)) {
            const nextMission = act.missions.find(m => m.number === mission.number + 1);
            if (nextMission) return nextMission.id;
        }

        return null;
    }

    // Get campaign progress
    getProgress() {
        const campaign = gameData.data.campaign;

        return {
            currentAct: campaign.currentAct,
            currentMission: campaign.currentMission,
            completedMissions: campaign.completedMissions.length,
            totalMissions: 50,
            totalStars: campaign.totalStars,
            maxStars: 150, // 50 missions × 3 stars
            percentComplete: (campaign.completedMissions.length / 50) * 100
        };
    }

    // Get act progress
    getActProgress(actNumber) {
        const campaign = gameData.data.campaign;
        const actData = this.getCampaignStructure()[`act${actNumber}`];

        if (!actData) return null;

        const actMissions = actData.missions;
        const completed = actMissions.filter(m =>
            campaign.completedMissions.includes(m.id)
        ).length;

        const actStars = actMissions.reduce((total, m) =>
            total + (campaign.missionStars[m.id] || 0), 0
        );

        return {
            act: actNumber,
            name: actData.name,
            theme: actData.theme,
            completed: completed,
            total: actMissions.length,
            stars: actStars,
            maxStars: actMissions.length * 3
        };
    }
}

// Singleton
export const storyCampaign = new StoryCampaign();
