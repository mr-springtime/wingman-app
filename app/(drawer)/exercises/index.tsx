import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { Search, Plus, ChevronRight } from 'lucide-react-native';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';
import initialData from '../../../data/initial-exercises.json';

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadExercises();
    }, [])
  );

  async function loadExercises() {
    const data = await storage.getExercises();
    if (data.length === 0) {
      await storage.saveExercises(initialData.exercises);
      setExercises(initialData.exercises);
    } else {
      setExercises(data);
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => exercise.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set(exercises.flatMap(e => e.tags)));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/exercises/edit')}>
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView horizontal style={styles.tagsScroll} showsHorizontalScrollIndicator={false}>
        {allTags.map(tag => (
          <Pressable
            key={tag}
            style={[
              styles.tagButton,
              selectedTags.includes(tag) && styles.tagButtonSelected
            ]}
            onPress={() => {
              setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              );
            }}>
            <Text style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.tagTextSelected
            ]}>{tag}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.exerciseCard}
            onPress={() => router.push(`/exercises/${item.id}`)}>
            <View>
              <Text style={styles.exerciseTitle}>{item.title}</Text>
              <Text style={styles.exerciseDescription}>{item.shortDescription}</Text>
              <View style={styles.tags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.category}</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.difficulty}</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#6b7280" />
          </Pressable>
        )}
        contentContainerStyle={styles.list}
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
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsScroll: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagButtonSelected: {
    backgroundColor: '#6366f1',
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4b5563',
  },
  tagTextSelected: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e5e7eb',
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