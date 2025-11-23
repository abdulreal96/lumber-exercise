import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseVideoProps {
  videoId?: string;
  height?: number;
  borderRadius?: number;
}

function ExerciseVideoComponent({
  videoId,
  height = 220,
  borderRadius = 16,
}: ExerciseVideoProps) {
  const [isReady, setIsReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    setIsReady(false);
    setPlayerError(null);
  }, [videoId]);

  const handleOpenExternal = useCallback(async () => {
    if (!videoId) return;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn('Failed to open YouTube link', error);
    }
  }, [videoId]);

  if (!videoId) {
    return null;
  }

  return (
    <View style={[styles.container, { borderRadius, height }]}> 
      <YoutubePlayer
        key={videoId}
        height={height}
        videoId={videoId}
        play={false}
        initialPlayerParams={{
          controls: true,
          rel: false,
        }}
        webViewProps={{
          androidLayerType: 'hardware',
          allowsFullscreenVideo: true,
        }}
        onReady={() => setIsReady(true)}
        onError={error => {
          console.warn('YouTube player error', error);
          setPlayerError(typeof error === 'string' ? error : JSON.stringify(error));
        }}
      />

      {!isReady && !playerError && (
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loaderText}>Loading video...</Text>
        </View>
      )}

      {playerError && (
        <View style={styles.overlay}>
          <Ionicons name="alert-circle" size={28} color="#fff" />
          <Text style={styles.overlayTitle}>Video unavailable</Text>
          <Text style={styles.overlayText}>Tap below to open in YouTube.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.externalButton} onPress={handleOpenExternal}>
        <Ionicons name="logo-youtube" size={18} color="#FF0000" />
        <Text style={styles.externalText}>Watch on YouTube</Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ExerciseVideoComponent);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 13,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  overlayTitle: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 16,
  },
  overlayText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  externalButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  externalText: {
    color: '#FF0000',
    fontWeight: '600',
  },
});
