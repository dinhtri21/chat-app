import React, {
  useCallback,
  useMemo,
  useRef,
  useContext,
  useState,
  useEffect,
} from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { UserType } from '../UserContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { EvilIcons } from '@expo/vector-icons';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

const Setting = ({ userData, setuserData, onModal, setOnMadal }) => {
  console.log(userData);
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '39%'], []);
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 5000,
    easing: Easing.ease,
  });

  useEffect(() => {
    if (onModal) {
      bottomSheetModalRef.current?.present();
    }
  }, [onModal]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      console.log('Token đã được xóa thành công');
      closeModal();
      await setuserData({});
      navigation.replace('Login');
    } catch (error) {
      console.log('Lỗi khi xóa token:', error);
    }
  };

  const alertLogOut = () => {
    Alert.alert(
      'Đăng xuất',
      `Bạn có muốn đăng xuất tài khoản ${userData?.name} không ?`,
      [
        {
          text: 'Không',
        },
        {
          text: 'Có',
          onPress: () => handleLogout(),
        },
      ],
      { cancelable: false }
    );
  };

  const closeModal = async () => {
    try {
      await bottomSheetModalRef.current.close();
      setOnMadal(false);
    } catch (err) {
      console.log('Lỗi closeModal' + err);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      style={styles.container}
      onDismiss={closeModal}
      animationConfig={animationConfigs}
      backdropComponent={({ style }) => (
        <View style={[style, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]} />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Cài Đặt</Text>
        <View style={styles.viewLine}>
          <Text></Text>
        </View>
        <Image
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            backgroundColor: '#ccc',
          }}
          source={
            userData &&
            userData.image &&
            `${process.env.EXPRESS_API_URL}`.indexOf(userData.image)
              ? { uri: userData.image }
              : require('../assets/default-profile-picture-avatar.jpg')
          }
        />
        <View style={styles.bottomSheetViewItem}>
          <AntDesign
            style={{ marginRight: 8 }}
            name="user"
            size={24}
            color="#4f93fe"
          />

          <Text style={styles.titleBottomSheetViewItem}>Họ & Tên:</Text>
          <Text style={styles.contentBottomSheetViewItem}>{userData.name}</Text>
        </View>
        <View style={styles.bottomSheetViewItem}>
          <Fontisto
            style={{ marginRight: 8 }}
            name="email"
            size={24}
            color="#4f93fe"
          />
          <Text style={styles.titleBottomSheetViewItem}>Email :</Text>
          <Text style={styles.contentBottomSheetViewItem}>
            {userData.email}
          </Text>
        </View>
        <View style={styles.viewLine}>
          <Text></Text>
        </View>
        <TouchableOpacity
          style={styles.bottomSheetViewLogout}
          onPress={alertLogOut}
        >
          <Text style={styles.logOutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default Setting;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    borderColor: '#ccc',
  },
  bottomSheetViewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  contentBottomSheetViewItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    textAlign: 'center',
    flex: 3,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#000',
    fontWeight: '500',
  },
  titleBottomSheetViewItem: {
    flex: 1,
    fontWeight: '500',
  },
  bottomSheetViewLogout: {
    fontWeight: '500',
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
  },
  logOutText: {
    fontWeight: '700',
    color: 'rgba(0,0,0,0.7)',
  },
  viewLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 50,
  },
});
