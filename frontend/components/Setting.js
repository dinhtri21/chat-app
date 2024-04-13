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
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { Easing } from 'react-native-reanimated';

var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full height

const Setting = ({ userData, setuserData, onModal, setOnMadal }) => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '45%'], []);
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
      setuserData({});
      bottomSheetModalRef.current.close();
      navigation.replace('Login');
    } catch (error) {
      console.log('Lỗi khi xóa token:', error);
    }
  };

  const closeModal = () => {
    bottomSheetModalRef.current.close();
    setOnMadal(false);
  };
  return (
    // <View >
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      style={styles.container}
      onDismiss={closeModal}
      animationConfig={animationConfigs}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Setting</Text>
        <Image
          style={{ height: 100, width: 100, borderRadius: 50 }}
          source={{
            uri:
              userData &&
              userData.image &&
              userData.image == `${process.env.EXPRESS_API_URL}`
                ? userData.image
                : 'https://img.freepik.com/premium-vector/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow_520826-1931.jpg',
          }}
        />
        <View style={styles.bottomSheetViewItem}>
          <AntDesign
            style={{ marginRight: 8 }}
            name="user"
            size={24}
            color="black"
          />
          <Text style={styles.titleBottomSheetViewItem}>Full Name :</Text>
          <Text style={styles.contentBottomSheetViewItem}>{userData.name}</Text>
        </View>
        <View style={styles.bottomSheetViewItem}>
          <Fontisto
            style={{ marginRight: 8 }}
            name="email"
            size={24}
            color="black"
          />
          <Text style={styles.titleBottomSheetViewItem}>Email :</Text>
          <Text style={styles.contentBottomSheetViewItem}>
            {userData.email}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.bottomSheetViewLogout}
        >
          <Text>Log Out</Text>
          <Feather name="log-out" size={24} color="black" />
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
    // </View>
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
    gap: 6,
    // flex: 1,
    alignItems: 'center',
    // backgroundColor: "#ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  bottomSheetViewItem: {
    width: 350,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // gap: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomSheetViewLogout: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f9',
    borderWidth: 1,
    borderColor: '#cccc',
    paddingHorizontal: 24,
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 10,
  },
  titleBottomSheetViewItem: {
    fontWeight: '500',
    width: 90,
  },
  contentBottomSheetViewItem: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    // backgroundColor: "#ccc",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});
