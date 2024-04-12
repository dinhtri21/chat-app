import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const User = ({
  item,
  requestSent,
  users,
  friendRequests,
  listFriends,
  userDataId,
}) => {
  const isSent = requestSent.some((user) => user._id === item._id);
  const isUsers = users.some((user) => user._id === item._id);
  const isFriendRequest = friendRequests.some((user) => user._id === item._id);
  const isFriend = listFriends.some((user) => user._id === item._id);
  const navigation = useNavigation();
  const acceptFriend = async (currentUserId, selectedUserId) => {
    try {
      socket.emit("acceptFriend", {
        acceptorId: currentUserId,
        senderId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      socket.emit("friendRequest", {
        senderId: currentUserId,
        receiverId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Pressable
      onPress={() => {
        navigation.navigate("Messages", { recepientId: item._id });
      }}
      style={styles.containerUser}
    >
      <View style={styles.containerInfo}>
        {/* <Image style={styles.infoImg} source={{ uri: item.image }} /> */}
        {item.image ? (
          <Image
            style={styles.infoImg}
            source={{ uri: item.image }}
          />
        ) : (
          <Image
            style={styles.infoImg}
            source={require("../assets/default-profile-picture-avatar.jpg")}
          />
        )}
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.infoName}>{item?.name}</Text>
          <Text style={styles.infoEmail}>{item?.email}</Text>
        </View>
      </View>
      {isSent ? (
        <Pressable style={styles.sentBtn}>
          <Text style={styles.textBtn}>Sent</Text>
        </Pressable>
      ) : isFriendRequest ? (
        <Pressable
          onPress={() => acceptFriend(userDataId, item._id)}
          style={styles.friendRequestBtn}
        >
          <Text style={styles.textBtn}>Accept</Text>
        </Pressable>
      ) : isFriend ? (
        <Pressable style={styles.friendBtn}>
          <Text style={styles.textGrayBtn}>Friend</Text>
        </Pressable>
      ) : isUsers ? (
        <Pressable
          onPress={() => sendFriendRequest(userDataId, item._id)}
          style={styles.usersBtn}
        >
          <Text style={styles.textBtn}>Add Friend</Text>
        </Pressable>
      ) : (
        <></>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({
  containerUser: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: "#D0D0D0",
    // borderColor: "#000",
    borderTopWidth: 0,
    // backgroundColor: "#ccc"
  },
  containerInfo: { flexDirection: "row", alignItems: "center", gap: 2 },
  infoImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  infoName: { fontSize: 15, fontWeight: "400" },
  infoEmail: { marginTop: 2, color: "gray" },
  sentBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  friendRequestBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#82CD47",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  friendBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 0.4,
    borderColor: "#808080",
  },
  usersBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0178f6",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  textBtn: { color: "#fff" },
  textGrayBtn: {
    color: "#808080",
  },
});
