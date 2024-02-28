import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  Pressable,
} from "react-native";
import React from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const Login = () => {
  const navigation = useNavigation();
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
              onPress={() => {navigation.navigate('Register')}}
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