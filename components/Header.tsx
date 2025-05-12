import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Typography from '@/constants/typography';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  showNotification = false,
  rightComponent,
  onBackPress,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.background} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.rightContainer}>
          {showNotification && (
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color={Colors.background} />
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    ...Typography.h3,
    color: Colors.background,
  },
  iconButton: {
    marginLeft: 16,
  },
});

export default Header;