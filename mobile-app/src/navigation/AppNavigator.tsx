import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskScreen from "../screens/TaskScreen";
import InboxScreen from "../screens/InboxScreen";
import EmailDetailScreen from "../screens/EmailDetailScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: "#111827",
          },
          headerTintColor: "#4B5563",
          contentStyle: {
            backgroundColor: "#F9FAFB",
          },
        }}
      >
        <Stack.Screen
          name="Inbox"
          component={InboxScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Tasks"
          component={TaskScreen}
          options={{
            title: "Control Hub",
            headerBackTitle: "", // Fix: Hides back string label on native stack options
          }}
        />
        <Stack.Screen
          name="EmailDetail"
          component={EmailDetailScreen}
          options={{
            title: "Executive Intel",
            headerBackTitle: "", // Fix: Hides back string label on native stack options
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}