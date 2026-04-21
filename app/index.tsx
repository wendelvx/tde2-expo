import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import * as Haptics from 'expo-haptics';

export default function OnboardingScreen() {
  const router = useRouter();
  const { joinGame } = useGame();
  
  // RF09: Agora a sala não é fixa, o usuário digita (ex: "ADS_NOITE", "SALA_A")
  const [form, setForm] = useState({ nickname: '', room: '', class: '' });

  // RF10: Dados ricos para exibição dos bônus e passivas
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
      bonus: 'Dano massivo contra Bosses de Infra (Prof. de DevOps).',
      passive: 'Auto-Scaling: Aumenta o HP global da equipe.'
    },
    { 
      id: 'qa', 
      label: 'QA (Tester)',
      role: 'Caçador de Anomalias',
      bonus: 'Dano Crítico contra Regressões e Bugs em Produção.',
      passive: 'Visão de Raio-X: Identifica o tipo de incidente 1s mais rápido.'
    },
    { 
      id: 'security', 
      label: 'Security',
      role: 'Especialista em Cibersegurança',
      bonus: 'Dano Crítico contra injeções SQL e vazamento de chaves.',
      passive: 'Firewall Humano: Reduz o dano que o Boss causa à equipe.'
    },
  ];

  const handleSelectClass = (classId: string) => {
    Haptics.selectionAsync(); // Vibração leve ao selecionar
    setForm({ ...form, class: classId });
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>DUNGEON MASTER</Text>
      
      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} 
          placeholder="Seu Nickname..." 
          placeholderTextColor="#666"
          onChangeText={(t) => setForm({...form, nickname: t})}
        />
        {/* RF09: Input da Sala */}
        <TextInput 
          style={styles.input} 
          placeholder="Código da Sala (Ex: ADS2026)" 
          placeholderTextColor="#666"
          autoCapitalize="characters"
          onChangeText={(t) => setForm({...form, room: t.toUpperCase()})}
        />
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

      {/* RF10: Painel de Inspeção da Classe */}
      {selectedClassData && (
        <View style={styles.detailsPanel}>
          <Text style={styles.detailsRole}>{selectedClassData.role}</Text>
          <Text style={styles.detailsText}><Text style={styles.detailsHighlight}>⚔️ Bônus:</Text> {selectedClassData.bonus}</Text>
          <Text style={styles.detailsText}><Text style={styles.detailsHighlight}>🛡️ Passiva:</Text> {selectedClassData.passive}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleEnterMasmorra}>
        <Text style={styles.buttonText}>ENTRAR NA MASMORRA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#000', padding: 25, justifyContent: 'center' },
  title: { fontSize: 32, color: '#ff0033', fontWeight: '900', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  inputGroup: { gap: 15, marginBottom: 25 },
  input: { backgroundColor: '#111', borderRadius: 12, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  sectionTitle: { color: '#888', marginBottom: 15, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  classCard: { width: '48%', padding: 15, borderRadius: 12, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  selectedCard: { borderColor: '#00ff66', backgroundColor: '#002200' },
  classText: { color: '#666', fontWeight: 'bold' },
  selectedText: { color: '#00ff66' },
  detailsPanel: { backgroundColor: '#0a0a0a', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#00ff66' },
  detailsRole: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  detailsText: { color: '#aaa', fontSize: 13, marginTop: 4, lineHeight: 18 },
  detailsHighlight: { color: '#00ff66', fontWeight: 'bold' },
  button: { backgroundColor: '#ff0033', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 }
});