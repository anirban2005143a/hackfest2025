import axios from "axios";

export const getChatHistory = async (userId) => {
  const apiUrl = `${
    import.meta.env.VITE_REACT_APP_API_URL
  }/api/chat/getchathistory`;
  const requestBody = {
    user_id: userId,
  };
  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return { error: false, chat: response.data.chat };
  } catch (error) {
    console.error("Error:", error);
    if (error.response && error.response.data)
      return {
        error: true,
        message: error.response.data.message || error.message,
      };
    else return { error: true, message: error.message };
  }
};
