import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = '@user_todos';

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const saveTodos = async (todosToSave: Todo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const addTodo = () => {
    if (!inputText.trim()) {
      Alert.alert('Empty Todo', 'Please enter a todo item.');
      return;
    }
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
    };
    setTodos([newTodo, ...todos]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity
      style={[styles.todoItem, item.completed && styles.completedTodo]}
      onPress={() => toggleTodo(item.id)}
      onLongPress={() =>
        Alert.alert('Delete Todo', `Delete "${item.text}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(item.id) },
        ])
      }
    >
      <Text style={[styles.todoText, item.completed && styles.completedText]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No todos yet. Add some!</Text>
        }
        contentContainerStyle={todos.length === 0 && styles.emptyContainer}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  todoItem: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  completedTodo: {
    backgroundColor: '#d4edda',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
  },
});
