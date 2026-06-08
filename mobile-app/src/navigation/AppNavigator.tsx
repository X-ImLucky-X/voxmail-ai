import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  View,
  ActivityIndicator,
} from "react-native";

import TaskScreen
from "../screens/TaskScreen";

import InboxScreen
from "../screens/InboxScreen";

import EmailDetailScreen
from "../screens/EmailDetailScreen";

import LoginScreen
from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import {
  useAuth,
} from "../context/AuthContext";

const Stack =
  createNativeStackNavigator();

export default function AppNavigator() {

  const {
    session,
    loading,
  } = useAuth();

  if (loading) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  return (

    <NavigationContainer>

      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor:
              "#FFFFFF",
          },

          headerShadowVisible:
            false,

          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: "#111827",
          },

          headerTintColor:
            "#4B5563",

          contentStyle: {
            backgroundColor:
              "#F9FAFB",
          },
        }}
      >

        {!session ? (

          <Stack.Screen
            name="Login"
            component={
              LoginScreen
            }
            options={{
              headerShown:
                false,
            }}
          />

        ) : (

          <>

            <Stack.Screen
              name="Inbox"
              component={
                InboxScreen
              }
              options={{
                headerShown:
                  false,
              }}
            />

            <Stack.Screen
              name="Tasks"
              component={
                TaskScreen
              }
              options={{
                title:
                  "Control Hub",

                headerBackTitle:
                  "",
              }}
            />

            <Stack.Screen
              name="EmailDetail"
              component={
                EmailDetailScreen
              }
              options={{
                title:
                  "Executive Intel",

                headerBackTitle:
                  "",
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: "Profile",
              }}
            />

          </>

        )}

      </Stack.Navigator>

    </NavigationContainer>
  );
}