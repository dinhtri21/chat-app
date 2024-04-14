import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React from 'react';
import LoginScreen from './screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import FriendsScreen from './screens/FriendsScreen';
import HomeScreeens from './screens/HomeScreens';
import ChatScreen from './screens/ChatScreen';
import ChatGroupSreen from './screens/ChatGroupScreen';
import { AntDesign } from '@expo/vector-icons';
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="Friends" component={FriendsScreen} />
        <Stack.Screen name="Home" component={HomeScreeens} />
        <Stack.Screen name="Messages" component={ChatScreen} />
        <Stack.Screen
          options={({ navigation }) => ({
            headerTitle: 'Group chat',
            headerTransparent: false,
            headerTintColor: 'black',
            headerTitleStyle: {
              fontWeight: 'bold',
            },

            headerRight: () => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Search');
                  }}
                >
                  <AntDesign name="addusergroup" size={24} color="black" />
                </TouchableOpacity>
              );
            },
          })}
          name="ChatGroupSreen"
          component={ChatGroupSreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});
