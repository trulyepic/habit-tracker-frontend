import React from "react"
import ReactDOM from "react-dom/client"
import './index.css'
import App from './App.jsx'
import { InMemoryCache, ApolloClient, HttpLink } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react';


const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:8000/graphql/",
    credentials: "include",
  }), 
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          habits: {
            merge(_, incoming) {
              return incoming; // replace list on incoming results
            },
          },
        },
      },
    },
    HabitType: { keyFields: ["id"]}, 
    Habit: { keyFields: ["id"]},
  }),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App/>
    </ApolloProvider>
  </React.StrictMode>
)
