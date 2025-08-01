import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ImageBackground,
  PanGestureHandler,
  State
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { format, isToday, isPast, addDays } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

// Motivational Quotes
const MOTIVATIONAL_QUOTES = [
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Don't let yesterday take up too much of today. - Will Rogers",
  "You learn more from failure than from success. - Unknown",
  "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
  "If you are working on something that you really care about, you don't have to be pushed. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "Believe you can and you're halfway there. - Theodore Roosevelt"
];

// Color Themes
const THEMES = {
  gradient1: ['#667eea', '#764ba2'],
  gradient2: ['#f093fb', '#f5576c'],
  gradient3: ['#4facfe', '#00f2fe'],
  gradient4: ['#43e97b', '#38f9d7'],
  gradient5: ['#fa709a', '#fee140'],
  gradient6: ['#a8edea', '#fed6e3'],
  gradient7: ['#ff9a9e', '#fecfef'],
  gradient8: ['#ffecd2', '#fcb69f']
};

// Task Context
const TaskContext = createContext();

// Google OAuth Config (Replace with your actual client ID)
const GOOGLE_CLIENT_ID = '106563872480-l2ttadtffv8avj8hsj36femjr1fv9dk0.apps.googleusercontent.com';

const App = () => {
  return (
    <TaskProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <MainApp />
      </SafeAreaView>
    </TaskProvider>
  );
};

// Enhanced Task Provider with more features
const TaskProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTheme, setCurrentTheme] = useState('gradient1');
  const [showQuotes, setShowQuotes] = useState(true);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [streak, setStreak] = useState(0);

  // Google OAuth Setup
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuth(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleAuth = async (token) => {
    try {
      setLoading(true);
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`
      );
      const userInfo = await userInfoResponse.json();
      setUser(userInfo);
      initializeSampleTasks();
    } catch (error) {
      Alert.alert('Login Error', 'Failed to authenticate with Google');
      // Demo fallback
      handleDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      given_name: 'Demo User',
      email: 'demo@todoapp.com',
      picture: 'https://via.placeholder.com/150',
    };
    setUser(demoUser);
    initializeSampleTasks();
  };

  const initializeSampleTasks = () => {
    const sampleTasks = [
      {
        id: '1',
        title: '🚀 Complete hackathon project',
        description: 'Build an amazing todo app with all required features',
        dueDate: new Date().toISOString(),
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
        category: 'Work'
      },
      {
        id: '2',
        title: '📚 Learn React Native animations',
        description: 'Master animations for better user experience',
        dueDate: addDays(new Date(), 1).toISOString(),
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        category: 'Learning'
      },
      {
        id: '3',
        title: '💪 Morning workout',
        description: '30 minutes cardio and strength training',
        dueDate: new Date().toISOString(),
        status: 'completed',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        category: 'Health'
      },
      {
        id: '4',
        title: '🛒 Buy groceries',
        description: 'Milk, eggs, bread, and vegetables',
        dueDate: addDays(new Date(), 2).toISOString(),
        status: 'pending',
        priority: 'low',
        createdAt: new Date().toISOString(),
        category: 'Personal'
      }
    ];
    setTasks(sampleTasks);
    updateStats(sampleTasks);
  };

  const updateStats = (taskList) => {
    const completed = taskList.filter(task => task.status === 'completed').length;
    setCompletedTasksCount(completed);
    setStreak(Math.floor(completed / 3)); // Simple streak calculation
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };

  const updateTask = (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
        : task
    );
    setTasks(updatedTasks);
    updateStats(updatedTasks);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const value = {
    user, setUser, tasks: filteredTasks, allTasks: tasks, loading, filter, setFilter,
    searchQuery, setSearchQuery, addTask, updateTask, deleteTask, toggleTaskStatus,
    promptAsync, currentTheme, setCurrentTheme, showQuotes, setShowQuotes,
    completedTasksCount, streak, handleDemoLogin
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

const MainApp = () => {
  const { user } = useContext(TaskContext);
  
  if (!user) {
    return <EnhancedLoginScreen />;
  }

  return <EnhancedHomeScreen />;
};

// Enhanced Login Screen with beautiful UI
const EnhancedLoginScreen = () => {
  const { promptAsync, loading, handleDemoLogin } = useContext(TaskContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={THEMES.gradient1} style={styles.loginContainer}>
      <Animated.View 
        style={[
          styles.loginContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="checkbox" size={100} color="#fff" />
          <Text style={styles.loginTitle}>TaskMaster Pro</Text>
          <Text style={styles.loginSubtitle}>
            Transform your productivity with beautiful task management
          </Text>
        </View>

        <View style={styles.loginButtons}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4285f4', '#34a853']}
              style={styles.buttonGradient}
            >
              <Ionicons name="logo-google" size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoLogin}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Try Demo Mode</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          🔒 Secure • 🚀 Fast • ✨ Beautiful
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

// Enhanced Home Screen with quotes and stats
const EnhancedHomeScreen = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.homeContainer}>
      <EnhancedHeader />
      <MotivationalQuotes />
      <StatsBar onStatsPress={() => setShowStatsModal(true)} />
      <FilterBar />
      <TaskList refreshing={refreshing} onRefresh={onRefresh} />
      <EnhancedFAB onPress={() => setShowAddModal(true)} />
      <EnhancedAddTaskModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      <StatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </View>
  );
};

// Motivational Quotes Slider
const MotivationalQuotes = () => {
  const { showQuotes } = useContext(TaskContext);
  const [currentQuote, setCurrentQuote] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!showQuotes) return;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentQuote(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showQuotes]);

  if (!showQuotes) return null;

  return (
    <Animated.View style={[styles.quotesContainer, { opacity: fadeAnim }]}>
      <LinearGradient colors={THEMES.gradient3} style={styles.quoteCard}>
        <Ionicons name="bulb" size={20} color="#fff" style={styles.quoteIcon} />
        <Text style={styles.quoteText}>
          {MOTIVATIONAL_QUOTES[currentQuote]}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Stats Bar
const StatsBar = ({ onStatsPress }) => {
  const { completedTasksCount, allTasks, streak } = useContext(TaskContext);
  const totalTasks = allTasks.length;
  const pendingTasks = allTasks.filter(t => t.status === 'pending').length;

  return (
    <TouchableOpacity style={styles.statsBar} onPress={onStatsPress}>
      <LinearGradient colors={THEMES.gradient4} style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedTasksCount}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingTasks}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streak}🔥</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Enhanced Header
const EnhancedHeader = () => {
  const { user, setUser, searchQuery, setSearchQuery, currentTheme, setCurrentTheme } = useContext(TaskContext);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <LinearGradient colors={THEMES[currentTheme]} style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello, {user?.given_name || 'User'}! 👋</Text>
          <Text style={styles.subGreeting}>Let's make today productive</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => setShowThemeSelector(!showThemeSelector)}
          >
            <Ionicons name="color-palette" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: () => setUser(null) },
              ]);
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showThemeSelector && (
        <View style={styles.themeSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(THEMES).map(([key, colors]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setCurrentTheme(key);
                  setShowThemeSelector(false);
                }}
              >
                <LinearGradient colors={colors} style={styles.themeOption} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
};

// Enhanced Filter Bar
const FilterBar = () => {
  const { filter, setFilter, allTasks } = useContext(TaskContext);

  const filters = [
    { key: 'all', label: 'All', count: allTasks.length, color: THEMES.gradient1 },
    { key: 'pending', label: 'Pending', count: allTasks.filter(t => t.status === 'pending').length, color: THEMES.gradient2 },
    { key: 'completed', label: 'Done', count: allTasks.filter(t => t.status === 'completed').length, color: THEMES.gradient4 },
  ];

  return (
    <View style={styles.filterBar}>
      {filters.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.filterButtonContainer}
          onPress={() => setFilter(item.key)}
        >
          <LinearGradient
            colors={filter === item.key ? item.color : ['#f8f9fa', '#e9ecef']}
            style={styles.filterButton}
          >
            <Text style={[
              styles.filterText,
              { color: filter === item.key ? '#fff' : '#6b7280' }
            ]}>
              {item.label} ({item.count})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Enhanced Task Item with swipe actions
const EnhancedTaskItem = ({ task }) => {
  const { toggleTaskStatus, deleteTask, updateTask } = useContext(TaskContext);
  const translateX = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return '📅 Today';
    return `📅 ${format(date, 'MMM dd')}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return ['#ff6b6b', '#ee5a52'];
      case 'medium': return ['#ffa726', '#ff9800'];
      case 'low': return ['#66bb6a', '#4caf50'];
      default: return ['#78909c', '#607d8b'];
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Work': return 'briefcase';
      case 'Personal': return 'person';
      case 'Health': return 'fitness';
      case 'Learning': return 'school';
      default: return 'checkbox';
    }
  };

  const isOverdue = isPast(new Date(task.dueDate)) && task.status === 'pending';

  return (
    <Animated.View style={[styles.taskItem, { transform: [{ translateX }] }]}>
      <LinearGradient
        colors={task.status === 'completed' ? THEMES.gradient4 : ['#fff', '#f8f9fa']}
        style={styles.taskContent}
      >
        <TouchableOpacity
          style={styles.taskLeft}
          onPress={() => toggleTaskStatus(task.id)}
        >
          <View style={[
            styles.checkbox,
            task.status === 'completed' && styles.checkboxCompleted
          ]}>
            {task.status === 'completed' && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.taskHeader}>
              <Text style={[
                styles.taskTitle,
                task.status === 'completed' && styles.taskTitleCompleted
              ]}>
                {task.title}
              </Text>
              <Ionicons 
                name={getCategoryIcon(task.category)} 
                size={16} 
                color="#666" 
                style={styles.categoryIcon} 
              />
            </View>
            
            {task.description ? (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>
            ) : null}
            
            <View style={styles.taskMeta}>
              <Text style={[styles.taskDate, isOverdue && styles.taskDateOverdue]}>
                {formatDate(task.dueDate)}
                {isOverdue && ' ⚠️'}
              </Text>
              <LinearGradient
                colors={getPriorityColor(task.priority)}
                style={styles.priorityBadge}
              >
                <Text style={styles.priorityText}>{task.priority}</Text>
              </LinearGradient>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteTask(task.id) },
            ]);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

// Task List
const TaskList = ({ refreshing, onRefresh }) => {
  const { tasks } = useContext(TaskContext);

  if (tasks.length === 0) {
    return <EnhancedEmptyState />;
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <EnhancedTaskItem task={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.taskListContent}
    />
  );
};

// Enhanced Empty State
const EnhancedEmptyState = () => {
  const { filter } = useContext(TaskContext);
  
  return (
    <View style={styles.emptyState}>
      <LinearGradient colors={THEMES.gradient6} style={styles.emptyCard}>
        <Ionicons name="checkmark-done-circle" size={80} color="#667eea" />
        <Text style={styles.emptyTitle}>
          {filter === 'all' ? '🎉 All Set!' : `No ${filter} tasks`}
        </Text>
        <Text style={styles.emptySubtitle}>
          {filter === 'all' 
            ? 'Ready to conquer your day? Add your first task!'
            : `Great job! No ${filter} tasks to worry about.`
          }
        </Text>
      </LinearGradient>
    </View>
  );
};

// Enhanced FAB with animation
const EnhancedFAB = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient colors={THEMES.gradient2} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Add Task Modal
const EnhancedAddTaskModal = ({ visible, onClose }) => {
  const { addTask } = useContext(TaskContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');

  const categories = ['Work', 'Personal', 'Health', 'Learning'];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      priority,
      category,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setPriority('medium');
    setCategory('Personal');
    onClose();
    
    Alert.alert('Success! 🎉', 'Task added successfully');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <LinearGradient colors={THEMES.gradient7} style={styles.modalContainer}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>✨ Create New Task</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📝 Title *</Text>
              <TextInput
                style={styles.formInput}
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📋 Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📅 Due Date</Text>
              <TextInput
                style={styles.formInput}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>🎯 Priority</Text>
              <View style={styles.priorityContainer}>
                {['low', 'medium', 'high'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={styles.priorityButtonContainer}
                    onPress={() => setPriority(p)}
                  >
                    <LinearGradient
                      colors={priority === p ? THEMES.gradient2 : ['#f8f9fa', '#e9ecef']}
                      style={styles.priorityButton}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        { color: priority === p ? '#fff' : '#6b7280' }
                      ]}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>📂 Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryButtonContainer}
                    onPress={() => setCategory(cat)}
                  >
                    <LinearGradient
                      colors={category === cat ? THEMES.gradient3 : ['#f8f9fa', '#e9ecef']}
                      style={styles.categoryButton}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        { color: category === cat ? '#fff' : '#6b7280' }
                      ]}>
                        {cat}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

// Stats Modal
const StatsModal = ({ visible, onClose }) => {
  const { allTasks, completedTasksCount, streak } = useContext(TaskContext);
  
  const todayTasks = allTasks.filter(task => isToday(new Date(task.dueDate)));
  const overdueTasks = allTasks.filter(task => 
    isPast(new Date(task.dueDate)) && task.status === 'pending'
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <LinearGradient colors={THEMES.gradient5} style={styles.modalContainer}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>📊 Your Stats</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.statsModalContent}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={THEMES.gradient1} style={styles.statCardGradient}>
                  <Ionicons name="checkmark-circle" size={40} color="#fff" />
                  <Text style={styles.statCardNumber}>{completedTasksCount}</Text>
                  <Text style={styles.statCardLabel}>Completed</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={THEMES.gradient2} style={styles.statCardGradient}>
                  <Ionicons name="flame" size={40} color="#fff" />
                  <Text style={styles.statCardNumber}>{streak}</Text>
                  <Text style={styles.statCardLabel}>Streak</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={THEMES.gradient3} style={styles.statCardGradient}>
                  <Ionicons name="today" size={40} color="#fff" />
                  <Text style={styles.statCardNumber}>{todayTasks.length}</Text>
                  <Text style={styles.statCardLabel}>Today</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={THEMES.gradient4} style={styles.statCardGradient}>
                  <Ionicons name="warning" size={40} color="#fff" />
                  <Text style={styles.statCardNumber}>{overdueTasks.length}</Text>
                  <Text style={styles.statCardLabel}>Overdue</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.achievementSection}>
              <Text style={styles.achievementTitle}>🏆 Achievements</Text>
              <View style={styles.achievements}>
                {completedTasksCount >= 1 && (
                  <View style={styles.achievement}>
                    <Text style={styles.achievementEmoji}>🎯</Text>
                    <Text style={styles.achievementText}>First Task Done!</Text>
                  </View>
                )}
                {completedTasksCount >= 5 && (
                  <View style={styles.achievement}>
                    <Text style={styles.achievementEmoji}>⭐</Text>
                    <Text style={styles.achievementText}>Task Master</Text>
                  </View>
                )}
                {streak >= 3 && (
                  <View style={styles.achievement}>
                    <Text style={styles.achievementEmoji}>🔥</Text>
                    <Text style={styles.achievementText}>On Fire!</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Login Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContent: {
    padding: 40,
    alignItems: 'center',
    maxWidth: 350,
    width: '90%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButtons: {
    width: '100%',
    marginBottom: 30,
  },
  googleButton: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  demoButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 14,
    color: '#c7d2fe',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Home Styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Styles
  header: {
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 15,
    color: '#e0e7ff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    padding: 10,
    marginRight: 10,
  },
  logoutButton: {
    padding: 10,
  },
  themeSelector: {
    marginBottom: 20,
  },
  themeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },

  // Quotes Styles
  quotesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  quoteIcon: {
    marginRight: 15,
  },
  quoteText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Stats Styles
  statsBar: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },

  // Filter Styles
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  filterButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Task List Styles
  taskListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskItem: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#d1d5db',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskDetails: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  categoryIcon: {
    marginLeft: 10,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  taskDateOverdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 15,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#667eea',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    lineHeight: 24,
  },

  // FAB Styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalSave: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 25,
  },

  // Form Styles
  formGroup: {
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  priorityButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButtonContainer: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Stats Modal Styles
  statsModalContent: {
    flex: 1,
    padding: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 25,
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  achievementSection: {
    marginTop: 20,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  achievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  achievementEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  achievementText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default App;