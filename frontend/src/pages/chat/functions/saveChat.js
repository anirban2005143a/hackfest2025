import axios from "axios";

export const saveChatResponse = async(question, answer, uniqueId, userId, title)=> {
    const apiUrl = `${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/savechathistory`

    const requestBody = {
      question: question,
      answer: answer,
      uniqueId: uniqueId,
      user_id: userId,
      title: title,
    };
  
    try {
      const response = await axios.post(apiUrl , requestBody, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      return response.data
    } catch (error) {
      console.error("Error:", error);
      return { error: true, message: error.message };
    }
  }
  