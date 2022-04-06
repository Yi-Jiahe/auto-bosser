import { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from "react";
import { formatWithOptions } from "util";

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { ExpertiseChart } from "../graphing/Graphs";
import { filterExpertiseByBoss } from "./expertise";
import {
    increase,
    selectExpertise
} from './expertiseSlice';
import './Game.css';
import { setBossProgress, selectBossProgress, logAttempt, selectAttempts } from "./progressSlice";

interface attack {
    name: string,
    damage: number,
    cooldown: number,
}

interface boss {
    name: string,
    HP: number;
    attacks: Array<attack>,
}

const bosses: Array<boss> = [
    {
        name: "Slime",
        HP: 80,
        attacks: [
            {
                name: "Bash",
                damage: 10,
                cooldown: 1500,
            }
        ]
    },
    {
        name: "Stump",
        HP: 100,
        attacks: [
            {
                name: "Bash",
                damage: 15,
                cooldown: 2000,
            }
        ]
    },
    {
        name: "Goblin",
        HP: 120,
        attacks: [
            {
                name: "Punch",
                damage: 15,
                cooldown: 2000,
            },
            {
                name: "Kick",
                damage: 25,
                cooldown: 3000,
            }
        ]
    },
    {
        name: "Hobgoblin",
        HP: 150,
        attacks: [
            {
                name: "Punch",
                damage: 25,
                cooldown: 2500,
            },
            {
                name: "Kick",
                damage: 35,
                cooldown: 3500,
            }
        ]
    },
    {
        name: "Demon",
        HP: 200,
        attacks: [
            {
                name: "Fireball",
                damage: 10,
                cooldown: 1000,
            },
            {
                name: "Jab",
                damage: 15,
                cooldown: 1500,
            },
            {
                name: "Slash",
                damage: 30,
                cooldown: 2500,
            }
        ]
    },
];

interface gameState {
    playerHP: number,
    playerCooldown: number,
    boss: null | boss,
    bossHP: null | number,
    bossCooldown: number,
    gameLog: Array<string>
}

export function Game() {
    const interval = 100;

    const initialPlayerHP = 100;
    const playerDamage = 10;
    const playerCooldownValue = 2000;
    const initialBossCooldown = 1000;

    const deathMessage = "You Died!";
    const successMessage = "You Won!";

    const expertise = useAppSelector(selectExpertise);
    const bossProgress = useAppSelector(selectBossProgress);
    const attempts = useAppSelector(selectAttempts);
    const dispatch = useAppDispatch();

    // Player state
    const [playerHP, setPlayerHP] = useState(initialPlayerHP);
    const [playerCooldown, setPlayerCooldown] = useState(playerCooldownValue);
    // Boss state
    const [boss, setBoss] = useState<null | boss>(bosses[bossProgress]);
    const [bossHP, setBossHP] = useState<null | number>(bosses[bossProgress].HP);
    const [bossCooldown, setBossCooldown] = useState(initialBossCooldown);

    const [gameLog, setGameLog] = useState<Array<string>>([]);

    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const scrollRef = useRef<null | HTMLDivElement>(null)

    // Game loop
    useEffect(() => {
        function update(state: gameState): gameState {
            if (state.boss === null) {
                state.boss = bosses[bossProgress];
                state.bossHP = state.boss.HP;
            }
            if (state.bossHP === null) {
                state.bossHP = state.boss.HP;
            }
            if (state.bossCooldown <= 0) {
                const nextAttack = state.boss.attacks[Math.floor(Math.random() * state.boss.attacks.length)];
                let nextLog = `${state.boss.name} attacks with ${nextAttack.name}, `

                let dodgeRate = expertise[`${state.boss.name}/${nextAttack.name}`];
                if (dodgeRate === undefined) {
                    dodgeRate = 0;
                }
                if (Math.random() > dodgeRate) {
                    dispatch(increase(`${state.boss.name}/${nextAttack.name}`));
                    nextLog += `you got hit for ${nextAttack.damage}!`
                    state.playerHP -= nextAttack.damage;
                } else {
                    dispatch(increase(`${state.boss.name}/${nextAttack.name}`));
                    nextLog += `but you dodged it!`
                }
                state.gameLog = [
                    ...state.gameLog,
                    nextLog
                ];

                state.bossCooldown = nextAttack.cooldown;
            } else {
                state.bossCooldown -= interval;
            }
            if (state.playerCooldown <= 0) {
                state.gameLog = [
                    ...state.gameLog,
                    `Player attacks for ${playerDamage}!`
                ];
                state.bossHP -= playerDamage;

                state.playerCooldown = playerCooldownValue;
            } else {
                state.playerCooldown -= interval;
            }

            if (state.playerHP <= 0) {
                state.gameLog = [
                    ...state.gameLog,
                    deathMessage
                ];
                dispatch(logAttempt({
                    bossName: state.boss.name,
                    attempt: {
                        playerHP: state.playerHP,
                        bossHP: state.bossHP,
                        expertise: filterExpertiseByBoss(expertise, state.boss.name)
                    }
                }));
                return {
                    playerHP: initialPlayerHP,
                    playerCooldown: playerCooldownValue,
                    boss: state.boss,
                    bossHP: state.boss.HP,
                    bossCooldown: initialBossCooldown,
                    gameLog: state.gameLog,
                };
            } else if (state.bossHP <= 0) {
                state.gameLog = [
                    ...state.gameLog,
                    successMessage
                ];
                dispatch(logAttempt({
                    bossName: state.boss.name,
                    attempt: {
                        playerHP: state.playerHP,
                        bossHP: state.bossHP,
                        expertise: filterExpertiseByBoss(expertise, state.boss.name)
                    }
                }));
                return {
                    playerHP: initialPlayerHP,
                    playerCooldown: playerCooldownValue,
                    boss: state.boss,
                    bossHP: state.boss.HP,
                    bossCooldown: initialBossCooldown,
                    gameLog: state.gameLog,
                };
            }

            return state;
        }

        const timer = setTimeout(() => {
            const timeNow = Date.now();
            const timeElapsed = timeNow - lastUpdate;

            let state: gameState = {
                playerHP: playerHP,
                playerCooldown: playerCooldown,
                boss: boss,
                bossHP: bossHP,
                bossCooldown: bossCooldown,
                gameLog: gameLog,
            }
            for (let t = 0; t < timeElapsed; t += interval) {
                state = update(state);
            }

            if (state.gameLog.length !== gameLog.length) {
                scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
            }

            setPlayerHP(state.playerHP);
            setPlayerCooldown(state.playerCooldown);
            setBoss(state.boss);
            setBossHP(state.bossHP);
            setBossCooldown(state.bossCooldown);
            setGameLog(state.gameLog);

            setLastUpdate(timeNow);
        }, interval);

        return () => clearTimeout(timer);
    });

    function onBossSelectChange(e: ChangeEvent<HTMLSelectElement>) {
        const selectedBoss = bosses[parseInt(e.target.value)];
        
        setPlayerHP(initialPlayerHP);
        setPlayerCooldown(playerCooldownValue);
        setBoss(selectedBoss);
        setBossHP(selectedBoss.HP);
        setBossCooldown(initialBossCooldown);
    }

    return (
        <div className="grid-container">
            <div className="player-stats">
                <div>Player</div>
                <div>HP: {playerHP.toFixed(0)}</div>
            </div>
            <div className="expertise">
                <div>
                    Expertise
                </div>
                <div>
                    {
                        boss === null ? "" :
                            filterExpertiseByBoss(expertise, boss.name)
                                .map((e, i) => {
                                    const attack = Object.keys(e)[0];
                                    return <div key={i}>{attack}: {e[attack].toFixed(2)}</div>
                                })
                    }
                </div>
            </div>
            <div className="boss-stats">
                <div>
                    <select onChange={onBossSelectChange}>
                        {bosses.map((e, i) => {
                            return (<option value={i}>{e.name}</option>);
                        })}
                    </select>
                </div>
                <div>HP: {bossHP === null || bossHP === undefined ? "" : bossHP!.toFixed(0)}</div>
            </div>
            <div className="expertise-chart">
                {boss === null || attempts === undefined ? "" : 
                <ExpertiseChart attempts={attempts[boss.name]} width={1000} height={480} />}
            </div>
            <div className="log">
                <div id="output" ref={scrollRef}>
                    {
                        gameLog.map((e, i) => {
                            return (
                                <div key={i} className={`${e === deathMessage ? "red-text" : ""} ${e === successMessage ? "green-text" : ""}`}>
                                    {e}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}