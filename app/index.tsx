import { useGame } from '@/contexts/GameContext';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const { joinGame } = useGame();
  
  const [form, setForm] = useState({ nickname: '', room: '', class: '' });

  const AVAILABLE_ROOMS = ['ADS_2026', 'SI_UNIFAP', 'DEV_LAB_01'];

  const classesData = [
    { 
      id: 'front-end', 
      label: 'Front-end',
      role: 'Especialista em UI/UX',
      bonus: 'Dano Crítico contra bugs visuais e Layout Shifts.',
      passive: 'Renderização Rápida: Reduz o cooldown de ataques.'
    },
    { 
      id: 'back-end', 
      label: 'Back-end',
      role: 'Mestre da Lógica',
      bonus: 'Dano Crítico contra Deadlocks e gargalos de banco.',
      passive: 'Conexão Persistente: Imune a desconexões rápidas.'
    },
    { 
      id: 'devops', 
      label: 'DevOps',
      role: 'Guardião da Infraestrutura',
      bonus: 'Dano massivo contra Bosses de Infra.',
      passive: 'Auto-Scaling: Aumenta o HP global da equipe.'
    },
    { 
      id: 'qa', 
      label: 'QA (Tester)',
      role: 'Caçador de Anomalias',
      bonus: 'Dano Crítico contra Regressões e Bugs.',
      passive: 'Visão de Raio-X: Identifica o incidente 1s mais rápido.'
    },
    { 
      id: 'security', 
      label: 'Security',
      role: 'Especialista em Cibersegurança',
      bonus: 'Dano Crítico contra SQLi e vazamento de chaves.',
      passive: 'Firewall Humano: Reduz o dano recebido pelo Squad.'
    },
  ];

  const handleSelectClass = (classId: string) => {
    Haptics.selectionAsync();
    setForm({ ...form, class: classId });
  };

  const handleSelectRoom = (roomName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setForm({ ...form, room: roomName });
  };

  const handleEnterMasmorra = () => {
    if (!form.nickname || !form.class || !form.room) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return alert("Preencha Nickname, Sala e selecione uma Classe!");
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    joinGame(form.nickname, form.class, form.room);
    router.push('/arena');
  };

  const selectedClassData = classesData.find(c => c.id === form.class);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>DUNGEON MASTER</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.sectionTitle}>Identificação do Player</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Seu Nickname..." 
          placeholderTextColor="#666"
          value={form.nickname}
          onChangeText={(t) => setForm({...form, nickname: t})}
        />

        <View style={styles.roomContainer}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="Código da Sala" 
            placeholderTextColor="#666"
            autoCapitalize="characters"
            value={form.room}
            onChangeText={(t) => setForm({...form, room: t.toUpperCase()})}
          />
        </View>

        {/* Sugestões de Salas Ativas */}
        <View style={styles.roomSuggestions}>
          <Text style={styles.suggestionTitle}>Instâncias Ativas:</Text>
          <View style={styles.roomBadgeList}>
            {AVAILABLE_ROOMS.map(room => (
              <TouchableOpacity 
                key={room} 
                onPress={() => handleSelectRoom(room)}
                style={[styles.roomBadge, form.room === room && styles.selectedRoomBadge]}
              >
                <Text style={[styles.roomBadgeText, form.room === room && styles.selectedRoomBadgeText]}>
                  {room}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Selecione sua Especialidade</Text>
      <View style={styles.grid}>
        {classesData.map((c) => (
          <TouchableOpacity 
            key={c.id}
            onPress={() => handleSelectClass(c.id)}
            style={[styles.classCard, form.class === c.id && styles.selectedCard]}
          >
            <Text style={[styles.classText, form.class === c.id && styles.selectedText]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedClassData && (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsRole}>{selectedClassData.role}</Text>
          <Text style={styles.detailsText}><Text style={styles.detailsHighlight}>⚔️ Bônus:</Text> {selectedClassData.bonus}</Text>
          <Text style={styles.detailsText}><Text style={styles.detailsHighlight}>🛡️ Passiva:</Text> {selectedClassData.passive}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleEnterMasmorra}>
        <Text style={styles.buttonText}>CONECTAR AO SERVIDOR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#000', padding: 25, paddingBottom: 50 },
  title: { fontSize: 34, color: '#ff0033', fontWeight: '900', textAlign: 'center', marginBottom: 30, letterSpacing: 2, marginTop: 40 },
  
  inputGroup: { gap: 10, marginBottom: 25 },
  input: { backgroundColor: '#111', borderRadius: 12, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#222' },
  
  roomContainer: { flexDirection: 'row', gap: 10 },
  roomSuggestions: { marginTop: 8 },
  suggestionTitle: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  roomBadgeList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomBadge: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  selectedRoomBadge: { borderColor: '#00ff66', backgroundColor: '#002200' },
  roomBadgeText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  selectedRoomBadgeText: { color: '#00ff66' },

  sectionTitle: { color: '#888', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  classCard: { width: '48%', padding: 15, borderRadius: 12, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  selectedCard: { borderColor: '#00ff66', backgroundColor: '#0a1a0a' },
  classText: { color: '#666', fontWeight: 'bold' },
  selectedText: { color: '#00ff66' },

  detailsPanel: { backgroundColor: '#0a0a0a', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#00ff66' },
  detailsRole: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  detailsText: { color: '#aaa', fontSize: 13, marginTop: 4, lineHeight: 18 },
  detailsHighlight: { color: '#00ff66', fontWeight: 'bold' },
  
  button: { backgroundColor: '#ff0033', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#ff0033', shadowOpacity: 0.4, shadowRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});