import { useGame } from '@/contexts/GameContext';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RANKING_MOCK } from '../constants/gameMocks';

export default function VictoryScreen() {
  const router = useRouter();
  const { leaveGame } = useGame();
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de delay para "computar" os danos finais do Squad
    const timer = setTimeout(() => {
      setRanking(RANKING_MOCK);
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleExit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    leaveGame(); 
    router.replace('/');
  };

  const renderRankItem = ({ item, index }: any) => {
    const isMVP = index === 0;
    
    return (
      <View style={[styles.rankCard, isMVP && styles.mvpCard]}>
        <View style={styles.rankPosContainer}>
           <Text style={[styles.rankPos, isMVP && styles.mvpText]}>{index + 1}º</Text>
           {isMVP && <Text style={styles.mvpLabel}>MVP</Text>}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.rankName}>{item.nickname}</Text>
          <View style={styles.classBadge}>
            <Text style={styles.rankClass}>{item.class.toUpperCase()}</Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.rankDamage}>{item.total_damage} <Text style={styles.unitText}>DMG</Text></Text>
          <Text style={styles.rankSolved}>{item.incidents_solved} <Text style={styles.unitText}>FIX</Text></Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.crownContainer}>
            <Text style={styles.crown}>🏆</Text>
        </View>
        <Text style={styles.title}>VITÓRIA!</Text>
        <Text style={styles.subtitle}>SISTEMAS RESTAURADOS COM SUCESSO</Text>
      </View>

      <View style={styles.statsOverview}>
         <Text style={styles.sectionTitle}>RANKING DO SQUAD</Text>
         <Text style={styles.roomInfo}>INSTÂNCIA: FINAL_BOSS_PROFS</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ff66" />
            <Text style={styles.loadingText}>SINCRONIZANDO LOGS DE COMBATE...</Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item: any) => item.nickname}
          renderItem={renderRankItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleExit}>
        <Text style={styles.buttonText}>RETORNAR AO LOBBY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 25 },
  header: { marginTop: 60, alignItems: 'center', marginBottom: 30 },
  crownContainer: { marginBottom: 10 },
  crown: { fontSize: 40 },
  title: { color: '#00ff66', fontSize: 48, fontWeight: '900', letterSpacing: 4, textShadowColor: 'rgba(0, 255, 102, 0.5)', textShadowRadius: 15 },
  subtitle: { color: '#aaa', fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
  
  statsOverview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#111', paddingBottom: 10 },
  sectionTitle: { color: '#444', fontSize: 12, fontWeight: 'bold' },
  roomInfo: { color: '#00ff66', fontSize: 10, fontFamily: 'monospace' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#333', marginTop: 15, fontSize: 10, letterSpacing: 1, fontFamily: 'monospace' },

  rankCard: { 
    flexDirection: 'row', backgroundColor: '#0a0a0a', padding: 18, borderRadius: 15, 
    marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#111' 
  },
  mvpCard: { borderColor: '#00ff66', backgroundColor: '#001a05', elevation: 10, shadowColor: '#00ff66', shadowOpacity: 0.2, shadowRadius: 10 },
  
  rankPosContainer: { width: 50, alignItems: 'center' },
  rankPos: { color: '#444', fontSize: 22, fontWeight: '900' },
  mvpText: { color: '#00ff66' },
  mvpLabel: { color: '#00ff66', fontSize: 8, fontWeight: 'bold', marginTop: -5 },

  rankName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  classBadge: { alignSelf: 'flex-start', backgroundColor: '#111', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rankClass: { color: '#666', fontSize: 9, fontWeight: 'bold' },

  rankDamage: { color: '#00ff66', fontWeight: '900', fontSize: 16 },
  rankSolved: { color: '#aaa', fontSize: 12, fontWeight: 'bold' },
  unitText: { fontSize: 9, color: '#444' },

  button: { 
    backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', 
    marginTop: 10, marginBottom: 20, shadowColor: '#fff', shadowOpacity: 0.2, shadowRadius: 10 
  },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});