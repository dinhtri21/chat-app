import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import { decode } from "base-64";
import { useContext } from "react";
import { socket } from "../socket";

// import { socket } from "../socket";

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);

  const handleLogin = async () => {
    const user = {
      email: email,
      password: password,
    };
    try {
      const res = await axios.post(
        `${process.env.EXPRESS_API_URL}/user/login`,
        user
      );
      Alert.alert(res.data.message);
      const token = res.data.token;
      await saveToken(token);
      const userIddecoded = await saveUserIDtoContext(token);
      await handleSocketLogin(userIddecoded);
      navigation.replace("Home");
    } catch (err) {
      Alert.alert(err.response.data.message);
    }
  };

  const saveToken = async (token) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      console.log("Token được lưu thành công");
    } catch (err) {
      console.log("Lỗi khi lưu token!");
    }
  };
  const saveUserIDtoContext = async () => {
    const token = await AsyncStorage.getItem("authToken");
    //Giải mã bằng decode base 64 token lấy userID
    const userIddecoded = await JSON.parse(decode(token.split(".")[1])).userId;

    await setUserId(userIddecoded);

    return userIddecoded
  };
  const checkToken = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const apiUrl = `${process.env.EXPRESS_API_URL}/user/check-token`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        navigation.replace("Home");
        saveUserIDtoContext(authToken);
      } else {
        console.log("Lỗi khi kiểm tra token:", response);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra token!");
    }
  };

  const handleSocketLogin = (userIddecoded) => {
    socket.emit("login", { userId: userIddecoded }, () => {
      console.log("Connected to server");
    });
  };

  useEffect(() => {
    // checkToken();
    // socket.on("connect", () => {
    //   console.log("Connected to server");
    // });
  }, []);
  return (
    <View
      style={{
        backgroundColor: "#fff",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
              width: width,
            }}
          >
            <View
              style={{
                // marginTop: 100,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#4A55A2", fontSize: 20, fontWeight: 500 }}>
                Sign In
              </Text>
              <Text
                style={{
                  color: "#000",
                  fontSize: 18,
                  fontWeight: 300,
                  marginTop: 20,
                }}
              >
                Sign In to Your Account{" "}
              </Text>
            </View>
            <View style={{ marginTop: 55 }}>
              <View>
                <Text>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(Text) => setEmail(Text)}
                  style={{
                    width: 300,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    marginVertical: 8,
                  }}
                  placeholder="enter your email"
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={(Text) => setPassword(Text)}
                  secureTextEntry={true}
                  style={{
                    width: 300,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    marginVertical: 4,
                  }}
                  placeholder="enter your password"
                />
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              style={{
                backgroundColor: "#4A55A2",
                width: 200,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 50,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Login
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                navigation.navigate("Register");
              }}
              style={{ justifyContent: "center", marginTop: 20 }}
            >
              <Text style={{ fontSize: 16, fontWeight: 300 }}>
                Dont't have an account? Sign Up
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});
