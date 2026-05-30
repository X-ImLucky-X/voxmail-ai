import React, {
    useEffect,
    useState
  } from "react";
  
  import {
    View,
    Text,
    ScrollView
  } from "react-native";
  
  import {
    processEmail
  } from "../services/api";
  
  export default function EmailDetailScreen(
    { route }
  ) {
  
    const { id } = route.params;
  
    const [data, setData] =
      useState(null);
  
    useEffect(() => {
      loadEmail();
    }, []);
  
    async function loadEmail() {
      const result =
        await processEmail(id);
  
      setData(result);
    }
  
    if (!data)
      return <Text>Loading...</Text>;
  
    return (
      <ScrollView
        style={{
          flex: 1,
          padding: 20
        }}
      >
        <Text>
          {data.email.subject}
        </Text>
  
        <Text>
          {data.analysis.summary}
        </Text>
  
        <Text>
          Priority:
          {data.analysis.priority}
        </Text>
  
        <Text>
          Tasks:
        </Text>
  
        {data.analysis.tasks.map(
          (task, index) => (
            <Text key={index}>
              • {task.description}
            </Text>
          )
        )}
  
        <Text>
          Short Reply
        </Text>
  
        <Text>
          {data.drafts.short_reply}
        </Text>
  
        <Text>
          Professional Reply
        </Text>
  
        <Text>
          {data.drafts.professional_reply}
        </Text>
      </ScrollView>
    );
  }