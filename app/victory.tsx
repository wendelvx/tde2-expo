import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import axios from 'axios';

export default function VictoryScreen() {
  const router = useRouter();
  const { leaveGame } = useGame();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca o ranking final da Engine em Go
    const fetchRanking = async () => {
      try {
        const response = await axios.get('http://192.168.0.XX:8080/ranking');
        setRanking(response.data);
      } catch (err) {
        console.error("Erro ao buscar ranking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const handleExit = () => {
    leaveGame(); // Limpa socket e estado
    router.replace('/');
  };

  const renderRankItem = ({ item, index }: any) => (
    <View style={[styles.rankCard, index === 0 && styles.mvpCard]}>
      <Text style={styles.rankPos}>{index + 1}º</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rankName}>{item.nickname}</Text>
        <Text style={styles.rankClass}>{item.class.toUpperCase()}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.rankDamage}>{item.total_damage} DMG</Text>
        <Text style={styles.rankSolved}>{item.incidents_solved} FIX</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VITÓRIA!</Text>
        <Text style={styles.subtitle}>A INFRAESTRUTURA FOI SALVA</Text>
      </View>

      <Text style={styles.sectionTitle}>RANKING DA BATALHA</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#00ff66" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item: any) => item.nickname}
          renderItem={renderRankItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleExit}>
        <Text style={styles.buttonText}>RETORNAR AO LOBBY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 25 },
  header: { marginTop: 60, alignItems: 'center', marginBottom: 40 },
  title: { color: '#00ff66', fontSize: 42, fontWeight: '900', letterSpacing: 4 },
  subtitle: { color: '#fff', fontSize: 12, opacity: 0.6, letterSpacing: 1 },
  sectionTitle: { color: '#444', fontSize: 12, fontWeight: 'bold', marginBottom: 15 },
  rankCard: { flexDirection: 'row', backgroundColor: '#111', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  mvpCard: { borderColor: '#00ff66', backgroundColor: '#001a05' },
  rankPos: { color: '#fff', fontSize: 20, fontWeight: 'bold', width: 45 },
  rankName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  rankClass: { color: '#666', fontSize: 10 },
  rankDamage: { color: '#00ff66', fontWeight: 'bold' },
  rankSolved: { color: '#aaa', fontSize: 10 },
  button: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});