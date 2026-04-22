import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BOSSES, INCIDENTS_POOL } from '../constants/gameMocks';

interface GameContextData {
  gameState: any;
  player: { nickname: string; class: string; room: string };
  joinGame: (nickname: string, playerClass: string, room: string) => void;
  attack: () => void;
  resolveIncident: (payload: string) => void;
  leaveGame: () => void;
  isConnected: boolean;
}

const GameContext = createContext<GameContextData>({} as GameContextData);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<any>(null);
  const [player, setPlayer] = useState({ nickname: '', class: '', room: '' });
  const [isConnected, setIsConnected] = useState(false);
  
  const autoAttackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIncidentTimeRef = useRef<number>(0);
  const INCIDENT_COOLDOWN = 7000; 

  const simulateTeamAction = useCallback(() => {
    setGameState((prev: any) => {
      if (!prev || prev.status === 'victory' || prev.status === 'defeat') {
        if (autoAttackRef.current) clearInterval(autoAttackRef.current);
        return prev;
      }

      let newBossHp = prev.boss_hp;
      let newSquadHp = prev.squad_hp;
      let actionText = "";

      if (prev.active_incident) {
        const bossDamage = Math.floor(Math.random() * 80) + 30;
        newSquadHp = Math.max(0, prev.squad_hp - bossDamage);
        actionText = `SQUAD TRAVADO! Boss atacou: -${bossDamage} HP`;
      } else {
        const teamDamage = Math.floor(Math.random() * 80) + 20;
        const bossDamage = Math.floor(Math.random() * 40) + 10;
        newBossHp = Math.max(0, prev.boss_hp - teamDamage);
        newSquadHp = Math.max(0, prev.squad_hp - bossDamage);
        actionText = `Squad: -${bossDamage} HP | Boss: -${teamDamage} HP`;
      }

      let newStatus = 'playing';
      if (newSquadHp <= 0) newStatus = 'defeat';
      else if (newBossHp <= 0) newStatus = 'victory';

      return {
        ...prev,
        boss_hp: newBossHp,
        squad_hp: newSquadHp,
        status: newStatus,
        last_action: actionText
      };
    });
  }, []);

  const joinGame = useCallback((nickname: string, playerClass: string, room: string) => {
    setPlayer({ nickname, class: playerClass, room });
    setIsConnected(true);
    lastIncidentTimeRef.current = Date.now();

    const selectedBoss = BOSSES[Math.floor(Math.random() * BOSSES.length)];

    setGameState({
      status: 'playing',
      current_boss: selectedBoss,
      boss_hp: selectedBoss.max_hp,
      squad_hp: 2000,
      max_squad_hp: 2000,
      active_incident: null,
      last_action: "A batalha começou!",
      logs: []
    });

    if (autoAttackRef.current) clearInterval(autoAttackRef.current);
    autoAttackRef.current = setInterval(() => {
      simulateTeamAction();
    }, 3000);
  }, [simulateTeamAction]);

  const attack = useCallback(() => {
    setGameState((prev: any) => {
      if (!prev || prev.active_incident || prev.status === 'victory' || prev.status === 'defeat') return prev;

      const damage = Math.floor(Math.random() * 150) + 50;
      const newBossHp = Math.max(0, prev.boss_hp - damage);
      
      let newStatus = 'playing';
      if (newBossHp <= 0) newStatus = 'victory';

      const now = Date.now();
      const timeSinceLastIncident = now - lastIncidentTimeRef.current;
      
      let newIncident = null;
      if (timeSinceLastIncident > INCIDENT_COOLDOWN && newStatus === 'playing') {
        const shouldTriggerIncident = Math.random() < 0.25; 
        if (shouldTriggerIncident) {
          newIncident = INCIDENTS_POOL[Math.floor(Math.random() * INCIDENTS_POOL.length)];
        }
      }

      return {
        ...prev,
        boss_hp: newBossHp,
        status: newStatus,
        active_incident: newIncident,
        last_action: `VOCÊ atacou! -${damage} HP`
      };
    });
  }, []);

  const resolveIncident = useCallback((payload: string) => {
    lastIncidentTimeRef.current = Date.now();

    setGameState((prev: any) => {
      if (!prev) return prev;

      const isAutoFix = payload === "SQUAD_AUTO_FIX";
      const resolutionMsg = isAutoFix 
        ? `🤖 SQUAD: Patch aplicado!` 
        : `✅ VOCÊ: Incidente resolvido!`;

      return {
        ...prev,
        active_incident: null,
        last_action: resolutionMsg
      };
    });
  }, []);

  const leaveGame = useCallback(() => {
    if (autoAttackRef.current) clearInterval(autoAttackRef.current);
    setGameState(null);
    setPlayer({ nickname: '', class: '', room: '' });
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      if (autoAttackRef.current) clearInterval(autoAttackRef.current);
    };
  }, []);

  return (
    <GameContext.Provider value={{ gameState, player, joinGame, attack, resolveIncident, leaveGame, isConnected }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);