import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import axios, { CancelToken } from "axios";
import { UserType } from "../UserContext";
import { useContext } from "react";
import UserChat from "../components/UserChat";
import { socket } from "../socket";

const HomeScreeens = () => {
  const cancelTokenSource = CancelToken.source();
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [listFriends, setListFriends] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => <Text style={styles.headerNavTitle}>Home Chat</Text>,
      headerRight: () => (
        <View style={styles.containerIconLeft}>
          <Ionicons
            onPress={() => navigation.navigate("Chats")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  const getListFriends = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/listFriends/${userId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        const updatedList = await Promise.all(
          data.map(async (user) => {
            // Lấy tin nhắn mới nhất cho mỗi user
            const latestMessage = await getLatestMessage(user._id);
            return { ...user, latestMessage };
          })
        );
        // Sắp xếp danh sách theo thứ tự tin nhắn mới nhất
        updatedList.sort((a, b) => {
          if (!a.latestMessage) return 1; // Đẩy những user không có tin nhắn lên trên
          if (!b.latestMessage) return -1;
          return (
            new Date(b.latestMessage.timeStamp) -
            new Date(a.latestMessage.timeStamp)
          );
        });
        setListFriends(updatedList);
      } else {
        console.log("Lỗi axios getListFriendRequests");
      }
    } catch (err) {
      console.log("Lỗi getListFriendRequests" + err);
    }
  };
  const getLatestMessage = async (recepientId) => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/messages/getLatestMessage/${userId}/${recepientId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status === 200) {
        return res.data.message;
      }
    } catch (err) {
      console.log("Lỗi getLatestMessage: " + err);
    }
    return null;
  };

  useEffect(() => {
    getListFriends();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useEffect(() => {
    socket.on("newMessage", (data) => {
      getListFriends();
    });
  }, []);

  return (
    <>
      <View>
        {listFriends.map((user, index) => {
          return <UserChat key={index} item={user} />;
        })}
      </View>
    </>
  );
};

export default HomeScreeens;

const styles = StyleSheet.create({
  headerNavTitle: { fontSize: 16, fontWeight: "bold" },
  containerIconLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
});
