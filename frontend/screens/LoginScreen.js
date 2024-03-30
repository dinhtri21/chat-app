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
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios, { CancelToken } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import { decode } from "base-64";
import { useContext } from "react";
import { socket } from "../socket";

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const Login = () => {
  const cancelTokenSource = CancelToken.source();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [processing, setProcessing] = useState(false);

  const handleLogin = async () => {
    if (processing) return; // Nếu đang xử lý, không cho phép nhấn nút
    setProcessing(true); // Bắt đầu xử lý

    const user = {
      email: email,
      password: password,
    };
    try {
      const res = await axios.post(
        `${process.env.EXPRESS_API_URL}/user/login`,
        user,
        {
          cancelToken: cancelTokenSource.token, // Sử dụng token từ cancel token source
        }
      );
      if (res.status == 200) {
        const token = res.data.token;
        await saveToken(token);
        const userIddecoded = await saveUserIDtoContext(token);
        await handleSocketLogin(userIddecoded);
        navigation.replace("Home");
      } else {
        Alert.alert(`Đăng nhập không thành công! + ${res.data}`);
      }
    } catch (err) {
      Alert.alert("Đăng nhập thất bại!");
      console.log("Lỗi handleLogin" + err);
    } finally {
      setProcessing(false); // Kết thúc xử lý
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
  const saveUserIDtoContext = async (token) => {
    //Giải mã bằng decode base 64 token lấy userID
    const userIddecoded = await JSON.parse(decode(token.split(".")[1])).userId;

    await setUserId(userIddecoded);

    return userIddecoded;
  };
  const checkToken = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        return;
      }
      const response = await axios.get(
        `${process.env.EXPRESS_API_URL}/user/check-token`,
        {
          cancelToken: cancelTokenSource.token,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        const userIddecoded = await saveUserIDtoContext(authToken);
        await handleSocketLogin(userIddecoded);
        navigation.replace("Home");
      } else {
        console.log("Lỗi khi kiểm tra token:", response);
      }
    } catch (error) {
      console.log("Lỗi khi kiểm tra token!" + error);
    }
  };

  const handleSocketLogin = async (userIddecoded) => {
    try {
      await socket.emit("login", { userId: userIddecoded }, (res) => {
        console.log(`${res}`);
      });
    } catch (err) {
      console.log(`Lỗi handleSocketLogin: ${err}`);
    }
  };

  useEffect(() => {
  // checkToken()
    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  return (
    <View style={styles.containerLogin}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView>
          <View style={styles.innerLogin}>
            <View style={styles.containerHeader}>
              <Text style={styles.headerSignIn}>Sign In</Text>
              <Text style={styles.headerDes}>Sign In to Your Account </Text>
            </View>
            <View style={styles.containerInput}>
              <View>
                <Text>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(Text) => setEmail(Text)}
                  style={styles.textInputEmail}
                  placeholder="enter your email"
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={(Text) => setPassword(Text)}
                  secureTextEntry={true}
                  style={styles.textInputPassword}
                  placeholder="enter your password"
                />
              </View>
            </View>
            <Pressable
              onPress={handleLogin}
              disabled={processing}
              style={styles.loginBtn}
            >
              {processing ? (
                <ActivityIndicator color="#fff" size="small" /> // Hiển thị vòng tròn khi loading
              ) : (
                <Text xt style={styles.textLoginBtn}>
                  Login
                </Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                navigation.navigate("Register");
              }}
              style={styles.containerNoAccount}
            >
              <Text style={styles.textNoAccount}>
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

const styles = StyleSheet.create({
  containerLogin: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerLogin: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: width,
  },
  containerHeader: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSignIn: { color: "#4A55A2", fontSize: 20, fontWeight: "500" },
  headerDes: {
    color: "#000",
    fontSize: 18,
    fontWeight: "300",
    marginTop: 20,
  },
  containerInput: { marginTop: 55 },
  textInputEmail: {
    width: 300,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  textInputPassword: {
    width: 300,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 4,
  },
  loginBtn: {
    backgroundColor: "#4A55A2",
    width: 200,
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 50,
  },
  textLoginBtn: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  containerNoAccount: { justifyContent: "center", marginTop: 20 },
  textNoAccount: { fontSize: 16, fontWeight: "300" },
});
