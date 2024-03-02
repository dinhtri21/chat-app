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
import React, { useState } from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";


var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const Register = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: image,
    };
    axios
      .post(`${process.env.EXPRESS_API_URL}/user/register`, user)
      .then((res) => {
        console.log(res);
        Alert.alert(
          "Đăng ký tài khoản thành công!",
          "You have been registered Successfully"
        );
        setName("");
        setEmail("");
        setPassword("");
        setImage("");
      })
      .catch((err) => {
        Alert.alert(err.response.data.message);
        console.log(err.response.data.message);
      });
  };
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
                Register
              </Text>
              <Text
                style={{
                  color: "#000",
                  fontSize: 18,
                  fontWeight: 300,
                  marginTop: 20,
                }}
              >
                Register to Your Account{" "}
              </Text>
            </View>
            <View style={{ marginTop: 55 }}>
              <View>
                <Text>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(Text) => setName(Text)}
                  style={{
                    width: 300,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    marginVertical: 8,
                  }}
                  placeholder="enter your name"
                />
              </View>
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
                  secureTextEntry={true}
                  value={password}
                  onChangeText={(Text) => setPassword(Text)}
                  style={{
                    width: 300,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    marginVertical: 4,
                  }}
                  placeholder="enter your password"
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text>Image</Text>
                <TextInput
                  value={image}
                  onChangeText={(Text) => setImage(Text)}
                  style={{
                    width: 300,
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    marginVertical: 4,
                  }}
                  placeholder="Image"
                />
              </View>
            </View>

            <Pressable
              onPress={handleRegister}
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
                Register
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                navigation.navigate("Login");
              }}
              style={{ justifyContent: "center", marginTop: 20 }}
            >
              <Text style={{ fontSize: 16, fontWeight: 300 }}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({});
