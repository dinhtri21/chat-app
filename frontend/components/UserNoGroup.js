import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { UserType } from '../UserContext';
import { useContext } from 'react';
import { socket } from '../socket';

const UserNoGroup = ({ group, isUser }) => {
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
  return (
    <Pressable
      style={styles.containerUser}
      onPress={() => {
        navigation.navigate('Messages', { item: group });
      }}
    >
      <View style={styles.containerInfo}>
        <Image style={styles.infoImg} source={{ uri: group.image }} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.infoName}>{group.name}</Text>
          <Text style={styles.infoEmail}>{group.email}</Text>
        </View>
      </View>
      {isUser ? (
        <Pressable
          onPress={() => sendFriendRequest(userData._id, group._id)}
          style={styles.usersBtn}
        >
          <Text style={styles.textBtn}>Kết bạn</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
};

export default UserNoGroup;

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
  usersBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4f93fe',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  containerInfo: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  textBtn: { color: '#fff' },
  textGrayBtn: {
    color: '#303030',
  },
});
