import { StyleSheet, Text, View, ScrollView } from 'react-native';
import axios, { CancelToken } from 'axios';
import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import UserItem from './UserItem';
import { UserType } from '../UserContext';
import UserNoGroup from './UserNoGroup';
import { socket } from '../socket';

const TabUsers = () => {
  const { userData, setuserData } = useContext(UserType);
  const cancelTokenSource = CancelToken.source();
  const [listUser, setListUser] = useState([]);
  const getListUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/allUsers/${userData._id}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        setListUser(res.data);
      } else {
        console.log('Lỗi axios getListUsers');
      }
    } catch (err) {
      console.log('Lỗi getListUsers' + err);
    }
  };

  useEffect(() => {
    socket.on('groupCreated', (data) => {
      data?.members.forEach((userId) => {
        if (userData._id == userId) {
          getListUsers();
        }
      });
    });
    getListUsers();
    return () => {
      cancelTokenSource.cancel();
      socket.off('groupCreated');
    };
  }, []);
  useEffect(() => {
    socket.on('addFriendStatus', (data) => {
      data.success == true &&
      (data.receiverId == userData._id || data.senderId == userData._id)
        ? getListUsers()
        : null;
    });
    return () => {
      socket.off('addFriendStatus');
    };
  }, []);

  return (
    <ScrollView
      style={styles.friendContainer}
      contentContainerStyle={styles.contentFriendContainer}
    >
      {listUser &&
        listUser.map((group, index) => {
          if (group.members) {
            return <UserItem group={group} key={index} isUser />;
          } else {
            return <UserNoGroup group={group} key={index} isUser />;
          }
        })}
    </ScrollView>
  );
};

export default TabUsers;

const styles = StyleSheet.create({
  friendContainer: {
    backgroundColor: 'rgba(0,0,0,0.001)',
    flex: 1,
    paddingHorizontal: 2,
  },
  contentFriendContainer: {},
});
