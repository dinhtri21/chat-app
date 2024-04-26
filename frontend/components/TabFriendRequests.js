import { StyleSheet, Text, View, ScrollView } from 'react-native';
import axios, { CancelToken } from 'axios';
import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import UserItem from './UserItem';
import { UserType } from '../UserContext';
import { socket } from '../socket';

const TabFriendRequests = () => {
  const { userData, setuserData } = useContext(UserType);
  const cancelTokenSource = CancelToken.source();
  const [listRequestFriend, setListRequestFriend] = useState([]);
  const [listSentFriendRequests, setListSentFriendRequests] = useState([]);
  const getListRequestFriend = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/getListFriendRequest/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        setListRequestFriend(res.data);
      }
    } catch (err) {
      console.log('Lỗi getListFriendsRequest' + err);
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
        setListSentFriendRequests(res.data);
      }
    } catch (err) {
      console.log('Lỗi getListFriendsRequest' + err);
    }
  };

  useEffect(() => {
    getListRequestFriend();
    getListSentFriendRequests();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);
  useEffect(() => {
    socket.on('addFriendStatus', (data) => {
      if (
        data.success == true &&
        (data.receiverId == userData._id || data.senderId == userData._id)
      ) {
        getListRequestFriend();
        getListSentFriendRequests();
      }

      data.success == true &&
      data.newGroup == true &&
      data.receiverId == userData._id
        ? socket.emit('joinGroup', {
            groupId: data.groupId,
            receiverId: data.receiverId,
          })
        : null;
    });
    socket.on('friendRequestAccepted', (data) => {
      if (data.status == 'success') {
        getListRequestFriend();
        getListSentFriendRequests();
      }
    });
    return () => {
      socket.off('addFriendStatus');
      socket.off('friendRequestAccepted');
    };
  }, []);

  return (
    <ScrollView
      style={styles.friendContainer}
      contentContainerStyle={styles.contentFriendContainer}
    >
      {listRequestFriend &&
        listRequestFriend.map((group, index) => {
          return <UserItem group={group} key={index} isFriendRequest />;
        })}
      {listSentFriendRequests &&
        listSentFriendRequests.map((group, index) => {
          return <UserItem group={group} key={index} isSent />;
        })}
    </ScrollView>
  );
};

export default TabFriendRequests;

const styles = StyleSheet.create({
  friendContainer: {
    backgroundColor: 'rgba(0,0,0,0.001)',
    flex: 1,
    paddingHorizontal: 2,
  },
  contentFriendContainer: {},
});
