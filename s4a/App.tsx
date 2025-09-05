// App.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [resentments, setResentments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    who: '',
    what: '',
    affects: '',
    myPart: '',
  });

  // Load resentments on app start
  useEffect(() => {
    loadResentments();
  }, []);

  const loadResentments = async () => {
    try {
      const stored = await AsyncStorage.getItem('resentments');
      if (stored) {
        setResentments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading resentments:', error);
    }
  };

  const saveResentment = async () => {
    if (!formData.who || !formData.what) {
      Alert.alert('Required Fields', 'Please fill in who and what happened');
      return;
    }

    const newResentment = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    const updated = [...resentments, newResentment];
    setResentments(updated);
    
    try {
      await AsyncStorage.setItem('resentments', JSON.stringify(updated));
      setFormData({ who: '', what: '', affects: '', myPart: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving resentment:', error);
      Alert.alert('Error', 'Failed to save resentment');
    }
  };

  const deleteResentment = async (id) => {
    Alert.alert(
      'Delete Resentment',
      'Are you sure you want to delete this?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = resentments.filter(r => r.id !== id);
            setResentments(updated);
            await AsyncStorage.setItem('resentments', JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const ResentmentCard = ({ resentment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{resentment.who}</Text>
        <TouchableOpacity onPress={() => deleteResentment(resentment.id)}>
          <Text style={styles.deleteButton}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardSection}>
        <Text style={styles.label}>What happened:</Text>
        <Text style={styles.cardText}>{resentment.what}</Text>
      </View>
      
      {resentment.affects && (
        <View style={styles.cardSection}>
          <Text style={styles.label}>How it affects me:</Text>
          <Text style={styles.cardText}>{resentment.affects}</Text>
        </View>
      )}
      
      {resentment.myPart && (
        <View style={styles.cardSection}>
          <Text style={styles.label}>My part:</Text>
          <Text style={styles.cardText}>{resentment.myPart}</Text>
        </View>
      )}
      
      <Text style={styles.cardDate}>
        Added: {new Date(resentment.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (showForm) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Resentment</Text>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Who or what am I resentful at? *</Text>
            <TextInput
              style={styles.input}
              value={formData.who}
              onChangeText={(text) => setFormData({...formData, who: text})}
              placeholder="Person, institution, or principle"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>What happened? (The cause) *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.what}
              onChangeText={(text) => setFormData({...formData, what: text})}
              placeholder="Describe what they did..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>How does it affect me?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.affects}
              onChangeText={(text) => setFormData({...formData, affects: text})}
              placeholder="My self-esteem, security, ambitions, relationships..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>What was my part?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.myPart}
              onChangeText={(text) => setFormData({...formData, myPart: text})}
              placeholder="Where was I selfish, dishonest, self-seeking, or frightened?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveResentment}>
            <Text style={styles.saveButtonText}>Save Resentment</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Step 4: Resentments</Text>
        <Text style={styles.subtitle}>{resentments.length} entries</Text>
      </View>

      <ScrollView style={styles.listContainer}>
        {resentments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No resentments added yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to start your inventory
            </Text>
          </View>
        ) : (
          resentments.map((resentment) => (
            <ResentmentCard key={resentment.id} resentment={resentment} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowForm(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5e3aa1',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  deleteButton: {
    fontSize: 28,
    color: '#999',
    paddingLeft: 10,
  },
  cardSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5e3aa1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#5e3aa1',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#5e3aa1',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});