import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useContext } from 'react';
import { UserType } from '../UserContext';
import MultiMemberGroup from './MultiMemberGroup';

const UserChat = ({ item }) => {
  const { userData, setuserData } = useContext(UserType);
  const navigation = useNavigation();
  let formattedTime = null;
  // Định dạng thời gian theo múi giờ Việt Nam
  if (item.latestMessage) {
    formattedTime = moment(item?.latestMessage?.timeStamp)
      .utcOffset('+0700')
      .format('HH:mm'); // Định dạng chỉ giờ: phút
  }

  return item.latestMessage ? (
    <Pressable
      onPress={() => {
        navigation.navigate('Messages', {
          item: item,
        });
      }}
      style={[styles.containerUserChat]}
    >
      <View style={styles.containerInfo}>
        <Image
          style={styles.infoImg}
          source={
            item?.members.length > 2
              ? require('../assets/groupIcon.png')
              : {
                  uri:
                    userData._id == item?.members?.[0]._id
                      ? item?.members?.[1]?.image
                      : item?.members?.[0]?.image,
                }
          }
        />
        <View style={styles.infoNameMessLast}>
          <Text style={styles.infoName}>
            {item?.members.length > 2
              ? item.group
              : userData._id == item?.members?.[0]._id
              ? item?.members?.[1]?.name
              : item?.members?.[0]?.name}
          </Text>
          {item?.latestMessage?.messageType == 'text' ? (
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={styles.infoLastMessage}
            >
              {item.latestMessage.message}
            </Text>
          ) : item?.latestMessage?.messageType == 'image' ? (
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={styles.infoLastMessage}
            >
              [Hình ảnh]
            </Text>
          ) : item?.latestMessage == null ? (
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={styles.infoLastMessage}
            >
              Đã là bạn bè.
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.containerLastMessageTime}>
        <Text style={styles.lastMessageTime}>
          {formattedTime != null ? formattedTime : null}
        </Text>
      </View>
    </Pressable>
  ) : null;
};

export default UserChat;

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
    backgroundColor: 'rgba(0,0,0,0.03)',
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
