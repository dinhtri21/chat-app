import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useContext } from 'react';
import { UserType } from '../UserContext';

const MultiMemberGroup = ({ item }) => {
  const { userData, setuserData } = useContext(UserType);
  const navigation = useNavigation();
  let formattedTime = null;
  // Định dạng thời gian theo múi giờ Việt Nam
  if (item.latestMessage) {
    formattedTime = moment(item?.latestMessage?.timeStamp)
      .utcOffset('+0700')
      .format('HH:mm'); // Định dạng chỉ giờ: phút
  }

  return (
    <Pressable
      style={[styles.containerUserChat]}
      onPress={() => {
        navigation.navigate('Messages', {
          recepientIds: item.members,
          groupId: item._id,
          item: item,
        });
      }}
    >
      <View style={styles.containerInfo}>
        <Image
          defaultSource={require('../assets/default-profile-picture-avatar.jpg')}
          style={styles.infoImg}
          source={require('../assets/default-profile-picture-avatar.jpg')}
        />
        <View style={styles.infoNameMessLast}>
          <Text style={styles.infoName}>{item.group}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default MultiMemberGroup;

const styles = StyleSheet.create({
  containerUserChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 0.5,
    borderColor: '#D0D0D0',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  containerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 1,
    flex: 8,
  },
  infoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
    backgroundColor: '#fff',
  },
  infoName: {
    fontSize: 15,
    fontWeight: '400',
  },
  containerLastMessageTime: {
    flex: 1,
  },
  infoNameMessLast: {
    marginVertical: 12,
    marginLeft: 12,
    flex: 1,
  },
  infoLastMessage: {
    flexWrap: 'wrap',
    marginTop: 3,
    color: 'gray',
  },
  sentBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  lastMessageTime: {
    marginTop: 3,
    color: 'gray',
  },
});
