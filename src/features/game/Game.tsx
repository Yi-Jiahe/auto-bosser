import { useEffect, useRef, useState } from "react";

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { ExpertiseChart } from "../graphing/Graphs";
import { filterExpertiseByBoss } from "./expertise";
import {
    increase,
    selectExpertise
} from './expertiseSlice';
import './Game.css';
import { setBossProgress, selectBossProgress, logAttempt, selectAttempts } from "./progressSlice.";

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
        name: "Goblin",
        HP: 150,
        attacks: [
            {
                name: "Punch",
                damage: 15,
                cooldown: 1000,
            },
            {
                name: "Kick",
                damage: 40,
                cooldown: 3000,
            }
        ]
    },
    {
        name: "Big Goblin",
        HP: 300,
        attacks: [
            {
                name: "Punch",
                damage: 20,
                cooldown: 1000,
            },
            {
                name: "Kick",
                damage: 50,
                cooldown: 3000,
            }
        ]
    }
]

interface gameState {
    playerHP: number,
    playerCooldown: number,
    boss: null | boss,
    bossHP: null | number,
    bossCooldown: number,
    gameLog: Array<string>
}

const data = Array(100).fill(0).map((_e, i) => [i * 0.01, i * 0.02, i * 0.03]) as Array<Array<number>>;

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
    const attemps = useAppSelector(selectAttempts);
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
                    playerHP: 100,
                    playerCooldown: playerCooldownValue,
                    boss: bosses[bossProgress],
                    bossHP: bosses[bossProgress].HP,
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
                let newBossProgress = bossProgress;
                if (bossProgress < bosses.length - 1) {
                    newBossProgress += 1;
                    dispatch(setBossProgress(newBossProgress))
                }
                return {
                    playerHP: 100,
                    playerCooldown: playerCooldownValue,
                    boss: bosses[newBossProgress],
                    bossHP: bosses[newBossProgress].HP,
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
                <div>{boss === null ? "" : boss.name}</div>
                <div>HP: {bossHP === null || bossHP === undefined ? "" : bossHP!.toFixed(0)}</div>
            </div>
            <div className="expertise-chart">
                {boss === null ? "" : 
                <ExpertiseChart attempts={attemps[boss.name]} width={1000} height={480} />}
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