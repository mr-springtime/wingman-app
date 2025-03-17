import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, router } from 'expo-router';
import { ArrowLeft, Clock, Target, Award, BookOpen, Pencil, Trash2 } from 'lucide-react-native';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [id]);

  async function loadExercise() {
    const exercises = await storage.getExercises();
    const found = exercises.find(e => e.id === id);
    if (found) {
      setExercise(found);
    }
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    if (exercise) {
      router.push({
        pathname: '/exercises/edit',
        params: { id: exercise.id }
      });
    }
  };

  const handleDelete = async () => {
    if (!exercise?.id || isDeleting) return;

    const confirmDelete = () => {
      setIsDeleting(true);
      storage.deleteExercise(exercise.id)
        .then(() => {
          router.replace('/exercises');
        })
        .catch((error) => {
          console.error('Delete error:', error);
          if (Platform.OS === 'web') {
            window.alert('Failed to delete exercise. Please try again.');
          } else {
            Alert.alert('Error', 'Failed to delete exercise. Please try again.');
          }
        })
        .finally(() => {
          setIsDeleting(false);
        });
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Exercise',
        'Are you sure you want to delete this exercise? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: confirmDelete
          }
        ]
      );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#22c55e';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Pressable 
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowLeft size={24} color="#fff" />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable 
                onPress={handleEdit}
                style={[styles.actionButton, styles.editButton]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Pencil size={20} color="#6366f1" />
              </Pressable>
              <Pressable 
                onPress={handleDelete}
                disabled={isDeleting}
                style={[
                  styles.actionButton, 
                  styles.deleteButton,
                  isDeleting && styles.disabledButton
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Trash2 size={20} color={isDeleting ? '#9ca3af' : '#ef4444'} />
              </Pressable>
            </View>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.category}>{exercise.category}</Text>
            <Text style={styles.title}>{exercise.title}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Target size={20} color="#6366f1" />
            <Text style={styles.statLabel}>Category</Text>
            <Text style={styles.statValue}>{exercise.category}</Text>
          </View>
          <View style={styles.stat}>
            <Award size={20} color="#6366f1" />
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={[styles.statValue, { color: getDifficultyColor(exercise.difficulty) }]}>
              {exercise.difficulty}
            </Text>
          </View>
          <View style={styles.stat}>
            <Clock size={20} color="#6366f1" />
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>15-30 min</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tags}>
            {exercise.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.startButton}>
          <BookOpen size={20} color="#fff" style={styles.startIcon} />
          <Text style={styles.startButtonText}>Start Exercise</Text>
        </Pressable>
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
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  titleContainer: {
    gap: 8,
  },
  category: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#e5e7eb',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: -48,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  startButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  startIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});