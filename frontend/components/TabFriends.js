import { StyleSheet, Text, View, ScrollView } from 'react-native';
import axios, { CancelToken } from 'axios';
import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import UserItem from './UserItem';
import { UserType } from '../UserContext';
import { socket } from '../socket';

const TabFriends = () => {
  const { userData, setuserData } = useContext(UserType);
  const cancelTokenSource = CancelToken.source();
  const [listFriends, setListFriends] = useState([]);
  const getListFriends = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/listFriends/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        setListFriends(res.data);
      } else {
        console.log('Lỗi axios getListFriendRequests');
      }
    } catch (err) {
      console.log('Lỗi getListFriendRequests' + err);
    }
  };

  useEffect(() => {
    getListFriends();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);
  useEffect(() => {
    socket.on('friendRequestAccepted', (data) => {
      if (data.status == 'success') {
        getListFriends();
      }
    });
    return () => {
      socket.off('friendRequestAccepted');
    };
  }, []);
  return (
    <ScrollView
      style={styles.friendContainer}
      contentContainerStyle={styles.contentFriendContainer}
    >
      {listFriends &&
        listFriends.map((group, index) => {
          return <UserItem group={group} key={index} isFriend />;
        })}
    </ScrollView>
  );
};

export default TabFriends;

const styles = StyleSheet.create({
  friendContainer: {
    backgroundColor: 'rgba(0,0,0,0.001)',
    flex: 1,
    paddingHorizontal: 2,
  },
  contentFriendContainer: {},
});
