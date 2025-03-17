import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Wingman</Text>
        <Text style={styles.subtitle}>Your personal social confidence coach</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Challenge</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Make Eye Contact</Text>
          <Text style={styles.cardDescription}>
            Practice making brief eye contact with 3 strangers today. Remember to smile!
          </Text>
          <Link href="/exercises" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Start Exercise</Text>
              <ChevronRight size={20} color="#fff" />
            </Pressable>
          </Link>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipsList}>
          {[
            "Confidence comes from practice and preparation",
            "Focus on genuine connection, not pickup lines",
            "Body language speaks louder than words",
          ].map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontFamily: 'Playfair-Bold',
    fontSize: 32,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4b5563',
  },
});