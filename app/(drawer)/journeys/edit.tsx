import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Plus, Minus, Search, ChevronDown } from 'lucide-react-native';
import { TrainingJourney } from '../../../types/journey';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

type ExerciseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  availableExercises: Exercise[];
  selectedExercises: Exercise[];
};

function ExerciseModal({ visible, onClose, onSelect, availableExercises, selectedExercises }: ExerciseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery('');
      setSelectedTags([]);
    }
  }, [visible]);

  const allTags = Array.from(new Set(
    availableExercises.flatMap(exercise => exercise.tags)
  )).sort();

  const filteredExercises = availableExercises.filter(exercise => {
    const matchesSearch = !searchQuery || 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => exercise.tags.includes(tag));
    
    const notSelected = !selectedExercises.some(selected => selected.id === exercise.id);

    return matchesSearch && matchesTags && notSelected;
  });

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleSelect = useCallback((exercise: Exercise) => {
    onSelect(exercise);
  }, [onSelect]);

  const renderTag = useCallback(({ item: tag }: { item: string }) => (
    <Pressable
      key={tag}
      style={[
        styles.tagButton,
        selectedTags.includes(tag) && styles.tagButtonSelected
      ]}
      onPress={() => toggleTag(tag)}>
      <Text style={[
        styles.tagButtonText,
        selectedTags.includes(tag) && styles.tagButtonTextSelected
      ]}>{tag}</Text>
    </Pressable>
  ), [selectedTags]);

  const renderExercise = useCallback(({ item: exercise }: { item: Exercise }) => (
    <Pressable
      key={exercise.id}
      style={styles.exerciseItem}
      onPress={() => handleSelect(exercise)}>
      <View style={styles.exerciseItemContent}>
        <Text style={styles.exerciseItemTitle}>{exercise.title}</Text>
        <Text style={styles.exerciseItemCategory}>{exercise.category}</Text>
        <View style={styles.exerciseItemTags}>
          {exercise.tags.map(tag => (
            <View key={tag} style={styles.exerciseItemTag}>
              <Text style={styles.exerciseItemTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      <Plus size={20} color="#6366f1" />
    </Pressable>
  ), []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <Pressable
              onPress={onClose}
              style={styles.modalCloseButton}>
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
              placeholderTextColor="#9ca3af"
              autoFocus
            />
          </View>

          <View style={styles.tagsContainer}>
            <FlatList
              data={allTags}
              renderItem={renderTag}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScrollContent}
              style={styles.tagsScroll}
            />
          </View>

          <FlatList
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={(item) => item.id}
            style={styles.exerciseList}
            contentContainerStyle={styles.exerciseListContent}
            ListEmptyComponent={() => (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No exercises found</Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function EditJourney() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = params.id != null;

  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      setIsLoading(true);
      
      const exercises = await storage.getExercises();
      setAvailableExercises(exercises);

      if (isEditing && params.id) {
        const journeys = await storage.getJourneys();
        const journey = journeys.find(j => j.id === params.id);
        if (journey) {
          setName(journey.name);
          const journeyExercises = exercises.filter(e => 
            journey.exerciseIds.includes(e.id)
          );
          setSelectedExercises(journeyExercises);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load journey data');
    } finally {
      setIsLoading(false);
    }
  }

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Journey name is required';
    }
    if (selectedExercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]);
    setErrors(prev => ({ ...prev, exercises: '' }));
    setShowExerciseModal(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const handleSave = async () => {
    if (!validateForm() || isSaving) return;

    setIsSaving(true);

    try {
      const journey: TrainingJourney = {
        id: isEditing ? String(params.id) : Math.random().toString(36).substring(7),
        name: name.trim(),
        exerciseIds: selectedExercises.map(e => e.id),
        createdAt: new Date().toISOString(),
      };

      if (isEditing) {
        await storage.updateJourney(journey);
      } else {
        await storage.addJourney(journey);
      }

      router.back();
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save journey. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Journey' : 'New Journey'}
        </Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </Pressable>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Journey Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={text => {
                setName(text);
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="Enter journey name"
              placeholderTextColor="#9ca3af"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Selected Exercises</Text>
            <Pressable
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseModal(true)}>
              <Search size={20} color="#6b7280" />
              <Text style={styles.addExerciseButtonText}>
                {selectedExercises.length === 0
                  ? 'Search and add exercises'
                  : 'Add more exercises'}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </Pressable>

            <View style={styles.selectedExercisesContainer}>
              {selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.selectedExercise}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                    <View style={styles.exerciseTags}>
                      {exercise.tags.map(tag => (
                        <View key={tag} style={styles.exerciseTag}>
                          <Text style={styles.exerciseTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveExercise(exercise.id)}>
                    <Minus size={20} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
            {errors.exercises && (
              <Text style={styles.errorText}>{errors.exercises}</Text>
            )}
          </View>

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}>
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Journey')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <ExerciseModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelect={handleAddExercise}
        availableExercises={availableExercises}
        selectedExercises={selectedExercises}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  addExerciseButtonText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  selectedExercisesContainer: {
    gap: 8,
  },
  selectedExercise: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
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
  exerciseCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  exerciseTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseTagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4b5563',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
  },
  modalCloseButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  tagsContainer: {
    marginBottom: 12,
    height: 44,
  },
  tagsScroll: {
    flexGrow: 0,
  },
  tagsScrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  tagButtonSelected: {
    backgroundColor: '#818cf8',
    borderColor: '#6366f1',
  },
  tagButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4b5563',
  },
  tagButtonTextSelected: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    paddingBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  exerciseItemCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  exerciseItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  exerciseItemTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseItemTagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4b5563',
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});