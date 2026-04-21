import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function ArenaScreen() {
  const { gameState, player, attack, resolveIncident, isConnected } = useGame();
  const router = useRouter();
  
  // Animações
  const animatedHP = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Estados locais para os mini-games de incidentes
  const [clickCount, setClicks] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');

  // Efeito 1: Navegação para a Vitória
  useEffect(() => {
    if (gameState?.status === 'victory') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/victory');
    }
  }, [gameState?.status]);

  // Efeito 2: Reatividade ao Dano (Animação de HP e Screenshake)
  useEffect(() => {
    if (gameState?.current_boss) {
      const hpPercent = Math.max(0, gameState.boss_hp / gameState.current_boss.max_hp);
      
      Animated.timing(animatedHP, {
        toValue: hpPercent,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // RF07: Efeito de Tremor (Screenshake) ao sofrer dano
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [gameState?.boss_hp]);

  // Limpa os mini-games quando o incidente some
  useEffect(() => {
    if (!gameState?.active_incident) {
      setClicks(0);
      setSequence([]);
      setPuzzleAnswer('');
    }
  }, [gameState?.active_incident]);

  if (!gameState) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Conectando à Masmorra...</Text>
      </View>
    );
  }

  const activeIncident = gameState.active_incident;
  const isMyIncident = activeIncident?.target_class === player.class;

  // --- FÁBRICA DE COMPONENTES DE INCIDENTE (RF05) ---
  const renderIncidentAction = () => {
    if (!activeIncident || !isMyIncident) return null;

    if (activeIncident.type === 'RAPID_CLICK') {
      const targetClicks = parseInt(activeIncident.solution);
      return (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const newCount = clickCount + 1;
            setClicks(newCount);
            if (newCount >= targetClicks) resolveIncident(newCount.toString());
          }}
        >
          <Text style={styles.actionButtonText}>CLIQUE RÁPIDO ({clickCount}/{targetClicks})</Text>
        </TouchableOpacity>
      );
    }

    if (activeIncident.type === 'SEQUENCE') {
      const handleSeqPress = (num: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newSeq = [...sequence, num];
        setSequence(newSeq);
        
        // Se já digitou 3 números, valida a resposta
        if (newSeq.length === 3) {
          const answer = newSeq.join('-');
          if (answer === activeIncident.solution) {
            resolveIncident(answer);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setSequence([]); // Errou a senha, reseta!
          }
        }
      };

      return (
        <View style={styles.sequenceContainer}>
          <Text style={styles.sequenceDisplay}>{sequence.join(' - ') || 'Digite a sequência'}</Text>
          <View style={styles.sequenceRow}>
            {['1', '2', '3'].map(num => (
              <TouchableOpacity key={num} style={styles.seqButton} onPress={() => handleSeqPress(num)}>
                <Text style={styles.seqButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (activeIncident.type === 'PUZZLE') {
      return (
        <View style={styles.puzzleContainer}>
          <TextInput 
            style={styles.puzzleInput} 
            placeholder="Digite o código da solução..."
            placeholderTextColor="#888"
            autoCapitalize="characters"
            value={puzzleAnswer}
            onChangeText={setPuzzleAnswer}
          />
          <TouchableOpacity style={styles.actionButton} onPress={() => resolveIncident(puzzleAnswer)}>
            <Text style={styles.actionButtonText}>ENVIAR FIX</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, activeIncident && styles.incidentBg]}>
      
      {/* RF08: Indicador de Conexão */}
      <View style={styles.topBar}>
        <Text style={styles.roomTag}>SALA: {player.room}</Text>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#00ff66' : '#ff0033' }]} />
      </View>

      {/* BOSS CONTAINER COM ANIMATION */}
      <Animated.View style={[styles.bossContainer, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.bossName}>{gameState.current_boss?.name}</Text>
        <Text style={styles.bossClass}>{gameState.current_boss?.class.toUpperCase()}</Text>
        
        <View style={styles.hpBarBackground}>
          <Animated.View 
            style={[styles.hpBarFill, { 
              width: animatedHP.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
            }]} 
          />
        </View>
        <Text style={styles.hpText}>{gameState.boss_hp} / {gameState.current_boss?.max_hp} HP</Text>
      </Animated.View>

      {/* FEED E INCIDENTES */}
      <View style={styles.middleSection}>
        {activeIncident ? (
          <View style={[styles.incidentCard, isMyIncident ? styles.myIncidentCard : styles.otherIncidentCard]}>
            <Text style={styles.incidentTitle}>⚠️ {activeIncident.title}</Text>
            <Text style={styles.incidentDesc}>{activeIncident.description}</Text>
            {renderIncidentAction()}
            {!isMyIncident && <Text style={styles.waitingText}>Aguardando {activeIncident.target_class} resolver...</Text>}
          </View>
        ) : (
          <View style={styles.feedCard}>
            <Text style={styles.feedTitle}>ÚLTIMA AÇÃO</Text>
            <Text style={styles.lastActionText}>{gameState.last_action}</Text>
          </View>
        )}
      </View>

      {/* BOTÃO PRINCIPAL */}
      <TouchableOpacity 
        style={[styles.attackButton, activeIncident && styles.attackDisabled]} 
        onPress={() => {
          if (!activeIncident) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            attack();
          }
        }}
        activeOpacity={activeIncident ? 1 : 0.7}
      >
        <Text style={styles.attackText}>ATACAR</Text>
      </TouchableOpacity>

      <Text style={styles.playerTag}>{player.nickname} | {player.class}</Text>
    </View>
  );
}

// ... Estilos na próxima resposta se precisar, mas a estrutura lógica é o foco aqui ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20, justifyContent: 'space-between' },
  incidentBg: { backgroundColor: '#1a0505' },
  loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#00ff66', fontSize: 16, fontFamily: 'monospace' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  roomTag: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  bossContainer: { alignItems: 'center', marginTop: 20 },
  bossName: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  bossClass: { color: '#ff0033', fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 3 },
  hpBarBackground: { width: '100%', height: 25, backgroundColor: '#222', borderRadius: 12, borderWidth: 2, borderColor: '#111', overflow: 'hidden' },
  hpBarFill: { height: '100%', backgroundColor: '#ff0033' },
  hpText: { color: '#aaa', marginTop: 10, fontWeight: 'bold', fontSize: 12 },
  middleSection: { flex: 1, justifyContent: 'center', marginVertical: 20 },
  feedCard: { backgroundColor: '#111', padding: 20, borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#00ff66' },
  feedTitle: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
  lastActionText: { color: '#00ff66', fontSize: 16, fontFamily: 'monospace' },
  incidentCard: { padding: 20, borderRadius: 15, borderWidth: 2 },
  myIncidentCard: { backgroundColor: '#0a1a0a', borderColor: '#00ff66' },
  otherIncidentCard: { backgroundColor: '#1a0a0a', borderColor: '#ff0033' },
  incidentTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  incidentDesc: { color: '#ccc', marginVertical: 10, fontSize: 14 },
  waitingText: { color: '#ff0033', fontStyle: 'italic', marginTop: 10 },
  actionButton: { backgroundColor: '#00ff66', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#000', fontWeight: '900', fontSize: 16 },
  sequenceContainer: { marginTop: 15, alignItems: 'center' },
  sequenceDisplay: { color: '#00ff66', fontSize: 24, fontWeight: 'bold', letterSpacing: 5, marginBottom: 15 },
  sequenceRow: { flexDirection: 'row', gap: 15 },
  seqButton: { backgroundColor: '#222', width: 60, height: 60, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00ff66' },
  seqButtonText: { color: '#00ff66', fontSize: 24, fontWeight: 'bold' },
  puzzleContainer: { marginTop: 10 },
  puzzleInput: { backgroundColor: '#000', borderWidth: 1, borderColor: '#00ff66', color: '#00ff66', padding: 15, borderRadius: 10, fontSize: 16, fontFamily: 'monospace' },
  attackButton: { backgroundColor: '#ff0033', height: 110, width: 110, borderRadius: 55, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#ff0033', shadowOpacity: 0.8, shadowRadius: 15 },
  attackDisabled: { backgroundColor: '#222', shadowOpacity: 0 },
  attackText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  playerTag: { color: '#555', textAlign: 'center', fontSize: 12, marginTop: 20, fontWeight: 'bold' }
});