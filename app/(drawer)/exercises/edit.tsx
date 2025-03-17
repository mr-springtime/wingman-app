import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Plus, Minus } from 'lucide-react-native';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

type Category = 'self-practice' | 'social-practice';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export default function EditExercise() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = params.id != null;

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('self-practice');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      setIsLoading(true);
      
      // Load existing tags from all exercises
      const exercises = await storage.getExercises();
      const allTags = exercises.flatMap(exercise => exercise.tags);
      const uniqueTags = Array.from(new Set(allTags));
      setExistingTags(uniqueTags);

      // If editing, load the exercise data
      if (isEditing && params.id) {
        const exercise = exercises.find(e => e.id === params.id);
        if (exercise) {
          setTitle(exercise.title);
          setShortDescription(exercise.shortDescription);
          setDescription(exercise.description);
          setCategory(exercise.category);
          setDifficulty(exercise.difficulty);
          setTags(exercise.tags);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load exercise data');
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

  const filteredSuggestions = existingTags.filter(tag => 
    tag.toLowerCase().includes(newTag.toLowerCase()) && 
    !tags.includes(tag) &&
    newTag.length > 0
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (tagToAdd = newTag) => {
    if (tagToAdd.trim() && !tags.includes(tagToAdd.trim())) {
      setTags([...tags, tagToAdd.trim()]);
      setNewTag('');
      setShowTagSuggestions(false);
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!validateForm() || isSaving) return;

    setIsSaving(true);

    try {
      const exercise: Exercise = {
        id: isEditing ? String(params.id) : Math.random().toString(36).substring(7),
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        category,
        difficulty,
        tags,
      };

      if (isEditing) {
        await storage.updateExercise(exercise);
      } else {
        await storage.addExercise(exercise);
      }

      router.back();
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save exercise. Please try again.');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Exercise' : 'New Exercise'}
        </Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#6b7280" />
        </Pressable>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={text => {
              setTitle(text);
              setErrors(prev => ({ ...prev, title: '' }));
            }}
            placeholder="Enter exercise title"
            placeholderTextColor="#9ca3af"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={[styles.input, errors.shortDescription && styles.inputError]}
            value={shortDescription}
            onChangeText={text => {
              setShortDescription(text);
              setErrors(prev => ({ ...prev, shortDescription: '' }));
            }}
            placeholder="Brief overview of the exercise"
            placeholderTextColor="#9ca3af"
          />
          {errors.shortDescription && (
            <Text style={styles.errorText}>{errors.shortDescription}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Description</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={description}
            onChangeText={text => {
              setDescription(text);
              setErrors(prev => ({ ...prev, description: '' }));
            }}
            placeholder="Detailed instructions and guidance"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={Platform.OS === 'ios' ? 0 : 4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsContainer}>
            {(['self-practice', 'social-practice'] as Category[]).map((cat) => (
              <Pressable
                key={cat}
                style={[styles.option, category === cat && styles.optionSelected]}
                onPress={() => setCategory(cat)}>
                <Text
                  style={[
                    styles.optionText,
                    category === cat && styles.optionTextSelected,
                  ]}>
                  {cat.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.optionsContainer}>
            {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
              <Pressable
                key={diff}
                style={[styles.option, difficulty === diff && styles.optionSelected]}
                onPress={() => setDifficulty(diff)}>
                <Text
                  style={[
                    styles.optionText,
                    difficulty === diff && styles.optionTextSelected,
                  ]}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagInput}>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInputField}
                value={newTag}
                onChangeText={(text) => {
                  setNewTag(text);
                  setShowTagSuggestions(true);
                }}
                placeholder="Add a tag"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={() => handleAddTag()}
              />
              {showTagSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredSuggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      style={styles.suggestionItem}
                      onPress={() => handleAddTag(suggestion)}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <Pressable 
              style={[styles.addTagButton, !newTag.trim() && styles.addTagButtonDisabled]}
              onPress={() => handleAddTag()}
              disabled={!newTag.trim()}>
              <Plus size={20} color="#fff" />
            </Pressable>
          </View>
          {errors.tags && <Text style={styles.errorText}>{errors.tags}</Text>}
          <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <Pressable
                  style={styles.removeTagButton}
                  onPress={() => handleRemoveTag(tag)}>
                  <Minus size={16} color="#6b7280" />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Pressable 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}>
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Exercise')}
          </Text>
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
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    height: 120,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#818cf8',
    borderColor: '#6366f1',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  tagInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagInputContainer: {
    flex: 1,
    position: 'relative',
  },
  tagInputField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
  },
  addTagButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
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