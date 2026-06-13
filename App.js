import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { VideoView, useVideoPlayer } from 'expo-video';

import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

const REVENUECAT_API_KEY = 'test_mwxsgFuIoCDhQuTtRWbzSkftpeg';

const LOCKOUT_HOURS = 48;
const LOCKOUT_MS = LOCKOUT_HOURS * 60 * 60 * 1000;

const SUPPORT_EMAIL = 'support@musclemender.com';
const PRIVACY_URL = 'https://musclemender.com/privacy-policy';
const TERMS_URL = 'https://musclemender.com/terms-and-conditions';

const COLORS = {
  blue: '#1E73BE',
  darkBlue: '#0F3D73',
  green: '#9ACD32',
  black: '#111827',
  gray: '#4B5563',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  red: '#B91C1C',
  redLight: '#FEE2E2',
  white: '#FFFFFF',
};

const TOOLS = [
  {
    id: 'arm',
    name: 'Arm',
    areas: ['Shoulder', 'Bicep', 'Tricep', 'Elbow', 'Wrist'],
  },
  {
    id: 'torso',
    name: 'Torso',
    areas: ['Neck / Upper Trap', 'Shoulder Blade', 'Low Back', 'Ribs / Serratus'],
  },
  {
    id: 'leg-foot',
    name: 'Leg & Foot',
    areas: ['Hip', 'Quad', 'Hamstring', 'Calf', 'Shin', 'Foot / Plantar Fascia'],
  },
];

const AREA_GROUPS = [
  {
    id: 'upper',
    title: 'Arm, Shoulder & Hand',
    areas: ['Shoulder', 'Bicep', 'Tricep', 'Elbow', 'Wrist'],
  },
  {
    id: 'trunk',
    title: 'Neck, Back & Torso',
    areas: ['Neck / Upper Trap', 'Shoulder Blade', 'Low Back', 'Ribs / Serratus'],
  },
  {
    id: 'lower',
    title: 'Hip, Leg & Foot',
    areas: ['Hip', 'Quad', 'Hamstring', 'Calf', 'Shin', 'Foot / Plantar Fascia'],
  },
];

const PROBLEM_TYPES = [
  {
    id: 'point',
    emoji: '☝️',
    title: 'Point',
    description: 'Would you point with one finger at your problem spot?',
  },
  {
    id: 'press',
    emoji: '✋',
    title: 'Press',
    description: 'Would you press your palm on your problem spot?',
  },
  {
    id: 'paint',
    emoji: '👋',
    title: 'Paint',
    description: 'Would you swipe your hand over the problem area?',
  },
];

const TARGETS = {
  Shoulder: {
    title: 'Shoulder Direct Release',
    primary: 'Deltoid',
    secondary: 'Supraspinatus',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-deltoid.mp4',
    illustrationAsset: require('./assets/muscles/deltoid.png'),
  },
  Bicep: {
    title: 'Bicep Release',
    primary: 'Biceps Brachii',
    secondary: 'Brachialis',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-bicep.mp4',
    illustrationAsset: require('./assets/muscles/bicep.png'),
  },
  Tricep: {
    title: 'Tricep Release',
    primary: 'Triceps Brachii',
    secondary: 'Posterior Arm',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-triceps.mp4',
    illustrationAsset: require('./assets/muscles/tricep.png'),
  },
  Elbow: {
    title: 'Elbow Relief',
    primary: 'Forearm Flexors / Extensors',
    secondary: 'Common Tendon Area',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-forearms.mp4',
    illustrationAsset: require('./assets/muscles/forearm-flexors.png'),
  },
  Wrist: {
    title: 'Wrist / Carpal Tunnel Support',
    primary: 'Forearm Flexors',
    secondary: 'Wrist Flexor Group',
    videoUrl: null,
    illustrationAsset: require('./assets/muscles/wrist-thumb.png'),
  },
  'Neck / Upper Trap': {
    title: 'Neck / Upper Trap Release',
    primary: 'Upper Trapezius',
    secondary: 'Levator Scapulae',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-traps.mp4',
    illustrationAsset: require('./assets/muscles/Traps.png'),
  },
  'Shoulder Blade': {
    title: 'Shoulder Blade Release',
    primary: 'Rhomboids',
    secondary: 'Mid Trapezius',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-back-shoulder-blades.mp4',
    illustrationAsset: require('./assets/muscles/rhomboid.png'),
  },
  'Low Back': {
    title: 'Low Back Release',
    primary: 'Erector Spinae',
    secondary: 'Quadratus Lumborum',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-low-back.mp4',
    illustrationAsset: require('./assets/muscles/erector-spinae.png'),
  },
  'Ribs / Serratus': {
    title: 'Ribs / Serratus Release',
    primary: 'Serratus Anterior',
    secondary: 'Intercostal Area',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-serratus-anterior.mp4',
    illustrationAsset: require('./assets/muscles/lat.png'),
  },
  Hip: {
    title: 'Hip Release',
    primary: 'Glute / Hip Area',
    secondary: 'TFL',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-hips-and-glutes.mp4',
    illustrationAsset: require('./assets/muscles/glue-min-medius-TFL.png'),
  },
  Quad: {
    title: 'Quad Release',
    primary: 'Quadriceps',
    secondary: 'Rectus Femoris',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-quad.mp4',
    illustrationAsset: require('./assets/muscles/quad.png'),
  },
  Hamstring: {
    title: 'Hamstring Release',
    primary: 'Hamstrings',
    secondary: 'Posterior Thigh',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-hamstring.mp4',
    illustrationAsset: require('./assets/muscles/hamstring.png'),
  },
  Calf: {
    title: 'Calf Release',
    primary: 'Gastrocnemius',
    secondary: 'Soleus',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-calf.mp4',
    illustrationAsset: require('./assets/muscles/gastrocnemeus-soleus.png'),
  },
  Shin: {
    title: 'Shin Release',
    primary: 'Tibialis Anterior',
    secondary: 'Anterior Lower Leg',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-anterior-tibialis.mp4',
    illustrationAsset: require('./assets/muscles/anterior-tibialis.png'),
  },
  'Foot / Plantar Fascia': {
    title: 'Foot / Plantar Fascia Release',
    primary: 'Plantar Fascia',
    secondary: 'Foot Arch',
    videoUrl: 'https://pub-1c1e05b9d39b4aca945dff4b80fb6138.r2.dev/mm-plantar-fasciitis.mp4',
    illustrationAsset: require('./assets/muscles/plantar-fasciitis.png'),
  },
};

const PROTOCOL_RULES = {
  Shoulder: {
    point: { targetArea: 'Shoulder', toolName: 'Arm' },
    press: { targetArea: 'Shoulder Blade', toolName: 'Torso' },
    paint: { targetArea: 'Shoulder Blade', toolName: 'Torso' },
  },
  Bicep: {
    point: { targetArea: 'Bicep' },
    press: { targetArea: 'Tricep' },
    paint: { targetArea: 'Shoulder' },
  },
  Tricep: {
    point: { targetArea: 'Tricep' },
    press: { targetArea: 'Bicep' },
    paint: { targetArea: 'Shoulder' },
  },
  Elbow: {
    point: { targetArea: 'Elbow' },
    press: { targetArea: 'Elbow' },
    paint: { targetArea: 'Bicep' },
  },
  Wrist: {
    point: { targetArea: 'Wrist' },
    press: { targetArea: 'Elbow' },
    paint: { targetArea: 'Elbow' },
  },
  'Neck / Upper Trap': {
    point: { targetArea: 'Neck / Upper Trap' },
    press: { targetArea: 'Shoulder Blade' },
    paint: { targetArea: 'Neck / Upper Trap' },
  },
  'Shoulder Blade': {
    point: { targetArea: 'Shoulder Blade' },
    press: { targetArea: 'Ribs / Serratus' },
    paint: { targetArea: 'Neck / Upper Trap' },
  },
  'Low Back': {
    point: { targetArea: 'Low Back' },
    press: { targetArea: 'Hip' },
    paint: { targetArea: 'Low Back' },
  },
  'Ribs / Serratus': {
    point: { targetArea: 'Ribs / Serratus' },
    press: { targetArea: 'Shoulder Blade' },
    paint: { targetArea: 'Shoulder Blade' },
  },
  Hip: {
    point: { targetArea: 'Hip' },
    press: { targetArea: 'Quad' },
    paint: { targetArea: 'Low Back' },
  },
  Quad: {
    point: { targetArea: 'Quad' },
    press: { targetArea: 'Hamstring' },
    paint: { targetArea: 'Hip' },
  },
  Hamstring: {
    point: { targetArea: 'Hamstring' },
    press: { targetArea: 'Quad' },
    paint: { targetArea: 'Hip' },
  },
  Calf: {
    point: { targetArea: 'Calf' },
    press: { targetArea: 'Shin' },
    paint: { targetArea: 'Hamstring' },
  },
  Shin: {
    point: { targetArea: 'Shin' },
    press: { targetArea: 'Calf' },
    paint: { targetArea: 'Quad' },
  },
  'Foot / Plantar Fascia': {
    point: { targetArea: 'Foot / Plantar Fascia' },
    press: { targetArea: 'Calf' },
    paint: { targetArea: 'Calf' },
  },
};

const getDefaultToolNameForArea = area => {
  const tool = TOOLS.find(item => item.areas.includes(area));
  return tool?.name || 'Muscle Mender';
};

const getProblemRuleText = problemId => {
  if (problemId === 'point') {
    return 'Point means the spot you selected is the spot that needs work.';
  }

  if (problemId === 'press') {
    return 'Press means the opposing muscle group is the area to work.';
  }

  if (problemId === 'paint') {
    return 'Paint means the likely trigger point is just above the area you swept over.';
  }

  return '';
};

const getProtocolChoice = (area, problemId) => {
  if (!area || !problemId) {
    return null;
  }

  const rule = PROTOCOL_RULES[area]?.[problemId] || { targetArea: area };
  const targetArea = rule.targetArea;
  const toolName = rule.toolName || getDefaultToolNameForArea(targetArea);
  const ruleText = getProblemRuleText(problemId);
  const targetText =
    targetArea === area
      ? `${targetArea} stays as the working protocol.`
      : `${area} routes to the ${targetArea} protocol.`;

  return {
    toolName,
    targetArea,
    note: `${ruleText} ${targetText}`,
  };
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSafety, setShowSafety] = useState(true);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [isPlusMember, setIsPlusMember] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.android?.versionCode ||
    '3';

  const currentProtocol = useMemo(
    () => getProtocolChoice(selectedArea, selectedProblem?.id),
    [selectedArea, selectedProblem]
  );
  const currentTarget = useMemo(() => {
    if (!currentProtocol?.targetArea) return null;
    return TARGETS[currentProtocol.targetArea] || null;
  }, [currentProtocol]);
  const currentVideoUrl = currentTarget?.videoUrl || null;
  const videoPlayer = useVideoPlayer(null, player => {
    player.loop = false;
  });

  useEffect(() => {
    configureRevenueCat();
  }, []);

  useEffect(() => {
    if (currentProtocol?.targetArea && isPlusMember) {
      loadLockout(currentProtocol.targetArea);
    } else {
      setLockoutEnd(null);
    }
  }, [currentProtocol, isPlusMember]);

  useEffect(() => {
    const source = isPlusMember && currentVideoUrl ? currentVideoUrl : null;

    videoPlayer.pause();
    videoPlayer.replaceAsync(source).catch(error => {
      console.log('Video load error:', error);
    });
  }, [currentVideoUrl, isPlusMember, videoPlayer]);

  const configureRevenueCat = async () => {
    try {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });

      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo?.entitlements?.active || {};

      if (activeEntitlements.plus) {
        setIsPlusMember(true);
      }
    } catch (error) {
      console.log('RevenueCat configure error:', error);
    }
  };

  const refreshMembershipStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlements = customerInfo?.entitlements?.active || {};

      setIsPlusMember(Boolean(activeEntitlements.plus));
    } catch (error) {
      console.log('RevenueCat refresh error:', error);
    }
  };

  const openPaywall = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Membership Testing',
        'RevenueCat subscriptions cannot be tested in Safari or web preview. Use an iOS development build or TestFlight build.'
      );
      return;
    }

    try {
      await RevenueCatUI.presentPaywall();
      await refreshMembershipStatus();
    } catch (error) {
      console.log('RevenueCat paywall error:', error);
      Alert.alert(
        'Membership Not Available',
        'Membership is not available yet. Please try again later.'
      );
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const activeEntitlements = customerInfo?.entitlements?.active || {};

      if (activeEntitlements.plus) {
        setIsPlusMember(true);
        Alert.alert('Purchases Restored', 'Your Muscle Mender Plus membership is active.');
      } else {
        Alert.alert('No Membership Found', 'No active Muscle Mender Plus membership was found.');
      }
    } catch (error) {
      console.log('Restore purchase error:', error);
      Alert.alert('Restore Failed', 'We could not restore purchases right now.');
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } catch (error) {
      console.log('Notification permission error:', error);
    }
  };

  const getLockoutKey = area => `muscle_mender_lockout_${area}`;

  const loadLockout = async area => {
    try {
      const saved = await AsyncStorage.getItem(getLockoutKey(area));
      if (!saved) {
        setLockoutEnd(null);
        return;
      }

      const endTime = Number(saved);

      if (Date.now() >= endTime) {
        await AsyncStorage.removeItem(getLockoutKey(area));
        setLockoutEnd(null);
      } else {
        setLockoutEnd(endTime);
      }
    } catch (error) {
      console.log('Load lockout error:', error);
    }
  };

  const completeSession = async () => {
    const lockoutArea = currentProtocol?.targetArea;
    if (!lockoutArea) return;

    if (!isPlusMember) {
      await openPaywall();
      return;
    }

    try {
      const endTime = Date.now() + LOCKOUT_MS;

      await AsyncStorage.setItem(getLockoutKey(lockoutArea), String(endTime));
      setLockoutEnd(endTime);

      await requestNotificationPermissions();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Muscle Mender Recovery Window Complete',
          body: `${lockoutArea} is ready for another session if needed.`,
        },
        trigger: {
          seconds: LOCKOUT_HOURS * 60 * 60,
        },
      });

      Alert.alert(
        'Session Completed',
        `Do not use Muscle Mender on the same ${lockoutArea} area again for 48 hours.`
      );
    } catch (error) {
      console.log('Complete session error:', error);
      Alert.alert('Error', 'Could not save the recovery timer.');
    }
  };

  const getRemainingLockoutText = () => {
    if (!lockoutEnd) return null;

    const remainingMs = lockoutEnd - Date.now();
    if (remainingMs <= 0) return null;

    const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
    return `Locked for recovery: ${remainingHours} hours remaining`;
  };

  const openUrl = async url => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Unable to Open Link', 'Please try again later.');
    }
  };

  const openPlusVideo = () => {
    if (!isPlusMember) {
      openPaywall();
      return;
    }

    if (!currentVideoUrl) {
      Alert.alert('Video Coming Soon', 'This Muscle Mender video will be added soon.');
    }
  };

  const contactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Muscle Mender App Support`);
  };

  const requestAccountDeletion = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=Delete Muscle Mender App Account&body=Please delete my Muscle Mender app account and related data.`
    );
  };

  const goHome = () => {
    setScreen('home');
    setSelectedArea(null);
    setSelectedProblem(null);
    setLockoutEnd(null);
  };

  const chooseArea = area => {
    setSelectedArea(area);
    setScreen('problem');
  };

  const chooseProblem = problem => {
    setSelectedProblem(problem);
    setScreen('recommendation');
  };

  const continueToProtocol = () => {
    setScreen('protocol');
  };

  if (showSafety) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.screenContainer}>
          <Text style={styles.safetyTitle}>Before You Use Muscle Mender</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Muscle Mender uses pressure and compression. Use only as directed and stop
              immediately if you feel sharp pain, numbness, tingling, dizziness, skin irritation,
              unusual swelling, or worsening symptoms.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>48-Hour Use Rule</Text>
          <Text style={styles.bodyText}>
            Do not use Muscle Mender on the same muscle area more than once every 48 hours. Your
            body needs time between sessions to recover and respond.
          </Text>

          <Text style={styles.sectionTitle}>Not Medical Advice</Text>
          <Text style={styles.bodyText}>
            This app and Muscle Mender are for general wellness, mobility, and muscle recovery
            support only. This information is not medical advice, diagnosis, or treatment. Consult a
            qualified healthcare professional if you have an injury, medical condition, circulation
            problem, nerve issue, recent surgery, blood clot risk, or are unsure whether compression
            is safe for you.
          </Text>

          <TouchableOpacity style={styles.darkButton} onPress={() => setShowSafety(false)}>
            <Text style={styles.darkButtonText}>I Understand</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.screenContainer}>
        {screen === 'home' && (
          <>
            <Logo />

            <Text style={styles.blueTitle}>Recovery Coach</Text>
            <Text style={styles.question}>Where do you need help today?</Text>

            {AREA_GROUPS.map(group => (
              <View key={group.id} style={styles.areaGroup}>
                <Text style={styles.areaGroupTitle}>{group.title}</Text>

                {group.areas.map(area => (
                  <TouchableOpacity
                    key={area}
                    style={styles.primaryButton}
                    onPress={() => chooseArea(area)}
                  >
                    <Text style={styles.primaryButtonText}>{area}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.membershipCard}>
              <Text style={styles.cardTitle}>Muscle Mender Plus</Text>

              <Text style={styles.bodyText}>
                {isPlusMember
                  ? 'Your Plus membership is active.'
                  : 'Unlock full guided protocols, advanced recovery tracking, and future premium routines.'}
              </Text>

              {!isPlusMember && (
                <TouchableOpacity style={styles.greenButton} onPress={openPaywall}>
                  <Text style={styles.greenButtonText}>Upgrade to Muscle Mender Plus</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={restorePurchases}>
                <Text style={styles.linkText}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>

            <LegalCard
              appVersion={appVersion}
              buildNumber={buildNumber}
              openUrl={openUrl}
              contactSupport={contactSupport}
              requestAccountDeletion={requestAccountDeletion}
            />
          </>
        )}

        {screen === 'problem' && selectedArea && (
          <>
            <Logo />

            <Text style={styles.blueTitle}>{selectedArea} Relief</Text>
            <Text style={styles.question}>How would you describe the problem?</Text>

            {PROBLEM_TYPES.map(problem => (
              <TouchableOpacity
                key={problem.id}
                style={styles.problemButton}
                onPress={() => chooseProblem(problem)}
              >
                <Text style={styles.problemTitle}>
                  {problem.emoji} {problem.title}
                </Text>
                <Text style={styles.problemDescription}>{problem.description}</Text>
              </TouchableOpacity>
            ))}

            <BackButton onPress={goHome} />
          </>
        )}

        {screen === 'recommendation' && selectedArea && selectedProblem && currentProtocol && (
          <>
            <Logo />

            <Text style={styles.blueTitle}>Recommended Wrap</Text>
            <Text style={styles.question}>{currentProtocol.toolName} Muscle Mender</Text>

            <View style={styles.recommendationCard}>
              <Text style={styles.targetLabel}>BASED ON</Text>
              <Text style={styles.cardTitle}>
                {selectedArea} + {selectedProblem.title}
              </Text>

              <Text style={styles.bodyText}>{currentProtocol.note}</Text>

              {currentTarget && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.targetLabel}>PROTOCOL PREVIEW</Text>
                  <Text style={styles.bodyText}>
                    Working protocol: {currentProtocol.targetArea}
                    {'\n'}
                    Primary: {currentTarget.primary}
                    {'\n'}
                    Secondary: {currentTarget.secondary}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.greenButton} onPress={continueToProtocol}>
              <Text style={styles.greenButtonText}>Continue</Text>
            </TouchableOpacity>

            <BackButton onPress={() => setScreen('problem')} />
          </>
        )}

        {screen === 'protocol' && currentTarget && (
          <>
            <Text style={styles.protocolTitle}>{currentTarget.title}</Text>

            {currentProtocol && (
              <>
                <Text style={styles.targetLabel}>RECOMMENDED WRAP</Text>
                <Text style={styles.recommendedToolName}>
                  {currentProtocol.toolName} Muscle Mender
                </Text>
              </>
            )}

            <Text style={styles.targetLabel}>PRIMARY TARGET</Text>
            <Text style={styles.targetName}>
              {isPlusMember ? currentTarget.primary : 'Unlock with Muscle Mender Plus'}
            </Text>

            <View style={styles.illustrationCard}>
              {currentTarget.illustrationAsset ? (
                <Image
                  source={currentTarget.illustrationAsset}
                  style={styles.muscleIllustration}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.illustrationEmoji}>💪</Text>
              )}
              <Text style={styles.illustrationText}>
                {isPlusMember
                  ? `${currentProtocol?.targetArea || selectedArea} muscle target reference`
                  : 'Plus members get the muscle target reference, guided video, recovery timer, and reminders.'}
              </Text>

              {isPlusMember && getRemainingLockoutText() && (
                <Text style={styles.lockoutText}>{getRemainingLockoutText()}</Text>
              )}

              <View style={styles.divider} />

              <Text style={styles.bodyText}>
                Use the target area as a general reference. The video below shows the general strap,
                pump, and movement method.
              </Text>
            </View>

            <Text style={styles.targetLabel}>SECONDARY TARGET</Text>
            <Text style={styles.targetName}>{currentTarget.secondary}</Text>

            {isPlusMember && currentVideoUrl ? (
              <VideoView
                style={styles.videoPlayer}
                player={videoPlayer}
                nativeControls
                contentFit="contain"
                allowsFullscreen
                playsInline
              />
            ) : (
              <TouchableOpacity
                style={isPlusMember ? styles.disabledButton : styles.outlineButton}
                onPress={openPlusVideo}
                disabled={isPlusMember && !currentVideoUrl}
              >
                <Text style={isPlusMember ? styles.disabledButtonText : styles.outlineButtonText}>
                  {isPlusMember ? 'Video Coming Soon' : 'Unlock Plus to Watch Video'}
                </Text>
              </TouchableOpacity>
            )}

            {isPlusMember ? (
              <Text style={styles.lockoutNotice}>⏰ 48-Hour Lockout Applies After Completion</Text>
            ) : (
              <Text style={styles.lockoutNotice}>
                Plus includes the 48-hour recovery timer and reminder notifications.
              </Text>
            )}

            {isPlusMember && lockoutEnd && Date.now() < lockoutEnd ? (
              <TouchableOpacity style={styles.disabledButton} disabled>
                <Text style={styles.disabledButtonText}>Locked for Recovery</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={isPlusMember ? styles.greenButton : styles.outlineButton}
                onPress={completeSession}
              >
                <Text style={isPlusMember ? styles.greenButtonText : styles.outlineButtonText}>
                  {isPlusMember ? 'Complete Session' : 'Unlock Plus to Track Recovery'}
                </Text>
              </TouchableOpacity>
            )}

            <BackButton onPress={() => setScreen('recommendation')} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Logo() {
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoMark}>⌃⌃⌃</Text>
      <Text style={styles.logoText}>
        <Text style={styles.logoGreen}>MUSCLE</Text>
        {'\n'}
        <Text style={styles.logoBlue}>MENDER</Text>
      </Text>
    </View>
  );
}

function BackButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
  );
}

function LegalCard({
  appVersion,
  buildNumber,
  openUrl,
  contactSupport,
  requestAccountDeletion,
}) {
  return (
    <View style={styles.legalCard}>
      <Text style={styles.cardTitle}>Important Information</Text>

      <Text style={styles.bodyText}>
        Muscle Mender is intended for general wellness and muscle recovery support. It is not
        intended to diagnose, treat, cure, or prevent any disease or medical condition.
      </Text>

      <Text style={styles.bodyText}>
        Do not treat the same muscle area more than once every 48 hours.
      </Text>

      <TouchableOpacity onPress={() => openUrl(PRIVACY_URL)}>
        <Text style={styles.linkText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => openUrl(TERMS_URL)}>
        <Text style={styles.linkText}>Terms & Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={contactSupport}>
        <Text style={styles.linkText}>Contact Support</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={requestAccountDeletion}>
        <Text style={styles.linkText}>Delete Account / Data Request</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>
        Version {appVersion} • Build {buildNumber}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  screenContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoMark: {
    color: COLORS.blue,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 4,
  },
  logoText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 26,
  },
  logoGreen: {
    color: COLORS.green,
  },
  logoBlue: {
    color: COLORS.blue,
  },
  blueTitle: {
    color: COLORS.blue,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  question: {
    color: COLORS.black,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 34,
  },
  primaryButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  areaGroup: {
    marginBottom: 14,
  },
  areaGroupTitle: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  greenButton: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  greenButtonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  darkButton: {
    backgroundColor: COLORS.black,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 28,
    alignItems: 'center',
  },
  darkButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  disabledButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '800',
  },
  problemButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  problemTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  problemDescription: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 22,
  },
  backText: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  legalCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 18,
  },
  membershipCard: {
    backgroundColor: '#EEF6FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  recommendationCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  bodyText: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  linkText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  versionText: {
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 14,
  },
  safetyTitle: {
    color: COLORS.black,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 16,
    marginBottom: 22,
  },
  warningBox: {
    backgroundColor: COLORS.redLight,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  warningText: {
    color: COLORS.red,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
  },
  sectionTitle: {
    color: COLORS.black,
    fontSize: 25,
    fontWeight: '900',
    marginTop: 12,
    marginBottom: 8,
  },
  protocolTitle: {
    color: COLORS.black,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 20,
  },
  targetLabel: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  targetName: {
    color: COLORS.blue,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 12,
  },
  recommendedToolName: {
    color: COLORS.black,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 18,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.black,
    borderRadius: 16,
    marginBottom: 16,
  },
  illustrationCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 18,
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  muscleIllustration: {
    width: '100%',
    height: 220,
    marginBottom: 8,
  },
  illustrationText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  lockoutText: {
    color: COLORS.red,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: 12,
  },
  lockoutNotice: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
});
