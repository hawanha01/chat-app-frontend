"use client";

import pusherClient from "@/lib/pusher";
import { useState, useEffect, useCallback, SetStateAction } from "react";
import debounce from "lodash.debounce";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState<
    {
      channelName: string;
      user: { userName: string; id: string };
      content: string;
      createdAt: string;
    }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionState, setConnectionState] = useState(
    pusherClient.connection.state
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>();
  const [users, setUsers] = useState<{ userName: string; id: string }[]>();
  const [selectedUser, setSelectedUser] = useState<{
    userName: string;
    id: string;
  }>();
  const [currentUserName, setCurrentUserName] = useState<string>();

  const setCurrentUser = async () => {
    const user = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/current`,
      { params: { id: localStorage.getItem("currentUserId") } }
    );
    setCurrentUserName(
      `${user.data.data.firstName} ${user.data.data.lastName}`
    );
  };
  useEffect(() => {
    setCurrentUser();
    fetchUsers();
  }, []);

  const fetchUsers = async (search: string = "") => {
    const allUsers = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
      { params: { search } }
    );
    allUsers.data.data.map((user: { userName: string; id: string }) => {
      const presenceChannel = pusherClient.subscribe(`presence-${user.id}`);
      presenceChannel.bind(
        "pusher:subscription_succeeded",
        (members: { members: {}; count: any; myID: any }) => {
          console.log("Subscription succeeded!");
          console.log("channelName", presenceChannel.name);
          console.log("All members:", Object.keys(members.members));
          console.log("Total count:", members.count);
          console.log("My ID:", members.myID);
        }
      );
      presenceChannel.bind("pusher:subscription_error", (status: any) => {
        console.log("Subscription error:", status);
      });
    });
    setUsers(allUsers.data.data);
  };

  const debouncedFetchUsers = useCallback(debounce(fetchUsers, 500), []);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetchUsers(searchTerm);
    } else {
      setUsers([]);
    }
  }, [searchTerm, debouncedFetchUsers]);

  const fetchMessages = async (channelName: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pusher/messages`,
        {
          params: { channelName },
        }
      );
      setMessages(response.data.data?.reverse());
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleUserSelect = (user: { userName: string; id: string }) => {
    const currentUser = localStorage.getItem("currentUserId");
    const sortedChannelName = `private-${[currentUser, user.id]
      .sort()
      .join("_")}`;
    setSelectedUser(user);
    setSelectedChannel(sortedChannelName);
    fetchMessages(sortedChannelName);
  };

  useEffect(() => {
    const handleStateChange = (states: { current: SetStateAction<string> }) => {
      setConnectionState(states.current);
      if (states.current === "disconnected") {
        console.warn("Reconnecting Pusher...");
        pusherClient.connect();
      }
    };

    pusherClient.connection.bind("state_change", handleStateChange);
    return () => {
      pusherClient.connection.unbind("state_change", handleStateChange);
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    const channel = pusherClient.subscribe(selectedChannel);
    channel.bind(
      "pusher:subscription_count",
      (data: { subscription_count: any }) => {
        console.log("active Users: ", data.subscription_count);
      }
    );

    const handleNewMessage = (data: {
      channelName: string;
      user: { userName: string; id: string };
      content: string;
      createdAt: string;
    }) => {
      setMessages((prev) => (Array.isArray(prev) ? [...prev, data] : [data]));
    };
    channel.bind("new-message", handleNewMessage);

    channel.bind("pusher:subscription_error", (status: any) => {
      console.log("Subscription error:", status);
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscription successful!");
    });

    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(selectedChannel);
    };
  }, [selectedChannel, connectionState]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!selectedChannel) return;
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/pusher/new-message `,
      {
        channelName: selectedChannel,
        message: newMessage,
        userId: localStorage.getItem("currentUserId"),
        eventName: "new-message",
        auth: localStorage.getItem("pusherAuthToken"),
      }
    );
    setNewMessage("");
  };

  return (
    <div className="flex flex-col items-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">{currentUserName}</h1>
      <div className="flex w-full h-full">
        <aside className="w-1/4 bg-gray-100 p-4 border-r border-gray-300">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <ul>
            {users &&
              users.length > 0 &&
              users.map((user) => (
                <li
                  key={user.id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleUserSelect(user)}
                >
                  {user.userName}
                </li>
              ))}
          </ul>
        </aside>

        <main className="flex-1 p-4 flex flex-col bg-[#EBE9E1]">
          <h2 className="text-xl mb-4">
            Chat with {selectedUser?.userName || "..."}
          </h2>
          <form onSubmit={handleSubmit} className="mb-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border p-2 mr-2"
              placeholder="Type a message"
            />
            <button type="submit" className="bg-blue-500 text-white p-2">
              Send
            </button>
          </form>
          <ul className="flex-1 overflow-y-auto">
            {messages &&
              messages.length > 0 &&
              messages.map((message, index) => (
                <li key={index} className="mb-2">
                  {message.user.userName}: {message.content}
                </li>
              ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
