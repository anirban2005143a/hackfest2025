import axios from "axios";

export const getChatInfo = async (chatId) => {
    const apiUrl = `${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/chatinfo`

    const requestBody = {
        chatId: chatId,
    };

    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        // console.log(response)
        if (!response.data.error) {
            return (response.data.chat.length>0 ? response.data.chat[0].chatList : [])
        }
        return { error: true, message: response.data.message }
    } catch (error) {
        console.error("Error:", error);
        return { error: true, message: error.response?.data?.message || error.message };
    }
}
