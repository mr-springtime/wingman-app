import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, FlatList, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronDown, Check, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

export default function NewJournalEntry() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [comment, setComment] = useState('');
  const [mood, setMood] = useState<number>(3);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      const data = await storage.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      showError('Failed to load exercises. Please try again.');
    }
  }

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDropdown(false);
    setSearchQuery('');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDate(currentDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={format(date, 'yyyy-MM-dd')}
          onChange={(e) => setDate(new Date(e.target.value))}
          max={format(new Date(), 'yyyy-MM-dd')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
        />
      );
    }

    if (showDatePicker) {
      return (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      );
    }

    return null;
  };

  async function handleSubmit() {
    if (!selectedExercise) {
      showError('Please select an exercise');
      return;
    }

    if (!comment.trim()) {
      showError('Please add your thoughts about the exercise');
      return;
    }

    setIsSaving(true);

    try {
      const entry = {
        id: Math.random().toString(36).substring(7),
        exerciseId: selectedExercise.id,
        completionDate: date.toISOString(),
        comment: comment.trim(),
        mood,
        createdAt: new Date().toISOString(),
      };

      await storage.addJournalEntry(entry);
      router.back();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      showError('Failed to save your journal entry. Please try again.');
      setIsSaving(false);
    }
  }

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <Pressable
      style={styles.dropdownItem}
      onPress={() => handleSelectExercise(item)}>
      <View style={styles.dropdownItemContent}>
        <View>
          <Text style={styles.dropdownItemTitle}>{item.title}</Text>
          <Text style={styles.dropdownItemCategory}>{item.category}</Text>
        </View>
        {selectedExercise?.id === item.id && (
          <Check size={20} color="#6366f1" />
        )}
      </View>
      <View style={styles.tagContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  ), [selectedExercise]);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Exercise</Text>
        <View style={styles.searchContainer}>
          <Pressable
            style={styles.searchInput}
            onPress={() => setShowExerciseDropdown(true)}>
            <View style={styles.searchInputContent}>
              <Search size={20} color="#6b7280" />
              {selectedExercise ? (
                <Text style={styles.selectedExerciseText}>
                  {selectedExercise.title}
                </Text>
              ) : (
                <Text style={styles.placeholderText}>
                  Search for an exercise...
                </Text>
              )}
            </View>
            <ChevronDown size={20} color="#6b7280" />
          </Pressable>
        </View>

        {showExerciseDropdown && (
          <View style={styles.dropdownContainer}>
            <TextInput
              style={styles.dropdownSearchInput}
              placeholder="Type to search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <FlatList
              data={filteredExercises}
              renderItem={renderExerciseItem}
              keyExtractor={item => item.id}
              style={styles.dropdown}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>When did you do this exercise?</Text>
        <Pressable
          style={styles.dateButton}
          onPress={Platform.OS === 'web' ? undefined : showDatePickerModal}>
          <Calendar size={20} color="#6b7280" />
          <Text style={styles.dateButtonText}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </Text>
          <ChevronDown size={20} color="#6b7280" />
          {renderDatePicker()}
        </Pressable>
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
        style={[
          styles.submitButton,
          (!selectedExercise || !comment.trim() || isSaving) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!selectedExercise || !comment.trim() || isSaving}>
        <Text style={styles.submitButtonText}>
          {isSaving ? 'Saving...' : 'Save Entry'}
        </Text>
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
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedExerciseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#9ca3af',
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownSearchInput: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  dropdown: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dropdownItemTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  dropdownItemCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4b5563',
  },
  dateButton: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    flex: 1,
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