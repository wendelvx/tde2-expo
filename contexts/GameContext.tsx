import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';

// Tipagem básica para facilitar o desenvolvimento do time (9 pessoas)
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
  const [isConnected, setIsConnected] = useState(false);
  const [player, setPlayer] = useState({ nickname: '', class: '', room: '' });

  useEffect(() => {
    // Listeners de conexão
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // RF03: Sincronização de Estado em Tempo Real
    socket.on('boss_update', (data) => {
      setGameState(data);
    });

    // Tratamento de Erros vindo do Gateway/Engine
    socket.on('game_error', (err) => {
      alert(`⚠️ Erro na Masmorra: ${err.message}`);
    });

    // Cleanup ao desmontar o Provider
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('boss_update');
      socket.off('game_error');
    };
  }, []);

  // RF01, RF02 & RF09: Registro, Seleção de Classe e Instância
  const joinGame = useCallback((nickname: string, playerClass: string, room: string) => {
    setPlayer({ nickname, class: playerClass, room });
    
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_game', { 
      nickname, 
      class: playerClass, 
      room_id: room 
    });
  }, []);

  // RF04: Comando de Ataque
  const attack = useCallback(() => {
    socket.emit('attack');
  }, []);

  // RF05: Gestão e Resolução de Incidentes
  const resolveIncident = useCallback((payload: string) => {
    // O payload é a solução técnica (ex: "3-1-2" ou "SQL_INJECTION_FIXED")
    socket.emit('resolve_incident', { payload });
  }, []);

  // RF08: Tratamento de Saída/Desconexão
  const leaveGame = useCallback(() => {
    socket.disconnect();
    setGameState(null);
    setPlayer({ nickname: '', class: '', room: '' });
  }, []);

  return (
    <GameContext.Provider 
      value={{ 
        gameState, 
        player, 
        joinGame, 
        attack, 
        resolveIncident, 
        leaveGame,
        isConnected 
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);