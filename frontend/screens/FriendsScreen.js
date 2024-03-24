import { Alert, StyleSheet, Text, View, Button } from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import axios, { CancelToken } from "axios";
import User from "../components/User";
import { socket } from "../socket";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const cancelTokenSource = CancelToken.source();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [requestSent, setRequestSent] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [listFriends, setListFriends] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Custom Back",
      headerBackTitleStyle: { fontSize: 30 },
      headerTitle: () => <Text style={styles.headerNavTitle}>Friends</Text>,
      headerTitleAlign: "center",
    });
  }, []);

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem("authToken");
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/allUsers/${userId}`,
        {
          cancelToken: cancelTokenSource.token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setUsers(data);
      } else {
        console.log(res);
      }
    } catch (err) {
      console.log("Lỗi fetchUsers" + err);
    }
  };

  const getListSentFriendRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/getListSentFriendRequests/${userId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setRequestSent(data);
      } else {
        console.log("Lỗi axios getListSentFriendRequests");
      }
    } catch (err) {
      console.log("Lỗi getListSentFriendRequests" + err);
    }
  };
  const getListFriendRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/friend/getListFriendRequest/${userId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status == 200) {
        const data = res.data;
        setFriendRequests(data);
      } else {
        console.log("Lỗi axios getListFriendRequests");
      }
    } catch (err) {
      console.log("Lỗi getListFriendRequests" + err);
    }
  };

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
        setListFriends(data);
      } else {
        console.log("Lỗi axios getListFriendRequests");
      }
    } catch (err) {
      console.log("Lỗi getListFriendRequests" + err);
    }
  };
  useEffect(() => {
    fetchUsers();
    getListFriends();
    getListSentFriendRequests();
    getListFriendRequests();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useEffect(() => {
    socket.on("addFriendStatus", (data) => {
      if (data.success == true) {
        fetchUsers();
        getListFriends();
        getListSentFriendRequests();
        getListFriendRequests();
      }
    });
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  return (
    <View style={{ padding: 10 }}>
      {users &&
        users.map((item, index) => {
          return (
            <User
              item={item}
              key={index}
              users={users}
              requestSent={requestSent}
              friendRequests={friendRequests}
              listFriends={listFriends}
              userId={userId}
            />
          );
        })}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  headerNavTitle: { fontSize: 16, fontWeight: "bold" },
  containerIconLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
});
