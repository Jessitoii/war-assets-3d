import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface DossierModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isDark: boolean;
}

export const DossierModal: React.FC<DossierModalProps> = ({ visible, onClose, title, content, isDark }) => {
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Typewriter effect logic
  useEffect(() => {
    if (visible && content) {
      setDisplayText('');
      let currentText = '';
      let index = 0;
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setInterval(() => {
        if (index < content.length) {
          currentText += content[index];
          setDisplayText(currentText);
          index++;
        } else {
          clearInterval(timer);
        }
      }, 15); // Tactical speed for briefing

      return () => clearInterval(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, content]);

  // Cursor blink
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(cursorTimer);
  }, []);

  const textColor = isDark ? '#FFF' : '#000';
  const bgColor = isDark ? '#0A0A0A' : '#F5F5F5';
  const accentColor = theme.colors.primary;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="shield-checkmark-sharp" size={20} color={accentColor} />
              <Text style={[styles.title, { color: textColor }]}>TACTICAL DOSSIER: {title.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.divider, { backgroundColor: accentColor }]} />
          
          <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.contentText, { color: textColor }]}>
              {displayText}
              <Text style={{ color: accentColor, opacity: cursorVisible ? 1 : 0 }}>_</Text>
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.statusText, { color: isDark ? '#666' : '#999' }]}>SECURE INTEL CHANNEL ACTIVE</Text>
            </View>
            <TouchableOpacity style={[styles.actionButton, { borderColor: accentColor }]} onPress={onClose}>
              <Text style={[styles.actionButtonText, { color: accentColor }]}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 2,
    width: '100%',
  },
  contentScroll: {
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'monospace', // Using system monospaced font
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  actionButton: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
