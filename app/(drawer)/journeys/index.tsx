import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Plus, ChevronRight } from 'lucide-react-native';
import { TrainingJourney } from '../../../types/journey';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';
import initialData from '../../../data/initial-journeys.json';
import React from 'react';

export default function Journeys() {
  const [journeys, setJourneys] = useState<TrainingJourney[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const [journeyList, exerciseList] = await Promise.all([
      storage.getJourneys(),
      storage.getExercises(),
    ]);
    
    // Load initial journeys if none exist
    if (journeyList.length === 0) {
      await storage.saveJourneys(initialData.journeys);
      setJourneys(initialData.journeys);
    } else {
      setJourneys(journeyList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
    
    const exerciseMap = exerciseList.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {} as Record<string, Exercise>);
    setExercises(exerciseMap);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80' }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Training Journeys</Text>
            <Text style={styles.subtitle}>Create and manage your training paths</Text>
          </View>
        </View>
        <Link href="/journeys/edit" asChild>
          <Pressable style={styles.addButton}>
            <Plus size={24} color="#fff" />
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={journeys}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Journeys Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first training journey to get started
            </Text>
            <Link href="/journeys/edit" asChild>
              <Pressable style={styles.createButton}>
                <Text style={styles.createButtonText}>Create Journey</Text>
              </Pressable>
            </Link>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={styles.journeyCard}
            onPress={() => router.push(`/journeys/${item.id}`)}>
            <View style={styles.journeyContent}>
              <Text style={styles.journeyName}>{item.name}</Text>
              <Text style={styles.exerciseCount}>
                {item.exerciseIds.length} {item.exerciseIds.length === 1 ? 'exercise' : 'exercises'}
              </Text>
              <View style={styles.exerciseList}>
                {item.exerciseIds.slice(0, 3).map(id => (
                  <Text key={id} style={styles.exerciseName} numberOfLines={1}>
                    • {exercises[id]?.title || 'Unknown Exercise'}
                  </Text>
                ))}
                {item.exerciseIds.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{item.exerciseIds.length - 3} more
                  </Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    height: 200,
    justifyContent: 'flex-end',
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerText: {
    padding: 24,
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#e5e7eb',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: -20,
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  list: {
    padding: 24,
    paddingTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  journeyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  journeyContent: {
    flex: 1,
  },
  journeyName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  exerciseCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  exerciseList: {
    gap: 4,
  },
  exerciseName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4b5563',
  },
  moreExercises: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});