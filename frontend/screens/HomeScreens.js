import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
    setOnMadal(true);
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={styles.headerNavTitle}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            Đoạn chat
          </Text>
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

  return (
    <>
      <View style={{ backgroundColor: '#fff', flex: 1 }}>
        <ScrollView>
          {listGroup.map((group, index) => {
            return <UserChat key={index} item={group} />;
          })}
        </ScrollView>
      </View>
      <Setting
        userData={userData}
        setuserData={setuserData}
        onModal={onModal}
        setOnMadal={setOnMadal}
      ></Setting>
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
    color: '#rgba(0, 0, 0, 0.5)',
  },
  blur: {
    position: 'absolute',
    width: fullwidth,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
