import axios from "axios";
const getresponse = async (input) => {
  try {
    if (!input) {
      return { error: true, message: "Input is required" };
    }
    const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/getanswer`, {
      input: input,
    },{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response.data.data.response);6
    
    return response.data.data.response;
  } catch (error) {
    console.error("Error:", error.message);
    return (error.response.data.message || error.response.message || error.message || "An error occurred") ;
  }
};

export {getresponse};
