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
  Button,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { EvilIcons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

var width = Dimensions.get("window").width; //full width
var height = Dimensions.get("window").height; //full height

const Register = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedImages, setSelectedImages] = useState({});

  const handleRegister = async () => {
    try {
      let imageBase64 = "";
      let mimeType = "";
      if (selectedImages.uri && selectedImages.mimeType) {
        imageBase64 = await FileSystem.readAsStringAsync(selectedImages.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        mimeType = selectedImages.mimeType;
      }

      const user = {
        name: name,
        email: email,
        password: password,
        imageBase64: imageBase64,
        mimeType: mimeType,
      };
      axios
        .post(`${process.env.EXPRESS_API_URL}/user/register`, user)
        .then((res) => {
          Alert.alert(
            "Đăng ký tài khoản thành công!",
            "You have been registered Successfully"
          );
          setName("");
          setEmail("");
          setPassword("");
          setSelectedImages({});
        })
        .catch((err) => {
          Alert.alert(err.response.data.message);
          console.log(err.response.data.message);
        });
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Quyền truy cập thư viện ảnh bị từ chối!");
      }
    })();
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsMultipleSelection: true,
      // allowsEditing: true,
      // aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled && result.assets) {
      const resizedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      const Image = { ...result.assets[0], uri: resizedImage.uri };
      setSelectedImages(Image);
    }
  };
  const handleDeleteImage = () => {
    setSelectedImages({});
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
              <View style={styles.avatarInput}>
                <Pressable onPress={pickImages} style={styles.avatarBtn}>
                  <Text>Chọn ảnh đại diện</Text>
                </Pressable>
                {selectedImages?.fileName ? (
                  <View style={{ flexDirection: "row" }}>
                    <Text ellipsizeMode="tail" numberOfLines={1}>
                      {selectedImages.fileName}
                    </Text>
                    <EvilIcons
                      onPress={handleDeleteImage}
                      name="close"
                      size={24}
                      color="black"
                    />
                  </View>
                ) : null}
                {/* <Text>Chọn ảnh đại diện</Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 10,
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ width: 50, height: 50, marginLeft: 20 }}
                    source={{
                      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8QpKHeBbrELrNRa-63gDAsBM2TQR3GzSxCYwMw73LVw&s",
                    }}
                  />
                </View> */}
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

const styles = StyleSheet.create({
  avatarInput: {
    marginTop: 20,
    flexDirection: "row",
    // justifyContent: "center",
    width: 111,
    gap: 8,
    alignItems: "center",
  },
  avatarBtn: {
    gap: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 4,
    paddingHorizontal: 4,
    width: 140,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#efefef",
    borderRadius: 4,
  },
});
