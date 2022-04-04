import { useEffect, useRef, useState } from "react";

import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
    increase,
    selectExpertise
} from './expertiseSlice';
import './Game.css';

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

const initialBoss = {
    name: "Boss Man",
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

export function Game() {
    const interval = 50;

    const initialPlayerHP = 100;
    const playerDamage = 10;
    const playerCooldownValue = 2000;
    const initialBossCooldown = 1000;

    const deathMessage = "You Died!";
    const successMessage = "You Won!";

    // Player state
    const [playerHP, setPlayerHP] = useState(initialPlayerHP);
    const [playerCooldown, setPlayerCooldown] = useState(playerCooldownValue);
    // Boss state
    const [bossHP, setBossHP] = useState<null | number>(300);
    const [boss, setBoss] = useState<null | boss>(initialBoss);
    const [bossCooldown, setBossCooldown] = useState(initialBossCooldown);

    const [gameLog, setGameLog] = useState<Array<string>>([]);

    const expertise = useAppSelector(selectExpertise);
    const dispatch = useAppDispatch();

    const scrollRef = useRef<null | HTMLDivElement>(null)

    function resetGame() {
        setPlayerHP(100);
        setPlayerCooldown(playerCooldownValue);
        setBoss(initialBoss);
        setBossHP(initialBoss.HP);
        setBossCooldown(initialBossCooldown);
    }

    // Game loop
    useEffect(() => {
        const timer = setTimeout(() => {
            let newBoss = boss;
            let newBossHP = bossHP;
            let newBossCooldown = bossCooldown;
            let newGameLog = gameLog;
            let newPlayerHP = playerHP;
            let newPlayerCooldown = playerCooldown;
            if (newBoss === null) {
                newBoss = initialBoss;
                newBossHP = newBoss.HP;
            }
            if (newBossHP === null) {
                newBossHP = newBoss.HP;
            }
            if (bossCooldown <= 0) {
                const nextAttack = newBoss.attacks[Math.floor(Math.random() * newBoss.attacks.length)];
                let nextLog = `${newBoss.name} attacks with ${nextAttack.name}, `

                let dodgeRate = expertise[`${newBoss.name}/${nextAttack.name}`];
                if (dodgeRate === undefined) {
                    dodgeRate = 0;
                }
                if (Math.random() > dodgeRate) {
                    dispatch(increase(`${newBoss.name}/${nextAttack.name}`));
                    newGameLog = [
                        ...newGameLog,
                       
                    ];
                    nextLog += `you got hit for ${nextAttack.damage}!`
                    newPlayerHP -= nextAttack.damage;
                } else {
                    dispatch(increase(`${newBoss.name}/${nextAttack.name}`));
                    nextLog += `but you dodged it!`

                }
                newGameLog = [
                    ...newGameLog,
                    nextLog
                ];

                newBossCooldown = nextAttack.cooldown;
            } else {
                newBossCooldown -= interval;
            }
            if (playerCooldown <= 0) {
                newGameLog = [
                    ...newGameLog,
                    `Player attacks for ${playerDamage}!`
                ];
                newBossHP -= playerDamage;

                newPlayerCooldown = playerCooldownValue;
            } else {
                newPlayerCooldown -= interval;
            }


            if (newPlayerHP <= 0) {
                newGameLog = [
                    ...newGameLog,
                    deathMessage
                ];
                setGameLog(newGameLog);
                resetGame();
                return;
            } else if (newBossHP <= 0) {
                newGameLog = [
                    ...newGameLog,
                    successMessage
                ];
                setGameLog(newGameLog);
                resetGame();
                return;
            } else {
                setGameLog(newGameLog);
            }

            if (newGameLog.length !== gameLog.length) {
                scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
            }

            setBoss(newBoss);
            setBossHP(newBossHP);
            setBossCooldown(newBossCooldown);
            setPlayerHP(newPlayerHP);
            setPlayerCooldown(newPlayerCooldown);
        }, interval);

        return () => clearTimeout(timer);
    }
    );

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
                            Object.keys(expertise)
                                .filter(key => key.startsWith(boss.name))
                                .map((e, i) => {
                                    return (
                                        <div key={i}>{e}: {expertise[e].toFixed(2)}</div>
                                    );
                                })
                    }
                </div>
            </div>
            <div className="boss-stats">
                <div>{boss === null ? "" : boss.name}</div>
                <div>HP: {bossHP === null || bossHP === undefined ? "" : bossHP!.toFixed(0)}</div>
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