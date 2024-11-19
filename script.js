// Ensure DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("messageArea");
    const messageFormeight = document.getElementById("messageFormeight");
    const textInput = document.getElementById("text");

    // Scroll to bottom helper function
    function scrollToBottom() {
        messageFormeight.scrollTop = messageFormeight.scrollHeight;
    }

    // Chatbot interaction logic
    async function GrokChatBot(question, str_time) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer xai-1V2GSVVvyt0DREhDcWhCpjYzkSO99TYNebmyw4IVLe752XvWJuubuI3JCmMIE2al8cxAF4RFWHoETxck",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are Pona EKolo Assistant, made by Christ ND. You are a helpful assistant that can answer questions and provide information on a wide range of topics. Your responses should be informative and helpful.",
                    },
                    {
                        role: "user",
                        content: question,
                    },
                ],
                model: "grok-beta",
                stream: true,
                temperature: 0.5,
            }),
        };

        try {
            const response = await fetch("https://api.x.ai/v1/chat/completions", options);

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`API error: ${errorMessage}`);
            }

            // Stream handling
            const stream = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let botMessage = "";
            const botHtml = document.createElement("div");

            while (true) {
                const { done, value } = await stream.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        try {
                            const data = JSON.parse(line.slice(5));
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                botMessage += data.choices[0].delta.content.replace(/\n/g, "<br>");
                            }
                        } catch (e) {
                            console.error("Parsing error:", e);
                        }
                    }
                }

                // Dynamically update bot message
                botHtml.innerHTML = `
                    <div class="d-flex justify-content-start mb-4">
                        <div class="img_cont_msg">
                            <img src="https://i.ibb.co/fSNP7Rz/icons8-chatgpt-512.png" class="rounded-circle user_img_msg">
                        </div>
                        <div class="msg_cotainer">${botMessage}
                            <span class="msg_time">${str_time}</span>
                        </div>
                    </div>
                `;

                if (!messageFormeight.contains(botHtml)) {
                    messageFormeight.appendChild(botHtml);
                }
                scrollToBottom();
            }
        } catch (error) {
            console.error("Error with API interaction:", error);
        }
    }

    // Form submission handler
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const userQuestion = textInput.value.trim();
        if (!userQuestion) {
            alert("Please type a message!");
            return;
        }

        const date = new Date();
        const str_time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

        // Append user message
        const userHtml = document.createElement("div");
        userHtml.innerHTML = `
            <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                    ${userQuestion}
                    <span class="msg_time_send">${str_time}</span>
                </div>
                <div class="img_cont_msg">
                    <img src="https://i.ibb.co/d5b84Xw/Untitled-design.png" class="rounded-circle user_img_msg">
                </div>
            </div>
        `;
        messageFormeight.appendChild(userHtml);
        scrollToBottom();

        // Trigger chatbot response
        GrokChatBot(userQuestion, str_time);

        // Clear input
        textInput.value = "";
    });
});
