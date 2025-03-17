import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../types/exercise';
import { JournalEntry } from '../types/journal';
import { TrainingJourney } from '../types/journey';

const EXERCISES_KEY = '@wingman_exercises';
const JOURNAL_KEY = '@wingman_journal';
const JOURNEYS_KEY = '@wingman_journeys';

export const storage = {
  async getExercises(): Promise<Exercise[]> {
    try {
      const data = await AsyncStorage.getItem(EXERCISES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading exercises:', error);
      return [];
    }
  },

  async saveExercises(exercises: Exercise[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
    } catch (error) {
      console.error('Error saving exercises:', error);
      throw new Error('Failed to save exercises');
    }
  },

  async addExercise(exercise: Exercise): Promise<void> {
    try {
      const exercises = await this.getExercises();
      exercises.push(exercise);
      await this.saveExercises(exercises);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw new Error('Failed to add exercise');
    }
  },

  async updateExercise(exercise: Exercise): Promise<void> {
    try {
      const exercises = await this.getExercises();
      const index = exercises.findIndex(e => e.id === exercise.id);
      if (index !== -1) {
        exercises[index] = exercise;
        await this.saveExercises(exercises);
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw new Error('Failed to update exercise');
    }
  },

  async deleteExercise(id: string): Promise<void> {
    try {
      const exercises = await this.getExercises();
      const filtered = exercises.filter(e => e.id !== id);
      if (exercises.length === filtered.length) {
        throw new Error('Exercise not found');
      }
      await this.saveExercises(filtered);
      
      // Also delete related journal entries
      const entries = await this.getJournalEntries();
      const updatedEntries = entries.filter(e => e.exerciseId !== id);
      await this.saveJournalEntries(updatedEntries);

      // Remove exercise from all journeys
      const journeys = await this.getJourneys();
      const updatedJourneys = journeys.map(journey => ({
        ...journey,
        exerciseIds: journey.exerciseIds.filter(eId => eId !== id)
      }));
      await this.saveJourneys(updatedJourneys);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw new Error('Failed to delete exercise');
    }
  },

  // Journal Methods
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const data = await AsyncStorage.getItem(JOURNAL_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  },

  async saveJournalEntries(entries: JournalEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
      throw new Error('Failed to save journal entries');
    }
  },

  async addJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      entries.push(entry);
      await this.saveJournalEntries(entries);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw new Error('Failed to add journal entry');
    }
  },

  async updateJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      const index = entries.findIndex(e => e.id === entry.id);
      if (index !== -1) {
        entries[index] = entry;
        await this.saveJournalEntries(entries);
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw new Error('Failed to update journal entry');
    }
  },

  async deleteJournalEntry(id: string): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      const filtered = entries.filter(e => e.id !== id);
      if (entries.length === filtered.length) {
        throw new Error('Journal entry not found');
      }
      await this.saveJournalEntries(filtered);
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw new Error('Failed to delete journal entry');
    }
  },

  // Journey Methods
  async getJourneys(): Promise<TrainingJourney[]> {
    try {
      const data = await AsyncStorage.getItem(JOURNEYS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading journeys:', error);
      return [];
    }
  },

  async saveJourneys(journeys: TrainingJourney[]): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNEYS_KEY, JSON.stringify(journeys));
    } catch (error) {
      console.error('Error saving journeys:', error);
      throw new Error('Failed to save journeys');
    }
  },

  async addJourney(journey: TrainingJourney): Promise<void> {
    try {
      const journeys = await this.getJourneys();
      journeys.push(journey);
      await this.saveJourneys(journeys);
    } catch (error) {
      console.error('Error adding journey:', error);
      throw new Error('Failed to add journey');
    }
  },

  async updateJourney(journey: TrainingJourney): Promise<void> {
    try {
      const journeys = await this.getJourneys();
      const index = journeys.findIndex(j => j.id === journey.id);
      if (index !== -1) {
        journeys[index] = journey;
        await this.saveJourneys(journeys);
      }
    } catch (error) {
      console.error('Error updating journey:', error);
      throw new Error('Failed to update journey');
    }
  },

  async deleteJourney(id: string): Promise<void> {
    try {
      const journeys = await this.getJourneys();
      const filtered = journeys.filter(j => j.id !== id);
      if (journeys.length === filtered.length) {
        throw new Error('Journey not found');
      }
      await this.saveJourneys(filtered);
    } catch (error) {
      console.error('Error deleting journey:', error);
      throw new Error('Failed to delete journey');
    }
  }
};