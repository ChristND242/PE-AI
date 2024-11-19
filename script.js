const form = document.getElementById("messageArea");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const str_time = hour.toString().padStart(2, '0') + ":" + minute.toString().padStart(2, '0');

    const userQuestionElement = document.getElementById("text");
    const userQuestion = userQuestionElement.value;

    if (!userQuestion.trim()) {
        alert("Please enter a message.");
        return;
    }

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

    GrokChatBot(userQuestion, str_time);

    userQuestionElement.value = ""; // Clear the input field
});

function GrokChatBot(question, str_time) {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer xai-1V2GSVVvyt0DREhDcWhCpjYzkSO99TYNebmyw4IVLe752XvWJuubuI3JCmMIE2al8cxAF4RFWHoETxck",
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
            if (!response.ok) {
                return response.text().then(text => { throw new Error("API failed: " + response.status + " " + text); });
            }
            return response.body;
        })
        .then(stream => {
            getStream(stream, str_time);
        })
        .catch(err => console.error("Error:", err));
}

async function getStream(stream, str_time) {
    let message = "";
    const botHtml = document.createElement("div");

    const reader = stream.getReader();
    let appended = false;

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const str = new TextDecoder().decode(value);
        const arr = str.split("\n\n");

        arr.forEach(ele => {
            if (ele.includes("data:")) {
                try {
                    const data = JSON.parse(ele.split("data: ")[1]);
                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                        const content = data.choices[0].delta.content.replace(/\n/g, "<br>");
                        message += content;
                    }
                } catch (e) {
                    console.error("Failed to parse data:", e);
                }
            }
        });

        botHtml.innerHTML = 
            `<div class="d-flex justify-content-start mb-4">
                <div class="img_cont_msg">
                    <img src="https://i.ibb.co/fSNP7Rz/icons8-chatgpt-512.png" class="rounded-circle user_img_msg">
                </div>
                <div class="msg_cotainer">${message}
                    <span class="msg_time">${str_time}</span>
                </div>
            </div>`;

        if (!appended && message) {
            document.getElementById("messageFormeight").appendChild(botHtml);
            appended = true;
        }
        scrollToBottom();
    }
}

function scrollToBottom() {
    const messageBody = document.getElementById("messageFormeight");
    messageBody.scrollTop = messageBody.scrollHeight;
}
