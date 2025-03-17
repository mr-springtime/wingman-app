import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function NewJournalEntry() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [mood, setMood] = useState<number>(3);
  const router = useRouter();

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    const data = await storage.getExercises();
    setExercises(data);
  }

  async function handleSubmit() {
    if (!selectedExercise) return;

    const entry = {
      id: Math.random().toString(36).substring(7),
      exerciseId: selectedExercise,
      completionDate: new Date().toISOString(),
      comment,
      mood,
      createdAt: new Date().toISOString(),
    };

    await storage.addJournalEntry(entry);
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Exercise</Text>
        <View style={styles.exerciseGrid}>
          {exercises.map(exercise => (
            <Pressable
              key={exercise.id}
              style={[
                styles.exerciseCard,
                selectedExercise === exercise.id && styles.exerciseCardSelected,
              ]}
              onPress={() => setSelectedExercise(exercise.id)}>
              <Text
                style={[
                  styles.exerciseTitle,
                  selectedExercise === exercise.id && styles.exerciseTitleSelected,
                ]}>
                {exercise.title}
              </Text>
              <Text
                style={[
                  styles.exerciseCategory,
                  selectedExercise === exercise.id && styles.exerciseCategorySelected,
                ]}>
                {exercise.category}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How did it go?</Text>
        <View style={styles.moodSelector}>
          {[1, 2, 3, 4, 5].map(value => (
            <Pressable
              key={value}
              style={[styles.moodButton, mood === value && styles.moodButtonSelected]}
              onPress={() => setMood(value)}>
              <Text style={[styles.moodEmoji, mood === value && styles.moodEmojiSelected]}>
                {['😢', '😕', '😐', '🙂', '😊'][value - 1]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Thoughts</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
        />
      </View>

      <Pressable
        style={[styles.submitButton, !selectedExercise && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedExercise}>
        <Text style={styles.submitButtonText}>Save Entry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  section: {
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseCard: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseCardSelected: {
    backgroundColor: '#818cf8',
    borderColor: '#6366f1',
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  exerciseTitleSelected: {
    color: '#fff',
  },
  exerciseCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseCategorySelected: {
    color: '#e5e7eb',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: '#818cf8',
    borderColor: '#6366f1',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodEmojiSelected: {
    transform: [{ scale: 1.2 }],
  },
  commentInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});