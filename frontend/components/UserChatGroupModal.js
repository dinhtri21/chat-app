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

const UserChatGroupModal = ({ friend, handleFriendSelect, isSelected }) => {
  return (
    <TouchableOpacity
      onPress={() => handleFriendSelect(friend)}
      activeOpacity={1}
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
              friend &&
              friend.image &&
              `${process.env.EXPRESS_API_URL}`.indexOf(friend.image)
                ? { uri: friend.image }
                : require('../assets/default-profile-picture-avatar.jpg')
            }
          />
          <View>
            <Text style={{ color: '#000', fontSize: 16 }}>{friend?.name}</Text>
            <Text style={{ color: '#ccc' }}>{friend?.email}</Text>
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
  );
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
