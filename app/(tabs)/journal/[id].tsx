import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { JournalEntry } from '../../../types/journal';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function JournalEntryDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const entries = await storage.getJournalEntries();
    const foundEntry = entries.find(e => e.id === id);
    if (foundEntry) {
      setEntry(foundEntry);
      const exercises = await storage.getExercises();
      const foundExercise = exercises.find(e => e.id === foundEntry.exerciseId);
      if (foundExercise) {
        setExercise(foundExercise);
      }
    }
  }

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (entry) {
              await storage.deleteJournalEntry(entry.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!entry || !exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Entry not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>{formatDate(entry.completionDate)}</Text>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
        </View>
        <Text style={styles.mood}>{getMoodEmoji(entry.mood)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Details</Text>
        <View style={styles.exerciseInfo}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{exercise.category}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{exercise.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.description}>{exercise.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Reflection</Text>
        <Text style={styles.comment}>{entry.comment}</Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 size={20} color="#ef4444" />
        <Text style={styles.deleteButtonText}>Delete Entry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 24,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
  },
  mood: {
    fontSize: 32,
  },
  section: {
    backgroundColor: '#fff',
    padding: 24,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  exerciseInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4b5563',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  comment: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ef4444',
  },
});