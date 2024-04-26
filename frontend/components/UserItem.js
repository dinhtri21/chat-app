import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { UserType } from '../UserContext';
import { useContext } from 'react';
import { socket } from '../socket';

const UserItem = ({ group, isFriendRequest, isFriend, isUser, isSent }) => {
  const { userData, setuserData } = useContext(UserType);
  const navigation = useNavigation();
  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      socket.emit('friendRequest', {
        senderId: currentUserId,
        receiverId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const acceptFriend = async (currentUserId, selectedUserId) => {
    try {
      socket.emit('acceptFriend', {
        acceptorId: currentUserId,
        senderId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };
  return group.members.map((memmber, index) => {
    return userData._id != memmber._id ? (
      <Pressable
        key={index}
        style={styles.containerUser}
        onPress={() => {
          navigation.navigate('Messages', { item: group });
        }}
      >
        <View style={styles.containerInfo}>
          <Image style={styles.infoImg} source={{ uri: memmber.image }} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.infoName}>{memmber.name}</Text>
            <Text style={styles.infoEmail}>{memmber.email}</Text>
          </View>
        </View>
        {isFriendRequest ? (
          <Pressable
            onPress={() => acceptFriend(userData._id, memmber._id)}
            style={styles.friendRequestBtn}
          >
            <Text style={styles.textBtn}>Accept</Text>
          </Pressable>
        ) : null}
        {isFriend ? (
          <Pressable style={styles.friendBtn}>
            <Text style={styles.textGrayBtn}>Bạn bè</Text>
          </Pressable>
        ) : null}
        {isUser ? (
          <Pressable
            onPress={() => sendFriendRequest(userData._id, memmber._id)}
            style={styles.usersBtn}
          >
            <Text style={styles.textBtn}>Kết bạn</Text>
          </Pressable>
        ) : null}
        {isSent ? (
          <Pressable style={styles.sentBtn}>
            <Text style={styles.textBtn}>Đã gửi</Text>
          </Pressable>
        ) : null}
      </Pressable>
    ) : null;
  });
};

export default UserItem;

const styles = StyleSheet.create({
  containerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: '#D0D0D0',
    borderTopWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  infoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  containerInfo: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  friendBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 0.4,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  friendRequestBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#82CD47',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  usersBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4f93fe',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  sentBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  textBtn: { color: '#fff' },
  textGrayBtn: {
    color: '#303030',
  },
});
