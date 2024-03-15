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
    <Pressable
      style={{
        // backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
          source={{ uri: item.image }}
        />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontWeight: 400 }}>{item?.name}</Text>
          <Text style={{ marginTop: 2, color: "gray" }}>{item?.email}</Text>
        </View>
      </View>
      {isSent ? (
        <Pressable
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "gray",
            width: 105,
            paddingVertical: 6,
            paddingHorizontal: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff" }}>Sent</Text>
        </Pressable>
      ) : isFriendRequest ? (
        <Pressable
          onPress={() => acceptFriend(userId, item._id)}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#82CD47",
            width: 105,
            paddingVertical: 6,
            paddingHorizontal: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff" }}>Accept</Text>
        </Pressable>
      ) : isFriend ? (
        <></>
      ) : isUsers ? (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0178f6",
            width: 105,
            paddingVertical: 6,
            paddingHorizontal: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff" }}>Add Friend</Text>
        </Pressable>
      ) : (
        <></>
      )}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({});
