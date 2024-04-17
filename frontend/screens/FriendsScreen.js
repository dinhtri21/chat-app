import {
  Alert,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserType } from '../UserContext';
import axios, { CancelToken } from 'axios';
import User from '../components/User';
import { socket } from '../socket';


const HomeScreen = () => {
  const cancelTokenSource = CancelToken.source();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const { userData, setuserData } = useContext(UserType);
  const [requestSent, setRequestSent] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [listFriends, setListFriends] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Friends',
      headerBackTitleStyle: { fontSize: 30 },
      headerTitle: () => <Text style={styles.headerNavTitle}>Bạn Bè</Text>,
      headerTitleAlign: 'center',
    });
  }, []);

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem('authToken');
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/allUsers/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setUsers(data);
      } else {
        console.log(res);
      }
    } catch (err) {
      console.log('Lỗi fetchUsers' + err);
    }
  };

  const getListSentFriendRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/getListSentFriendRequests/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setRequestSent(data);
      } else {
        console.log('Lỗi axios getListSentFriendRequests');
      }
    } catch (err) {
      console.log('Lỗi getListSentFriendRequests' + err);
    }
  };
  const getListFriendRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/getListFriendRequest/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setFriendRequests(data);
      } else {
        console.log('Lỗi axios getListFriendRequests');
      }
    } catch (err) {
      console.log('Lỗi getListFriendRequests' + err);
    }
  };

  const getListFriends = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/listFriends/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setListFriends(data);
      } else {
        console.log('Lỗi axios getListFriendRequests');
      }
    } catch (err) {
      console.log('Lỗi getListFriendRequests' + err);
    }
  };
  useEffect(() => {
    fetchUsers();
    getListFriends();
    getListSentFriendRequests();
    getListFriendRequests();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useEffect(() => {
    socket.on('addFriendStatus', (data) => {
      if (
        (data.success == true && data.receiverId == userData._id) ||
        data.senderId == userData._id
      ) {
        fetchUsers();
        getListFriends();
        getListSentFriendRequests();
        getListFriendRequests();

        socket.emit('joinGroup', {
          groupId: data.groupId,
          receiverId: data.receiverId,
        });
      }
    });
    socket.on('friendRequestAccepted', (data) => {
      if (data.status == 'success') {
        fetchUsers();
        getListFriends();
        getListSentFriendRequests();
        getListFriendRequests();
      }
    });
    return () => {
      socket.off('newMessage');
      socket.off('addFriendStatus');
      socket.off('friendRequestAccepted');
      cancelTokenSource.cancel();
    };
  }, []);

  return (
    <ScrollView
      style={styles.friendContainer}
      contentContainerStyle={styles.contentFriendContainer}
    >
      {users &&
        users.map((item, index) => {
          return (
            <User
              item={item}
              key={index}
              users={users}
              requestSent={requestSent}
              friendRequests={friendRequests}
              listFriends={listFriends}
              userDataId={userData._id}
            />
          );
        })}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  headerNavTitle: { fontSize: 20, fontWeight: '700' },
  containerIconLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  friendContainer: {
    backgroundColor: 'rgba(0,0,0,0.001)',
    flex: 1,
    paddingHorizontal: 2,
  },
  contentFriendContainer: {
  },
});
