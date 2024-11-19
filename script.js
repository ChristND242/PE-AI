const form = document.getElementById("messageArea");

form.addEventListener("submit", function(event) {
  event.preventDefault();

    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const str_time = hour + ":" + minute;
    
    const userQuestion = document.getElementById("text").value;
    let question = userQuestion.arialValueMa;

    const messageFormeight = document.getElementById("messageFormeight");

    const userHtml = document.createElement("div");

    userHtml.innerHTML = 
    `<div class="d-flex justify-content-end mb-4">
        <div class="msg_cotainer_send">
        ${userQuestion}
        <span class="msg_time_send">${str_time}</span>
        </div>
        <div class="img_cont_msg">
        <img src="https://i.ibb.co/d5b84Xw/Untitled-design.png" class="rounded-circle user_img_msg">
        </div>
    </div>`;

    messageFormeight.appendChild(userHtml);
    scrollToBottom();

    GrokChatBot(question, str_time);

    userQuestion.value = "";

  
  })

  function GrokChatBot(question, str_time) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer" + "xai-1V2GSVVvyt0DREhDcWhCpjYzkSO99TYNebmyw4IVLe752XvWJuubuI3JCmMIE2al8cxAF4RFWHoETxck",
      },
      body: JSON.stringify({
        "messages": [
          {
            "role": "system",
            "content": "You are Pona EKolo Assistant, made by Christ ND. You are a helpful assistant that can answer questions and provide information on a wide range of topics. You have access to the internet and can use it to gather information. You can also use your knowledge of the world to answer questions. Your responses should be informative and helpful.",
          },
          {
            "role": "user",
            "content": question
          },
        ],
        "model": "grok-beta",
        "stream": true,
        "temperature": 0.5
      }),
    };
    fetch("https://api.x.ai/v1/chat/completions", options)
    .then(response => {
        if (!response.ok || !response.body) {
            throw new Error("API failed" + response.status + response.text());
          }
          return response.body;
    })
    .then(res => {
      readStream(res, str_time);
    })
    .catch(err => console.log(err));
}

async function getStream(stream, str_time) {
    let message = "";
    const botHtml = document.createElement("div");

    const reader = stream.getReader();
    let done = false;
    let appended = false;

    while (!done) {
        const { value, done: isDone } = await reader.read();
        if (isDone) break;

        // Chunk of data
        let str = new TextDecoder().decode(value);
        let arr = str.split("n\n");

        arr.forEach(ele => {
            if (ele.includes("content")) {
                let data = ele.split("data: ");
                data.forEach(res => {
                    if (res.includes("data: ")) {
                        res = JSON.parse(res);

                        let content = res.choices[0].delta.content.replace(/\n/g, "<br>");

                        message += content;
                    }
                    
                })
           }
        })
        botHtml.innerHTML = 
            '<div class="d-flex justify-content-start mb-4"><div class="img_cont_msg"><img src="https://i.ibb.co/fSNP7Rz/icons8-chatgpt-512.png" class="rounded-circle user_img_msg"></div><div class="msg_cotainer">' + message + '<span class="msg_time">' + str_time + '</span></div></div>';
        
        scrollToBottom();

        if (!appended && message) {
            messageFormeight.appendChild(botHtml);
            appended = true;
        }
            
    }

}

  function scrollToBottom() {
//   document.getElementById("messageFormeight").scrollTop = document.getElementById("messageFormeight").scrollHeight;
    var messageBody = document.getElementById("messageFormeight");
    messageBody.scrollTop = messageBody.scrollHeight;
}