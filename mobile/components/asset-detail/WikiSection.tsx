import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface WikiSectionProps {
  wikiUrl?: string;
  isDark: boolean;
}

export const WikiSection: React.FC<WikiSectionProps> = ({ wikiUrl, isDark }) => {
  const { i18n, t } = useTranslation();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!wikiUrl) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(false);
      try {
        // Extract title from URL
        // Handle URLs like https://en.wikipedia.org/wiki/Merkava
        const parts = wikiUrl.split('/wiki/');
        if (parts.length < 2) throw new Error('Invalid Wiki URL');
        
        let title = parts[1];
        // Remove anchor if exists
        title = title.split('#')[0];
        
        // Determine language code (tr, ru, ar, zh etc)
        const langCode = i18n.language.split('-')[0];
        
        // Wikipedia Summary API
        // https://en.wikipedia.org/api/rest_v1/page/summary/Merkava
        const apiUrl = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${title}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
           // If direct fetch fails, try extracting from URL if it's different language
           // For example wikiUrl might be tr.wikipedia but app is in en
           throw new Error('Summary not found for this language');
        }
        
        const data = await response.json();
        
        if (data.extract) {
          setSummary(data.extract);
        } else {
          setError(true);
        }
      } catch (e) {
        console.warn('Wiki Fetch Attempt failed:', e);
        
        // Fallback: If current language fails, try English if not already tried
        try {
            const parts = wikiUrl.split('/wiki/');
            const title = parts[1].split('#')[0];
            const langCode = i18n.language.split('-')[0];
            
            if (langCode !== 'en') {
                const enApiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
                const enRes = await fetch(enApiUrl);
                if (enRes.ok) {
                    const enData = await enRes.json();
                    if (enData.extract) {
                        setSummary(enData.extract);
                        return;
                    }
                }
            }
            setError(true);
        } catch (fallbackError) {
            setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [wikiUrl, i18n.language]);

  const handleReadMore = async () => {
    if (wikiUrl) {
      await WebBrowser.openBrowserAsync(wikiUrl);
    }
  };

  if (!wikiUrl && !summary) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        {t('common.history_background', 'History & Background')}
      </Text>
      
      {loading ? (
        <View style={styles.skeletonContainer}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: isDark ? '#999' : '#666' }]}>
            {t('common.fetching_wiki', 'Consulting Intelligence Archives...')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
           <Text style={[styles.errorText, { color: isDark ? '#999' : '#666' }]}>
             {t('common.wiki_error', 'No technical intelligence available for this asset signature.')}
           </Text>
           {wikiUrl && (
             <TouchableOpacity style={styles.errorLink} onPress={handleReadMore}>
               <Text style={[styles.errorLinkText, { color: theme.colors.primary }]}>
                 {t('common.view_on_wiki_fallback', 'View raw Wikipedia page')}
               </Text>
             </TouchableOpacity>
           )}
        </View>
      ) : (
        <>
          <Text style={[styles.summaryText, { color: isDark ? '#CCC' : '#444' }]} numberOfLines={12}>
            {summary}
          </Text>
          
          <TouchableOpacity 
            style={[styles.readMoreButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
            onPress={handleReadMore}
          >
            <Ionicons name="book-outline" size={18} color={isDark ? '#EEE' : '#333'} style={{ marginRight: 8 }} />
            <Text style={[styles.readMoreText, { color: isDark ? '#EEE' : '#333' }]}>
              {t('common.read_full_wiki', 'Read Full Intel on Wikipedia')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skeletonContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorLink: {
    marginTop: 8,
    alignItems: 'center',
  },
  errorLinkText: {
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
