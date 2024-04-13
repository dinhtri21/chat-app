import { StyleSheet, Text, View, Image, Animated, Easing } from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import axios, { CancelToken } from 'axios';
import { UserType } from '../UserContext';
import { useContext } from 'react';
import UserChat from '../components/UserChat';
import { socket } from '../socket';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import Setting from '../components/Setting';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
// import Animated, {
//   useSharedValue,
//   withTiming,
//   interpolate,
// } from 'react-native-reanimated';

var fullwidth = Dimensions.get('window').width; //full width
var fullheight = Dimensions.get('window').height; //full height

const HomeScreeens = () => {
  const cancelTokenSource = CancelToken.source();
  const navigation = useNavigation();
  const { userData, setuserData } = useContext(UserType);
  const [listGroup, setListGroup] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [onModal, setOnMadal] = useState(false);

  const handlePresentModalPress = () => {
    // bottomSheetModalRef.current?.present();
    setOnMadal(true);
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerStyle: {
        zIndex: 1, // Đặt zIndex ở mức cao nhất
      },
      headerLeft: () => (
        <View style={styles.headerNavTitle}>
          <Image
            style={{ height: 50, width: 50 }}
            source={{
              uri:
                userData &&
                userData.image &&
                userData.image == `${process.env.EXPRESS_API_URL}`
                  ? userData.image
                  : 'https://img.freepik.com/premium-vector/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow_520826-1931.jpg',
            }}
          />

          <Text style={styles.infoNameUser}>{userData?.name}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.containerIconLeft}>
          <Feather
            onPress={() => navigation.navigate('ChatGroupSreen')}
            name="users"
            size={24}
            color="black"
          />
          <AntDesign
            onPress={() => navigation.navigate('Friends')}
            name="adduser"
            size={24}
            color="black"
          />
          <Ionicons
            onPress={handlePresentModalPress}
            name="settings-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  const getAllGroup = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/group/getAllGroup/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (response.status == 200) {
        const data = response.data;

        const updatedList = await Promise.all(
          data.map(async (group) => {
            let latestMessage = null;
            await Promise.all(
              group.members.map(async (member) => {
                if (member._id != userData._id) {
                  const recepientId = member._id;
                  latestMessage = await getLatestMessage(group, recepientId);
                }
              })
            );
            return { ...group, latestMessage };
          })
        );

        updatedList.sort((a, b) => {
          const latestMessageA = a.latestMessage;
          const latestMessageB = b.latestMessage;
          if (!latestMessageA) return 1; // Đẩy những nhóm A có tin nhắn lên trên
          if (!latestMessageB) return -1; // Đẩy những nhóm B không có tin nhắn xuống dưới
          return (
            new Date(latestMessageB.timeStamp) -
            new Date(latestMessageA.timeStamp)
          );
        });
        setListGroup(updatedList);
      }
    } catch (error) {
      console.log('Lỗi hàm getAllGroup -- ' + error);
    }
  };
  const getLatestMessage = async (group, recepientId) => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/messages/getLatestMessage/${userData._id}/${recepientId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );

      if (res.status === 200) {
        const newMessage = res.data.messages;
        return newMessage;
      }
    } catch (err) {
      console.log('Lỗi getLatestMessage: ' + err);
    }
    return null;
  };

  useEffect(() => {
    getAllGroup();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      socket.on('newMessage', (data) => {
        getAllGroup();
      });
      return () => {
        //  cancelTokenSource.cancel();
      };
    }, [])
  );

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  const showContent = () => {
    return Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => {});
  };
  useEffect(() => {
    if (onModal) {
      showContent();
    } else {
      fadeAnim.setValue(0);
    }
  }, [onModal]);

  return (
    <>
      <View style={{ backgroundColor: '#fff', flex: 1 }}>
        {listGroup.map((group, index) => {
          return <UserChat key={index} item={group} />;
        })}
      </View>
      <Setting
        userData={userData}
        onModal={onModal}
        setuserData={setuserData}
        setOnMadal={setOnMadal}
      ></Setting>
      {onModal ? (
        <Animated.View
          style={[
            styles.blur,
            {
              height: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '200%'],
              }),
            },
          ]}
        ></Animated.View>
      ) : null}
    </>
  );
};

export default HomeScreeens;

const styles = StyleSheet.create({
  headerNavTitle: {
    flex: 1,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerIconLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoNameUser: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  blur: {
    zIndex: 999,
    height: '100%',
    position: 'absolute',
    width: fullwidth,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
