import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from "react-native";
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios, { CancelToken } from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import { socket } from "../socket";

const ChatScreen = () => {
  const route = useRoute();
  const { recepientId } = route.params;
  const navigation = useNavigation();
  const [recepientData, setRecepientData] = useState({});
  const { userId, setUserId } = useContext(UserType);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const source = CancelToken.source();
  const scrollViewRef = useRef();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={styles.headerContainer}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
          <View style={styles.headerInfo}>
            <Image
              style={styles.headerInfoImage}
              source={{ uri: recepientData?.image }}
            />
            <Text style={styles.headerNavTitle}>{recepientData?.name}</Text>
          </View>
        </View>
      ),
    });
  }, [recepientData]);

  const fetchRecepientData = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/user/${recepientId}`,
        {
          cancelToken: source.token,
        }
      );
      if (res.status == 200) {
        const data = res.data.user;
        setRecepientData(data);
      } else {
        console.log(res);
      }
    } catch (error) {
      console.log("Lỗi hàm fetchRecepientData: ", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/messages/getMessages/${userId}/${recepientId}`,
        {
          cancelToken: source.token,
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        setMessages(response.data.messages);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log("Lỗi hàm fetchMessages:", error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      // Gửi tin nhắn thông qua socket
      socket.emit("sendMessage", {
        senderId: userId,
        recepientId: recepientId,
        message: inputMessage.trim(),
        timeStamp: new Date().toISOString(),
      });
      setInputMessage("");
      fetchMessages(); // Xóa nội dung tin nhắn sau khi gửi
    }
  };

  //render tin nhắn
  const renderMessageBubble = (message, index) => {
    const isUserMessage = message.senderId === userId;
    return (
      <View
        key={index}
        style={[
          styles.messageBubble,
          { alignSelf: isUserMessage ? "flex-end" : "flex-start" },
          { backgroundColor: isUserMessage ? "#4a86f7" : "#fff" },
        ]}
      >
        <Text style={{ color: isUserMessage ? "#fff" : "#000" }}>
          {message.message}
        </Text>
      </View>
    );
  };

  // Khi tin nhắn mới được thêm vào, cuộn tự động xuống cuối
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchRecepientData();
    fetchMessages();
    return () => {
      source.cancel();
    };
  }, []);
  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.contentContainer}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(renderMessageBubble)}
      </ScrollView>

      {/* Thanh input */}
      <KeyboardAvoidingView
         behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <Entypo name="emoji-happy" size={24} color="black" />
        <TextInput
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChangeText={setInputMessage}
          style={styles.input}
        />
        <Ionicons name="send" size={24} color="black" onPress={sendMessage} />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerInfoImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#ccc",
    // borderWidth: 1,
  },
  headerNavTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  //
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    // backgroundColor: "#666",
  },
  contentContainer: {
    flexGrow: 1, // Kích thước nội dung tăng dần để cho phép cuộn
    justifyContent: "flex-end", // Đảm bảo tin nhắn mới luôn nằm ở cuối
  },
  messageBubble: {
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  inputContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
  input: {
    borderRadius: 18,
    borderColor: "#dddddd",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
});
