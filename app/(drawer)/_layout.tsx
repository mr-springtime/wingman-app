import { Drawer } from 'expo-router/drawer';
import { Menu, Chrome as Home, Dumbbell, BookOpen, Settings, Map } from 'lucide-react-native';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

export default function DrawerLayout() {
  const renderIcon = useCallback((name: string, color: string) => {
    const props = { size: 24, color, strokeWidth: 2 };
    
    switch (name) {
      case 'home':
        return <Home {...props} />;
      case 'exercises':
        return <Dumbbell {...props} />;
      case 'journeys':
        return <Map {...props} />;
      case 'journal':
        return <BookOpen {...props} />;
      case 'settings':
        return <Settings {...props} />;
      default:
        return <Menu {...props} />;
    }
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        drawerStyle: styles.drawer,
        drawerContentStyle: styles.drawerContent,
        drawerItemStyle: styles.drawerItem,
        drawerLabelStyle: styles.drawerLabel,
        drawerActiveTintColor: '#6366f1',
        drawerInactiveTintColor: '#4b5563',
        drawerType: 'front',
        drawerIcon: ({ color }) => (
          <View style={styles.drawerIconContainer}>
            <Menu size={24} color={color} strokeWidth={2} />
          </View>
        ),
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          drawerIcon: ({ color }) => (
            <View style={styles.drawerIconContainer}>
              {renderIcon('home', color)}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          headerTitle: 'Exercises',
          drawerIcon: ({ color }) => (
            <View style={styles.drawerIconContainer}>
              {renderIcon('exercises', color)}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="journeys"
        options={{
          title: 'Training Journeys',
          headerTitle: 'Training Journeys',
          drawerIcon: ({ color }) => (
            <View style={styles.drawerIconContainer}>
              {renderIcon('journeys', color)}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="journal"
        options={{
          title: 'Journal',
          headerTitle: 'Journal',
          drawerIcon: ({ color }) => (
            <View style={styles.drawerIconContainer}>
              {renderIcon('journal', color)}
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          drawerIcon: ({ color }) => (
            <View style={styles.drawerIconContainer}>
              {renderIcon('settings', color)}
            </View>
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    fontSize: 18,
  },
  drawer: {
    backgroundColor: '#fff',
    width: 280,
  },
  drawerContent: {
    paddingTop: 16,
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 0,
    height: 48,
  },
  drawerLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  drawerIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
});