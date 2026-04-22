import { useGame } from '@/contexts/GameContext';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ArenaScreen() {
  const { gameState, player, attack, resolveIncident, isConnected } = useGame();
  const router = useRouter();
  
  const animatedHP = useRef(new Animated.Value(1)).current;
  const animatedSquadHP = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  const squadProgressAnim = useRef(new Animated.Value(0)).current;
  const [squadTimeLeft, setSquadTimeLeft] = useState(5);

  const [clickCount, setClicks] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');

  const activeIncident = gameState?.active_incident;
  const isMyIncident = activeIncident?.target_class === player.class;

  useEffect(() => {
    if (gameState?.status === 'victory') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/victory');
    } else if (gameState?.status === 'defeat') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('⚠️ SQUAD DERROTADO! A infraestrutura colapsou.');
      router.replace('/'); 
    }
  }, [gameState?.status]);

  useEffect(() => {
    if (gameState?.current_boss) {
      const hpPercent = Math.max(0, gameState.boss_hp / gameState.current_boss.max_hp);
      Animated.timing(animatedHP, { toValue: hpPercent, duration: 300, useNativeDriver: false }).start();

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true })
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [gameState?.boss_hp]);

  useEffect(() => {
    if (gameState?.squad_hp !== undefined && gameState?.max_squad_hp !== undefined) {
      const squadHpPercent = Math.max(0, gameState.squad_hp / gameState.max_squad_hp);
      Animated.timing(animatedSquadHP, { toValue: squadHpPercent, duration: 300, useNativeDriver: false }).start();
    }
  }, [gameState?.squad_hp]);

  // --- CORREÇÃO: EFEITO 1 (Apenas roda o timer e a animação) ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (activeIncident && !isMyIncident) {
      setSquadTimeLeft(5);
      squadProgressAnim.setValue(0);

      Animated.timing(squadProgressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false
      }).start();

      timer = setInterval(() => {
        setSquadTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeIncident, isMyIncident]);

  // --- CORREÇÃO: EFEITO 2 (Apenas dispara a resolução quando o timer zera) ---
  useEffect(() => {
    if (activeIncident && !isMyIncident && squadTimeLeft <= 0) {
      resolveIncident("SQUAD_AUTO_FIX");
    }
  }, [squadTimeLeft, activeIncident, isMyIncident, resolveIncident]);

  useEffect(() => {
    if (!activeIncident) {
      setClicks(0);
      setSequence([]);
      setPuzzleAnswer('');
    }
  }, [activeIncident]);

  if (!gameState) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>INICIALIZANDO ENGINE...</Text>
      </View>
    );
  }

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
          <Text style={styles.actionButtonText}>REFORÇAR CÓDIGO ({clickCount}/{targetClicks})</Text>
        </TouchableOpacity>
      );
    }

    if (activeIncident.type === 'SEQUENCE') {
      const handleSeqPress = (num: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newSeq = [...sequence, num];
        setSequence(newSeq);
        if (newSeq.length === 3) {
          const answer = newSeq.join('-');
          if (answer === activeIncident.solution) {
            resolveIncident(answer);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setSequence([]);
          }
        }
      };

      return (
        <View style={styles.sequenceContainer}>
          <Text style={styles.sequenceDisplay}>{sequence.join(' - ') || 'DIGITE O PATCH'}</Text>
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
            placeholder="Comando de correção..."
            placeholderTextColor="#444"
            autoCapitalize="characters"
            value={puzzleAnswer}
            onChangeText={setPuzzleAnswer}
          />
          <TouchableOpacity style={styles.actionButton} onPress={() => resolveIncident(puzzleAnswer)}>
            <Text style={styles.actionButtonText}>EXECUTAR HOTFIX</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, activeIncident && styles.incidentBg]}>
      
      <View style={styles.topBar}>
        <View>
          <Text style={styles.roomTag}>SALA: {player.room}</Text>
          <Text style={styles.latencyTag}>LATÊNCIA: 12ms</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#00ff66' : '#ff0033' }]} />
      </View>

      <Animated.View style={[styles.bossSection, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.bossFrame}>
          <Image source={gameState.current_boss?.image} style={styles.bossImage} />
          <View style={styles.bossOverlay} />
        </View>

        <View style={styles.bossInfo}>
          <Text style={styles.bossName}>{gameState.current_boss?.name}</Text>
          <Text style={styles.bossStatus}>"{gameState.current_boss?.status_msg}"</Text>
          
          <View style={styles.hpBarContainer}>
            <View style={styles.hpBarBackground}>
              <Animated.View 
                style={[styles.hpBarFill, { 
                  width: animatedHP.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                }]} 
              />
            </View>
            <Text style={styles.hpText}>HP: {gameState.boss_hp} / {gameState.current_boss?.max_hp}</Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.middleSection}>
        {activeIncident ? (
          <View style={[styles.incidentCard, isMyIncident ? styles.myIncidentCard : styles.otherIncidentCard]}>
            <View style={styles.incidentHeader}>
              <Text style={styles.incidentTitle}>{activeIncident.title}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{activeIncident.target_class}</Text></View>
            </View>
            <Text style={styles.incidentDesc}>{activeIncident.description}</Text>
            
            {renderIncidentAction()}

            {!isMyIncident && (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  {squadTimeLeft > 0 ? `SQUAD RESOLVENDO EM ${squadTimeLeft}s...` : 'FINALIZANDO PATCH...'}
                </Text>
                <View style={styles.squadProgressBg}>
                    <Animated.View 
                        style={[styles.squadProgressFill, { 
                            width: squadProgressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                        }]} 
                    />
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.feedCard}>
            <Text style={styles.feedTitle}>CONSOLE DOS LOGS</Text>
            <Text style={styles.lastActionText}>{'>'} {gameState.last_action}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.attackButton, activeIncident && styles.attackDisabled]} 
          onPress={() => !activeIncident && attack()}
          activeOpacity={0.8}
        >
          <View style={styles.attackInner}>
            <Text style={styles.attackText}>ATACAR</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerNick}>{player.nickname} | {player.class.toUpperCase()}</Text>
          
          <View style={styles.squadHealthContainer}>
            <Text style={styles.squadHealthText}>INTEGRIDADE DO SQUAD</Text>
            <View style={styles.squadHpBarBg}>
              <Animated.View 
                style={[styles.squadHpBarFill, { 
                  width: animatedSquadHP.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                }]} 
              />
            </View>
            <Text style={styles.squadHpValues}>{gameState.squad_hp} / {gameState.max_squad_hp}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20 },
  incidentBg: { backgroundColor: '#0f0505' },
  loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#00ff66', fontSize: 14, fontFamily: 'monospace', letterSpacing: 2 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 40 },
  roomTag: { color: '#444', fontWeight: 'bold', fontSize: 10 },
  latencyTag: { color: '#00ff66', fontSize: 10, fontFamily: 'monospace' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  bossSection: { alignItems: 'center', marginTop: 10 },
  bossFrame: { width: 200, height: 200, borderRadius: 100, borderWidth: 4, borderColor: '#ff0033', overflow: 'hidden', backgroundColor: '#111' },
  bossImage: { width: '100%', height: '100%' },
  bossOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,0,0,0.1)' },
  bossInfo: { width: '100%', alignItems: 'center', marginTop: 15 },
  bossName: { color: '#fff', fontSize: 26, fontWeight: '900' },
  bossStatus: { color: '#00ff66', fontSize: 12, fontStyle: 'italic', marginBottom: 15 },
  hpBarContainer: { width: '100%', alignItems: 'center' },
  hpBarBackground: { width: '90%', height: 18, backgroundColor: '#111', borderRadius: 9, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  hpBarFill: { height: '100%', backgroundColor: '#ff0033' },
  hpText: { color: '#666', marginTop: 5, fontWeight: 'bold', fontSize: 10 },
  middleSection: { flex: 1, justifyContent: 'center', marginVertical: 20 },
  feedCard: { backgroundColor: '#0a0a0a', padding: 15, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#00ff66' },
  feedTitle: { color: '#333', fontSize: 10, fontWeight: 'bold', marginBottom: 8 },
  lastActionText: { color: '#00ff66', fontSize: 14, fontFamily: 'monospace' },
  incidentCard: { padding: 20, borderRadius: 15, borderWidth: 1 },
  myIncidentCard: { backgroundColor: '#0a150a', borderColor: '#00ff66' },
  otherIncidentCard: { backgroundColor: '#150a0a', borderColor: '#ff0033', opacity: 0.8 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incidentTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  incidentDesc: { color: '#aaa', marginVertical: 12, fontSize: 13 },
  waitingContainer: { marginTop: 15, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#300', paddingTop: 10 },
  waitingText: { color: '#ff0033', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  squadProgressBg: { width: '100%', height: 6, backgroundColor: '#200', borderRadius: 3, overflow: 'hidden' },
  squadProgressFill: { height: '100%', backgroundColor: '#00ff66' },
  actionButton: { backgroundColor: '#00ff66', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#000', fontWeight: '900', fontSize: 14 },
  sequenceContainer: { marginTop: 10, alignItems: 'center' },
  sequenceDisplay: { color: '#00ff66', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  sequenceRow: { flexDirection: 'row', gap: 12 },
  seqButton: { backgroundColor: '#111', width: 55, height: 55, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00ff66' },
  seqButtonText: { color: '#00ff66', fontSize: 20, fontWeight: 'bold' },
  puzzleContainer: { marginTop: 10 },
  puzzleInput: { backgroundColor: '#000', borderWidth: 1, borderColor: '#00ff66', color: '#00ff66', padding: 15, borderRadius: 8 },
  footer: { alignItems: 'center', marginBottom: 20 },
  attackButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ff0033', padding: 4 },
  attackInner: { flex: 1, borderRadius: 46, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  attackDisabled: { backgroundColor: '#222' },
  attackText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  playerInfo: { marginTop: 20, alignItems: 'center', width: '100%' },
  playerNick: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  squadHealthContainer: { width: '80%', alignItems: 'center', backgroundColor: '#0a0a0a', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  squadHealthText: { color: '#00ff66', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  squadHpBarBg: { width: '100%', height: 10, backgroundColor: '#222', borderRadius: 5, overflow: 'hidden' },
  squadHpBarFill: { height: '100%', backgroundColor: '#00ff66' },
  squadHpValues: { color: '#666', fontSize: 10, fontWeight: 'bold', marginTop: 4, fontFamily: 'monospace' }
});