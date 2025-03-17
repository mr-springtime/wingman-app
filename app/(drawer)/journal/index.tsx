import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Plus, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { JournalEntry } from '../../../types/journal';
import { Exercise } from '../../../types/exercise';
import { storage } from '../../../utils/storage';

// Define weekdays with unique keys
const WEEKDAYS = [
  { key: 'sun', label: 'S' },
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
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

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const daysWithEntries = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const date = parseISO(entry.completionDate);
      const dateString = format(date, 'yyyy-MM-dd');
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(entry);
      return acc;
    }, {} as Record<string, JournalEntry[]>);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!selectedDate) return entries;
    return entries.filter(entry => 
      isSameDay(parseISO(entry.completionDate), selectedDate)
    );
  }, [entries, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(prev => 
      prev && isSameDay(prev, date) ? null : date
    );
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood - 1];
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'EEEE, MMMM d');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>
              {selectedDate 
                ? format(selectedDate, 'MMMM d, yyyy')
                : 'Track your progress'}
            </Text>
          </View>
          <Link href="/journal/new" asChild>
            <Pressable style={styles.addButton}>
              <Plus size={20} color="#fff" />
            </Pressable>
          </Link>
        </View>
      </View>

      <Pressable 
        style={styles.calendarToggle}
        onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}>
        <Text style={styles.calendarToggleText}>
          {isCalendarExpanded ? 'Hide Calendar' : 'Show Calendar'}
        </Text>
        {isCalendarExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </Pressable>

      {isCalendarExpanded && (
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={handlePrevMonth} style={styles.calendarButton}>
              <ChevronLeft size={20} color="#6b7280" />
            </Pressable>
            <Text style={styles.calendarTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.calendarButton}>
              <ChevronRight size={20} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.weekDays}>
            {WEEKDAYS.map(day => (
              <Text key={day.key} style={styles.weekDay}>{day.label}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map(date => {
              const dateString = format(date, 'yyyy-MM-dd');
              const hasEntries = dateString in daysWithEntries;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);

              return (
                <Pressable
                  key={dateString}
                  style={[
                    styles.dayCell,
                    !isSameMonth(date, currentMonth) && styles.dayOutsideMonth,
                    isSelected && styles.daySelected,
                    isCurrentDay && styles.dayToday,
                  ]}
                  onPress={() => handleSelectDate(date)}>
                  <Text style={[
                    styles.dayText,
                    !isSameMonth(date, currentMonth) && styles.dayTextOutsideMonth,
                    isSelected && styles.dayTextSelected,
                    isCurrentDay && styles.dayTextToday,
                  ]}>
                    {format(date, 'd')}
                  </Text>
                  {hasEntries && <View style={styles.entryDot} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedDate
                ? 'No entries for this date'
                : 'No journal entries yet'}
            </Text>
          </View>
        )}
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  calendarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  calendarToggleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarButton: {
    padding: 4,
  },
  calendarTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6b7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#111827',
  },
  dayOutsideMonth: {
    opacity: 0.5,
  },
  dayTextOutsideMonth: {
    color: '#9ca3af',
  },
  daySelected: {
    backgroundColor: '#818cf8',
    borderRadius: 6,
  },
  dayTextSelected: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  dayToday: {
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  dayTextToday: {
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  entryDot: {
    position: 'absolute',
    bottom: '15%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#6366f1',
  },
  list: {
    padding: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 16,
    color: '#111827',
    marginBottom: 6,
  },
  comment: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});