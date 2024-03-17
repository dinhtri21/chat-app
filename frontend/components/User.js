import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "axios";

const User = ({
  item,
  requestSent,
  users,
  friendRequests,
  listFriends,
  userId,
}) => {
  const isSent = requestSent.some((user) => user._id === item._id);
  const isUsers = users.some((user) => user._id === item._id);
  const isFriendRequest = friendRequests.some((user) => user._id === item._id);
  const isFriend = listFriends.some((user) => user._id === item._id);

  const acceptFriend = async (currentUserId, selectedUserId) => {
    try {
      socket.emit("acceptFriend", {
        currentUserId: currentUserId,
        selectedUserId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      socket.emit("friendRequest", {
        currentUserId: currentUserId,
        selectedUserId: selectedUserId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Pressable style={styles.containerUser}>
      <View style={styles.containerInfo}>
        <Image style={styles.infoImg} source={{ uri: item.image }} />
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
          onPress={() => acceptFriend(userId, item._id)}
          style={styles.friendBtn}
        >
          <Text style={styles.textBtn}>Accept</Text>
        </Pressable>
      ) : isFriend ? (
        <></>
      ) : isUsers ? (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
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
  friendBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#82CD47",
    width: 105,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 4,
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
});
