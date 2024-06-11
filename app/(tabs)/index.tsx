import React, { useState, useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button } from "react-native-elements";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPositivePhase, setIsPositivePhase] = useState(true);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      if (audioStatus !== "granted") {
        console.error("Permission to access microphone denied!");
      }

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== "granted") {
        console.error("Permission to access media library denied!");
      }

    } catch (err) {
      console.error("Failed to request permissions:", err);
    }
  };

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recordingObject.startAsync();
      setRecording(recordingObject);
      setIsRecording(true);
      console.log("Recording started");

      // Stop recording after 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      console.log("Recording stopped and stored at", uri);

      // Save recording
      const folderName = isPositivePhase
        ? "Positive_audio_data"
        : "Negative_audio_files";
      const fileName = `${currentRecordingIndex}.wav`;
      const directory = `${FileSystem.documentDirectory}${folderName}`;
      const fileUri = `${directory}/${fileName}`;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${folderName}`, { intermediates: true });

      // Move the file to the directory.
      await FileSystem.moveAsync({
        from: uri!,
        to: fileUri,
      });

      // Move the file to Downloads directory.
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync("Downloads");
      if (album == null) {
        await MediaLibrary.createAlbumAsync("Downloads", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log(`Saved recording to ${fileUri}`);
      setRecording(null);
      setIsRecording(false);

      // Increment the recording index
      setCurrentRecordingIndex((prevIndex) => {
        if (prevIndex === 49) {
          setIsPositivePhase(!isPositivePhase);
          return 0;
        }
        return prevIndex + 1;
      });
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const handleButtonPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
  helloWaveContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    paddingBottom: 100,
  },
});
