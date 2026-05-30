import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import InboxScreen from "../screens/InboxScreen";
import EmailDetailScreen from "../screens/EmailDetailScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Inbox"
          component={InboxScreen}
        />

        <Stack.Screen
          name="EmailDetail"
          component={EmailDetailScreen}
          options={{
            title: "Email Details"
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}