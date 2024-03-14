import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import axios from "axios";
import User from "../components/User";

// import { socket } from "../socket";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Swift Chat</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");

      console.log(userId);
      try {
        const res = await axios.get(
          `${process.env.EXPRESS_API_URL}/user/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status == 200) {
          setUsers(res.data);
        } else {
          console.log(res);
        }
      } catch (err) {
        console.log("Lỗi fetchUsers" + err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const getListSentFriendRequests = async () => {
      try {
        const res = await axios(
          `${process.env.EXPRESS_API_URL}/friend/getListSentFriendRequests/${userId}`
        );
        if (res.status == 200) {
          setRequestSent(res.data);
        } else {
          console.log("Lỗi axios getListSentFriendRequests");
        }
      } catch (err) {
        console.log("Lỗi getListSentFriendRequests" + err);
      }
    };
    getListSentFriendRequests();
  }, []);

  useEffect(() => {
    const getListFriendRequests = async () => {
      try {
        const res = await axios(
          `${process.env.EXPRESS_API_URL}/friend/getListFriendRequest/${userId}`
        );
        if (res.status == 200) {
          setFriendRequests(res.data);
        } else {
          console.log("Lỗi axios getListFriendRequests");
        }
      } catch (err) {
        console.log("Lỗi getListFriendRequests" + err);
      }
    };
    getListFriendRequests();
  }, []);

  // useEffect(() => {
  //   socket.emit("chat message", "hello");

  //   socket.on("chat message", (msg) => {
  //     console.log(msg);
  //   });
  //   setTimeout(() => {
  //     //  socket.disconnect();
  //   }, 1000);
  // }, []);

  return (
    <View style={{ padding: 10 }}>
      {users &&
        users.map((item, index) => {
          return (
            <User
              item={item}
              key={index}
              requestSent={requestSent}
              friendRequests={friendRequests}
              userId={userId}
            />
          );
        })}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
