import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { useContext } from 'react';
import { UserType } from '../UserContext';

const UserChatGroupModal = ({ friends, handleFriendSelect, isSelected }) => {
  const { userData, setuserData } = useContext(UserType);
  return friends.members.map((friend, index) => {
    return userData._id != friend._id ? (
      <TouchableOpacity
        onPress={() => handleFriendSelect(friends)}
        activeOpacity={1}
        key={index}
      >
        <View style={styles.friendContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
              style={{
                height: 45,
                width: 45,
                borderRadius: 40,
                backgroundColor: '#ccc',
              }}
              source={
                friend && `${process.env.EXPRESS_API_URL}`.indexOf(friend.image)
                  ? require('../assets/default-profile-picture-avatar.jpg')
                  : { uri: friend?.image }
              }
            />
            <View>
              <Text style={{ color: '#000', fontSize: 16 }}>{friend.name}</Text>
              <Text style={{ color: '#ccc' }}> {friend?.email}</Text>
            </View>
          </View>
          <View>
            {isSelected ? (
              <AntDesign name="checkcircle" size={24} color="#0057ffa8" />
            ) : (
              <View style={styles.radioBtn}></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ) : null;
  });
};

export default UserChatGroupModal;

const styles = StyleSheet.create({
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  radioBtn: {
    height: 24,
    width: 24,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 50,
    backgroundColor: '#fff',
  },
});
