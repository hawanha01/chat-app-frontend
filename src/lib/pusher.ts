import axios from "axios";
import Pusher from "pusher-js";

const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true,
  authorizer: (channel) => {
    return {
      authorize: (socketId, callback) => {
        axios
          .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pusher/auth`, {
            socket_id: socketId,
            channel_name: channel.name,
            user_id: localStorage.getItem("currentUserId"),
          })
          .then((response) => {
            const authResponse = response.data;
            localStorage.setItem("pusherAuthToken", authResponse.auth);
            callback(null, response.data);
          })
          .catch((error) => {
            callback(error, null);
          });
      },
    };
  },
});

export default pusherClient;
