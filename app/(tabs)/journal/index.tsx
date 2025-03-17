import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Plus, ChevronRight } from 'lucide-react-native';
import { JournalEntry } from '../../../types/journal';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [journalEntries, exerciseList] = await Promise.all([
      storage.getJournalEntries(),
      storage.getExercises(),
    ]);
    
    setEntries(journalEntries.sort((a, b) => 
      new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime()
    ));
    
    const exerciseMap = exerciseList.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {} as Record<string, Exercise>);
    setExercises(exerciseMap);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506252374453-ef5237291d83?w=800&auto=format&fit=crop&q=80' }}
            style={styles.headerImage}
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Your Journey</Text>
            <Text style={styles.subtitle}>Track your progress and growth</Text>
          </View>
        </View>
        <Link href="/journal/new" asChild>
          <Pressable style={styles.addButton}>
            <Plus size={24} color="#fff" />
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.entryCard}
            onPress={() => router.push(`/journal/${item.id}`)}>
            <View style={styles.entryHeader}>
              <Text style={styles.date}>
                {formatDate(item.completionDate)}
              </Text>
              <Text style={styles.mood}>{getMoodEmoji(item.mood)}</Text>
            </View>
            <Text style={styles.exerciseTitle}>
              {exercises[item.exerciseId]?.title || 'Unknown Exercise'}
            </Text>
            <Text style={styles.comment} numberOfLines={2}>
              {item.comment}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.category}>
                {exercises[item.exerciseId]?.category || 'Unknown Category'}
              </Text>
              <ChevronRight size={20} color="#6b7280" />
            </View>
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
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  mood: {
    fontSize: 20,
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  comment: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});