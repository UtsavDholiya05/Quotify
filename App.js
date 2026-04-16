import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Blogs Component
function BlogsSection() {
  const [blogs, setBlogs] = useState([]);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [isAddingBlog, setIsAddingBlog] = useState(false);

  // Load blogs from async storage
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const stored = await AsyncStorage.getItem('blogs');
      if (stored) {
        setBlogs(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading blogs:', error);
    }
  };

  const addBlog = async () => {
    if (newBlogTitle.trim() && newBlogContent.trim()) {
      const newBlog = {
        id: Date.now(),
        title: newBlogTitle,
        content: newBlogContent,
        date: new Date().toLocaleDateString(),
      };

      const updatedBlogs = [newBlog, ...blogs];
      setBlogs(updatedBlogs);

      try {
        await AsyncStorage.setItem('blogs', JSON.stringify(updatedBlogs));
        setNewBlogTitle('');
        setNewBlogContent('');
        setIsAddingBlog(false);
      } catch (error) {
        console.log('Error saving blog:', error);
      }
    }
  };

  const deleteBlog = async (id) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== id);
    setBlogs(updatedBlogs);
    try {
      await AsyncStorage.setItem('blogs', JSON.stringify(updatedBlogs));
    } catch (error) {
      console.log('Error deleting blog:', error);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📝 My Blogs</Text>

      {!isAddingBlog ? (
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddingBlog(true)}>
          <Text style={styles.addButtonText}>+ Add New Blog</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Blog Title"
            value={newBlogTitle}
            onChangeText={setNewBlogTitle}
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Blog Content"
            value={newBlogContent}
            onChangeText={setNewBlogContent}
            multiline
            placeholderTextColor="#999"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.submitButton} onPress={addBlog}>
              <Text style={styles.submitButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAddingBlog(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        scrollEnabled={false}
        data={blogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.blogCard}>
            <Text style={styles.blogTitle}>{item.title}</Text>
            <Text style={styles.blogDate}>{item.date}</Text>
            <Text style={styles.blogContent}>{item.content}</Text>
            <TouchableOpacity onPress={() => deleteBlog(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// Quotes Component
function QuotesSection() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://68ce624a6dc3f350777ed8ae.mockapi.io/quotes');
      const data = await response.json();
      setQuotes(Array.isArray(data) ? data : []);
      setCurrentQuoteIndex(0);
    } catch (error) {
      console.log('Error fetching quotes:', error);
      setQuotes([{ quote: 'Failed to load quotes', author: 'Error' }]);
    } finally {
      setLoading(false);
    }
  };

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuoteIndex((prev) => (prev === 0 ? quotes.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Inspiring Quotes</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>✨ Inspiring Quotes</Text>

      {currentQuote && (
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{currentQuote.quote}"</Text>
          <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
        </View>
      )}

      <View style={styles.quoteButtonRow}>
        <TouchableOpacity style={styles.navigationButton} onPress={prevQuote}>
          <Text style={styles.navigationButtonText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={styles.quoteCounter}>
          {currentQuoteIndex + 1} / {quotes.length}
        </Text>
        <TouchableOpacity style={styles.navigationButton} onPress={nextQuote}>
          <Text style={styles.navigationButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchQuotes}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Quotes</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Quotify</Text>
          <Text style={styles.subtitle}>Blogs & Quotes</Text>
        </View>

        <BlogsSection />
        <QuotesSection />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  formContainer: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#34C759',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  blogCard: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  blogDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  blogContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 12,
  },
  quoteCard: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'right',
  },
  quoteButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navigationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navigationButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  quoteCounter: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
