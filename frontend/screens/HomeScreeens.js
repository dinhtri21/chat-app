import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
  const [listGroup, setListGroup] = useState([]);
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

  const getAllGroup = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/group/getAllGroup/${userId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (response.status == 200) {
        const data = response.data;

        const updatedList = await Promise.all(
          data.map(async (group) => {
            let latestMessage = null;
            await Promise.all(
              group.members.map(async (member) => {
                if (member._id != userId) {
                  latestMessage = await getLatestMessage(group, member._id);
                }
              })
            );
            return { ...group, latestMessage };
          })
        );

        updatedList.sort((a, b) => {
          const latestMessageA = a.latestMessage;
          const latestMessageB = b.latestMessage;

          if (!latestMessageA) return 1; // Đẩy những nhóm không có tin nhắn lên trên
          if (!latestMessageB) return -1;
          return (
            new Date(latestMessageB.timeStamp) -
            new Date(latestMessageA.timeStamp)
          );
        });
        setListGroup(updatedList);
      }
    } catch (error) {
      console.log("Lỗi hàm getAllGroup" + error);
    }
  };
  const getLatestMessage = async (group, recepientId) => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/messages/getLatestMessage/${userId}/${recepientId}`,
        {
          cancelToken: cancelTokenSource.token,
        }
      );
      if (res.status === 200) {
        const newMessage = res.data.message;
        const currentGroup = listGroup.find(
          (item) => item.group === group.group
        ); // Tìm nhóm trong listGroup

        if (currentGroup) {
          const currentLatestMessage = currentGroup.latestMessage;
          // So sánh thời gian của tin nhắn mới nhất và tin nhắn mới nhận được
          if (
            currentLatestMessage &&
            new Date(newMessage.timeStamp) >
              new Date(currentLatestMessage.timeStamp)
          ) {
            return { ...newMessage, isNew: true };
          }
        }
        return { ...newMessage, isNew: false };
      }
    } catch (err) {
      console.log("Lỗi getLatestMessage: " + err);
    }
    return null;
  };

  useEffect(() => {
    getAllGroup();
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      socket.on("newMessage", (data) => {
        getAllGroup();
      });
      socket.on("addFriendStatus", (data) => {
        getAllGroup();
      });
      return () => {};
    }, [])
  );

  useEffect(() => {
    socket.on("newMessage", (data) => {
      // getListFriends();
      getAllGroup();
    });
    socket.on("addFriendStatus", (data) => {
      getAllGroup();
    });
    socket.on("friendRequestAccepted", (data) => {
      getAllGroup();
    });
    return () => {
      cancelTokenSource.cancel();
      // socket.off("newMessage");
      // socket.off("addFriendStatus");
      // socket.off("friendRequestAccepted");
    };
  }, []);

  return (
    <>
      <View>
        {listGroup.map((group, index) => {
          return <UserChat key={index} item={group} />;
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
