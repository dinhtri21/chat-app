import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "axios";

const User = ({ item, requestSent, friendRequests, userId }) => {
  // const sendFriendRequest = async (currentUserId, selectedUserId) => {
  //   try {
  //     const res = await axios.post(
  //       `${process.env.EXPRESS_API_URL}/friend/friend-request`,
  //       {
  //         currentUserId,
  //         selectedUserId,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     if (res.status == 200) {
  //       console.log("thành công");
  //     }
  //   } catch (err) {
  //     console.log("Thất bại");
  //   }
  // };

  // const sendFriendRequest = () => {
  //   socket.emit('sendFriendRequest', 'your_user_id', friendId); // Thay 'your_user_id' bằng ID của người dùng đang đăng nhập
  //   setFriendId('');
  // };

  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    try {
      console.log("sjhd");
      // socket.connect();

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
      {requestSent.some((user) => {
        return user._id == item._id;
      }) ? (
        <Pressable
          // onPress={() => sendFriendRequest(userId, item._id)}
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
      ) : friendRequests.some((user) => {
          return user._id == item._id;
        }) ? (
        <Pressable
          // onPress={() => sendFriendRequest(userId, item._id)}
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
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userId, item._id)}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0071d8",
            width: 105,
            paddingVertical: 6,
            paddingHorizontal: 6,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#fff" }}>Add Friend</Text>
        </Pressable>
      )}

      {/* <Pressable
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#82CD47",
          width: 105,
          paddingVertical: 4,
          paddingHorizontal: 4,
          borderRadius: 4,
        }}
      >
        <Text style={{ color: "#fff" }}>Friend</Text>
      </Pressable> */}
    </Pressable>
  );
};

export default User;

const styles = StyleSheet.create({});
