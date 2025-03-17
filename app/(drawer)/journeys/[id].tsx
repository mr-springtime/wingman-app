import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2, CreditCard as Edit2 } from 'lucide-react-native';
import { TrainingJourney } from '../../../types/journey';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function JourneyDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [journey, setJourney] = useState<TrainingJourney | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [journeys, exerciseList] = await Promise.all([
      storage.getJourneys(),
      storage.getExercises(),
    ]);
    
    const foundJourney = journeys.find(j => j.id === id);
    if (foundJourney) {
      setJourney(foundJourney);
      const journeyExercises = exerciseList.filter(e => 
        foundJourney.exerciseIds.includes(e.id)
      );
      setExercises(journeyExercises);
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Journey',
      'Are you sure you want to delete this training journey?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (journey) {
              await storage.deleteJourney(journey.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (journey) {
      router.push({
        pathname: '/journeys/edit',
        params: { id: journey.id }
      });
    }
  };

  if (!journey) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Journey not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable 
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={24} color="#6b7280" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable 
              onPress={handleEdit}
              style={[styles.actionButton, styles.editButton]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Edit2 size={20} color="#6366f1" />
            </Pressable>
            <Pressable 
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Trash2 size={20} color="#ef4444" />
            </Pressable>
          </View>
        </View>
        <Text style={styles.journeyName}>{journey.name}</Text>
        <Text style={styles.exerciseCount}>
          {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription} numberOfLines={2}>
                {exercise.shortDescription}
              </Text>
              <View style={styles.tags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{exercise.category}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{exercise.difficulty}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#e0e7ff',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  journeyName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
  },
  exerciseCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#6366f1',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4b5563',
  },
});