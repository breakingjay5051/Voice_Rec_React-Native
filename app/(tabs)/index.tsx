import React, { useState, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button } from "react-native-elements";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Audio } from "expo-av";

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permissions...");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording...");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started...");
    } catch (err) {
      console.error("Failed to start recording!", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    setRecording(null);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
    });
    const uri = recording?.getURI();
    console.log("Recording stopped and stored at", uri);
  }

  async function playSound() {
    console.log("Loading Sound File...");
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/hello.mp3")
    );
    setSound(sound);
    console.log("Playing Sound...");
    await sound.playAsync();
  }

  async function playSoundStop() {
    if (sound) {
      console.log("Stopping Sound...");
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound...");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#7ed2fc", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/bj_logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedText
        style={{
          textAlign: "center",
          color: "#fd0100",
          fontWeight: "600",
          fontSize: 25,
          marginTop: 20,
          marginBottom: 50,
        }}
      >
        Breakingjay Audio Recorder!!
      </ThemedText>
      <View style={styles.helloWaveContainer}>
        <HelloWave />
      </View>
      <ThemedView style={styles.stepContainer}>
        <Button
          title={sound ? "Stop Playing" : "Start Playing"}
          onPress={sound ? playSoundStop : playSound}
          buttonStyle={[styles.playButton, styles.stopPlayButton]}
        />
        <Button
          title={recording ? "Stop Recording" : "Start Recording"}
          onPress={recording ? stopRecording : startRecording}
          buttonStyle={[styles.startButton, recording && styles.stopButton]}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  stepContainer: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    gap: 100,
  },
  reactLogo: {
    height: 250,
    width: "100%",
    position: "absolute",
  },
  startButton: {
    backgroundColor: "#00c50d",
    padding: 15,
    borderRadius: 20,
  },
  stopButton: {
    backgroundColor: "#fd0100",
    padding: 15,
    borderRadius: 20,
  },
  playButton: {
    backgroundColor: "#00c50d",
    padding: 15,
    borderRadius: 20,
  },
  stopPlayButton: {
    backgroundColor: "#fd0100",
    padding: 15,
    borderRadius: 20,
  },
  helloWaveContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    paddingBottom: 100,
  },
});
