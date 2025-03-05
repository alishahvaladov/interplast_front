// Chat Service for InterPlus
// This service handles the client-side chat functionality
// It connects to the backend Socket.IO server and provides a user interface for chatting

// Socket event constants (matching backend)
const SocketEvents = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  JOIN_CHAT: "join_chat",
  LEAVE_CHAT: "leave_chat",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  CHAT_ACCEPTED: "chat_accepted",
  CHAT_CLOSED: "chat_closed",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
  USER_CONNECTED: "user_connected",
  USER_DISCONNECTED: "user_disconnected",
  NEW_CHAT_REQUEST: "new_chat_request",
};

// Chat status constants (matching backend)
const ChatStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  CLOSED: "closed",
};

// Chat configuration
const config = {
  apiBaseUrl: "http://localhost:4000/api",
  socketUrl: "http://localhost:4000",
  typingTimeout: 1000,
  storageKeys: {
    clientId: "interplus_chat_client_id",
    activeChat: "interplus_active_chat",
  },
};

// Global variables
let socket = null;
let clientId = localStorage.getItem(config.storageKeys.clientId) || null;
let activeChatId = localStorage.getItem(config.storageKeys.activeChat) || null;
let typingTimeout = null;
let chatStatus = ChatStatus.PENDING;

// Initialize the chat when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeChat);

function initializeChat() {
  // Generate a client ID if not already stored
  if (!clientId) {
    clientId = generateClientId();
    localStorage.setItem(config.storageKeys.clientId, clientId);
  }

  // Create the chat interface
  createChatInterface();

  // Initialize the socket connection
  initializeSocket();

  // Check if there's an active chat and load it
  if (activeChatId) {
    loadChatMessages(activeChatId)
      .then(() => {
        // Mark messages as read when resuming a chat
        markMessagesAsRead(activeChatId);
        switchToChatInterface();
      })
      .catch((error) => {
        console.error("Error loading active chat:", error);
        // If there's an error loading the chat, clear the active chat ID
        localStorage.removeItem(config.storageKeys.activeChat);
        activeChatId = null;
      });
  }
}

function createChatInterface() {
  // Create chat container
  const chatContainer = document.createElement("div");
  chatContainer.id = "chat-container";
  chatContainer.className =
    "fixed bottom-4 right-4 z-50 flex flex-col items-end";
  document.body.appendChild(chatContainer);

  // Create chat button
  const chatButton = document.createElement("button");
  chatButton.id = "chat-button";
  chatButton.className =
    "flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-indigo-700 transition-colors duration-300";
  chatButton.innerHTML = '<i class="ri-chat-3-line text-xl"></i>';
  chatButton.addEventListener("click", toggleChatModal);
  chatContainer.appendChild(chatButton);

  // Create chat modal
  const chatModal = document.createElement("div");
  chatModal.id = "chat-modal";
  chatModal.className =
    "hidden w-80 h-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col mb-2 transition-all duration-300 transform scale-95 opacity-0";
  chatContainer.appendChild(chatModal);

  // Create chat header
  const chatHeader = document.createElement("div");
  chatHeader.className =
    "bg-primary text-white p-3 flex items-center justify-between";
  chatModal.appendChild(chatHeader);

  const chatTitle = document.createElement("h3");
  chatTitle.className = "font-medium";
  chatTitle.textContent = "Customer Support";
  chatHeader.appendChild(chatTitle);

  const closeButton = document.createElement("button");
  closeButton.className = "text-white hover:text-gray-200";
  closeButton.innerHTML = '<i class="ri-close-line"></i>';
  closeButton.addEventListener("click", toggleChatModal);
  chatHeader.appendChild(closeButton);

  // Create chat content
  const chatContent = document.createElement("div");
  chatContent.id = "chat-content";
  chatContent.className = "flex-grow p-3 overflow-y-auto bg-gray-50";
  chatModal.appendChild(chatContent);

  // Create chat form container (for both initiation and messaging)
  const chatFormContainer = document.createElement("div");
  chatFormContainer.id = "chat-form-container";
  chatFormContainer.className = "p-3 border-t border-gray-200";
  chatModal.appendChild(chatFormContainer);

  // Create the initial chat form (for new chats)
  const initiationForm = document.createElement("form");
  initiationForm.id = "chat-initiation-form";
  initiationForm.className = "flex flex-col gap-2";
  initiationForm.innerHTML = `
    <div class="text-sm text-gray-600 mb-1">Please fill in your details to start a chat</div>
    <input type="text" id="chat-name" placeholder="Your Name" required class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary">
    <input type="email" id="chat-email" placeholder="Your Email" required class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary">
    <textarea id="chat-message" placeholder="How can we help you?" required class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary min-h-[80px] max-h-[120px]"></textarea>
    <button type="submit" class="bg-primary text-white py-2 px-4 rounded text-sm hover:bg-indigo-700 transition-colors duration-300">Start Chat</button>
  `;
  chatFormContainer.appendChild(initiationForm);

  // Create the message form (will be shown after chat initiation)
  const messageForm = document.createElement("form");
  messageForm.id = "chat-message-form";
  messageForm.className = "flex items-center gap-2 hidden";
  messageForm.innerHTML = `
    <textarea id="chat-input" placeholder="Type a message..." class="flex-grow px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary min-h-[40px] max-h-[80px]"></textarea>
    <button type="submit" class="bg-primary text-white p-2 rounded-full hover:bg-indigo-700 transition-colors duration-300">
      <i class="ri-send-plane-fill"></i>
    </button>
  `;
  chatFormContainer.appendChild(messageForm);

  // Add event listeners for the forms
  initiationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("chat-name").value;
    const email = document.getElementById("chat-email").value;
    const message = document.getElementById("chat-message").value;

    initiateChat(name, email, message);
  });

  messageForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (message) {
      sendMessage(message);
      input.value = "";
      // Reset the input height
      input.style.height = "auto";
    }
  });

  // Add event listener for typing indicator
  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.addEventListener("input", function () {
      // Auto-expand the textarea
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";

      // Send typing indicator
      if (activeChatId && socket) {
        socket.emit(SocketEvents.TYPING, {
          chatId: activeChatId,
          userId: clientId,
          userName: document.getElementById("chat-name")?.value || "Customer",
        });

        // Clear previous timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing indicator
        typingTimeout = setTimeout(() => {
          socket.emit(SocketEvents.STOP_TYPING, {
            chatId: activeChatId,
            userId: clientId,
          });
        }, config.typingTimeout);
      }
    });
  }
}

function toggleChatModal() {
  const chatModal = document.getElementById("chat-modal");
  const isVisible = !chatModal.classList.contains("hidden");

  if (isVisible) {
    // Hide the modal
    chatModal.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      chatModal.classList.add("hidden");
    }, 300);
  } else {
    // Show the modal
    chatModal.classList.remove("hidden");
    setTimeout(() => {
      chatModal.classList.remove("opacity-0", "scale-95");
    }, 10);

    // If there's an active chat, mark messages as read
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }
}

function initializeSocket() {
  if (typeof io === "undefined") {
    // Load Socket.IO client if not already loaded
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.6.0/socket.io.min.js";
    script.integrity =
      "sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+";
    script.crossOrigin = "anonymous";
    script.onload = () => connectSocket(config.socketUrl);
    document.head.appendChild(script);
  } else {
    // Socket.IO is already loaded
    connectSocket(config.socketUrl);
  }
}

function connectSocket(url) {
  try {
    socket = io(url);

    // Set up socket event handlers
    socket.on(SocketEvents.CONNECT, () => {
      console.log("Connected to chat server");

      // Identify this client to the server
      socket.emit("identify", {
        userId: clientId,
        userType: "client",
      });

      // Join active chat room if there is one
      if (activeChatId) {
        socket.emit(SocketEvents.JOIN_CHAT, {
          chatId: activeChatId,
          userId: clientId,
        });
      }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
      console.log("Disconnected from chat server");
    });

    socket.on(SocketEvents.ERROR, (error) => {
      console.error("Socket error:", error);
    });

    socket.on(SocketEvents.RECEIVE_MESSAGE, (message) => {
      addMessageToChat(message);

      // If the chat modal is open, mark message as read
      const chatModal = document.getElementById("chat-modal");
      if (!chatModal.classList.contains("hidden")) {
        markMessagesAsRead(message.chatId);
      }
    });

    socket.on(SocketEvents.CHAT_ACCEPTED, (data) => {
      chatStatus = ChatStatus.ACTIVE;
      updateChatStatus(ChatStatus.ACTIVE);

      // Add system message about operator joining
      const systemMessage = {
        content: `${data.operatorName} has joined the chat`,
        sender: "system",
        senderId: "system",
        senderName: "System",
        createdAt: new Date(),
      };

      addMessageToChat(systemMessage);
    });

    socket.on(SocketEvents.CHAT_CLOSED, (data) => {
      chatStatus = ChatStatus.CLOSED;
      updateChatStatus(ChatStatus.CLOSED);

      // Add system message about chat being closed
      const systemMessage = {
        content: "Chat has been closed",
        sender: "system",
        senderId: "system",
        senderName: "System",
        createdAt: new Date(),
      };

      addMessageToChat(systemMessage);
    });

    socket.on(SocketEvents.TYPING, (data) => {
      // Show typing indicator (only if it's not from current user)
      if (data.userId !== clientId) {
        showTypingIndicator(data.userName);
      }
    });

    socket.on(SocketEvents.STOP_TYPING, (data) => {
      // Hide typing indicator
      if (data.userId !== clientId) {
        hideTypingIndicator();
      }
    });
  } catch (error) {
    console.error("Error connecting to chat server:", error);
  }
}

function initiateChat(name, email, message) {
  // Show loading state
  const submitButton = document.querySelector(
    "#chat-initiation-form button[type='submit']"
  );
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.innerHTML =
    '<i class="ri-loader-4-line animate-spin"></i> Starting chat...';

  // Make API request to initiate chat
  fetch(`${config.apiBaseUrl}/chat/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientName: name,
      clientEmail: email,
      initialMessage: message,
      clientId: clientId,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Store the chat ID
      activeChatId = data._id;
      localStorage.setItem(config.storageKeys.activeChat, activeChatId);

      // Join the chat room via socket
      if (socket) {
        socket.emit(SocketEvents.JOIN_CHAT, {
          chatId: activeChatId,
          userId: clientId,
        });
      }

      // Switch to the chat interface
      switchToChatInterface();

      // Add the initial message to the chat
      const initialMessage = {
        _id: Date.now().toString(),
        chatId: activeChatId,
        content: message,
        sender: "client",
        senderId: clientId,
        senderName: name,
        isRead: false,
        createdAt: new Date(),
      };

      addMessageToChat(initialMessage);

      // Add a system message
      const systemMessage = {
        _id: (Date.now() + 1).toString(),
        chatId: activeChatId,
        content:
          "Your message has been received. An operator will join the chat soon.",
        sender: "system",
        senderId: "system",
        senderName: "System",
        isRead: true,
        createdAt: new Date(),
      };

      addMessageToChat(systemMessage);

      // Set the chat status
      chatStatus = ChatStatus.PENDING;
      updateChatStatus(chatStatus);
    })
    .catch((error) => {
      console.error("Error initiating chat:", error);
      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = originalText;

      // Show error message
      alert("Failed to start chat. Please try again later.");
    });
}

function loadClientChats(clientId) {
  return fetch(`${config.apiBaseUrl}/chat/client/${clientId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((chats) => {
      if (chats && chats.length > 0) {
        // Find the most recent active or pending chat
        const activeChat =
          chats.find(
            (chat) =>
              chat.status === ChatStatus.ACTIVE ||
              chat.status === ChatStatus.PENDING
          ) || chats[0]; // Default to first chat if no active/pending chat

        activeChatId = activeChat._id;
        chatStatus = activeChat.status;
        localStorage.setItem(config.storageKeys.activeChat, activeChatId);

        return activeChat;
      }
      return null;
    })
    .catch((error) => {
      console.error("Error loading client chats:", error);
      return null;
    });
}

function loadChatMessages(chatId) {
  return fetch(`${config.apiBaseUrl}/chat/${chatId}/messages`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((messages) => {
      // Clear existing messages
      const chatContent = document.getElementById("chat-content");
      chatContent.innerHTML = "";

      // Add each message to the chat
      messages.forEach((message) => {
        addMessageToChat(message);
      });

      // Scroll to the bottom
      chatContent.scrollTop = chatContent.scrollHeight;

      return messages;
    })
    .catch((error) => {
      console.error("Error loading chat messages:", error);
      throw error;
    });
}

function addMessageToChat(message) {
  const chatContent = document.getElementById("chat-content");

  // Create message element
  const messageEl = document.createElement("div");
  messageEl.className = `mb-3 flex ${getMessageAlignment(message.sender)}`;

  // Create message bubble
  const bubble = document.createElement("div");
  bubble.className = `max-w-[80%] px-3 py-2 rounded-lg ${getMessageStyle(
    message.sender
  )}`;

  // Add sender name if it's a system message or operator
  if (message.sender === "system" || message.sender === "operator") {
    const nameEl = document.createElement("div");
    nameEl.className = "text-xs font-medium mb-1";
    nameEl.textContent =
      message.senderName ||
      (message.sender === "system" ? "System" : "Support");
    bubble.appendChild(nameEl);
  }

  // Add message content
  const contentEl = document.createElement("div");
  contentEl.textContent = message.content;
  bubble.appendChild(contentEl);

  // Add timestamp
  const timeEl = document.createElement("div");
  timeEl.className = "text-xs mt-1 opacity-75";
  timeEl.textContent = formatTime(message.createdAt);
  bubble.appendChild(timeEl);

  // Add bubble to message container
  messageEl.appendChild(bubble);

  // Add message to chat content
  chatContent.appendChild(messageEl);

  // Scroll to the bottom
  chatContent.scrollTop = chatContent.scrollHeight;

  // Hide typing indicator if present
  hideTypingIndicator();
}

function sendMessage(content) {
  if (!activeChatId || !content.trim()) return;

  // Get the client name
  const clientName = document.getElementById("chat-name")?.value || "Customer";

  // Create a message object
  const message = {
    chatId: activeChatId,
    content: content,
    sender: "client",
    senderId: clientId,
    senderName: clientName,
  };

  // Add message to UI immediately (optimistic UI update)
  const uiMessage = {
    ...message,
    _id: Date.now().toString(),
    createdAt: new Date(),
    isRead: false,
  };

  addMessageToChat(uiMessage);

  // Emit message via socket
  if (socket) {
    socket.emit(SocketEvents.SEND_MESSAGE, message);
  }

  // Also send via REST API as fallback
  fetch(`${config.apiBaseUrl}/chat/${activeChatId}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      // Could add a "message failed" indicator here
    });
}

function markMessagesAsRead(chatId) {
  if (!chatId) return;

  fetch(`${config.apiBaseUrl}/chat/${chatId}/read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: clientId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error marking messages as read:", error);
    });
}

function updateChatStatus(status) {
  // Update status indicator in UI
  const chatTitle = document.querySelector("#chat-modal h3");

  if (chatTitle) {
    switch (status) {
      case ChatStatus.PENDING:
        chatTitle.textContent = "Customer Support (Waiting for operator)";
        break;
      case ChatStatus.ACTIVE:
        chatTitle.textContent = "Customer Support (Active)";
        break;
      case ChatStatus.CLOSED:
        chatTitle.textContent = "Customer Support (Closed)";
        break;
      default:
        chatTitle.textContent = "Customer Support";
    }
  }

  // Update status class on chat modal
  const chatModal = document.getElementById("chat-modal");
  if (chatModal) {
    // Remove existing status classes
    chatModal.classList.remove("chat-pending", "chat-active", "chat-closed");
    // Add new status class
    chatModal.classList.add(`chat-${status}`);
  }
}

function switchToChatInterface() {
  // Hide initiation form and show message form
  document.getElementById("chat-initiation-form").classList.add("hidden");
  document.getElementById("chat-message-form").classList.remove("hidden");
}

// Helper functions

function generateClientId() {
  // Generate a random UUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getMessageAlignment(sender) {
  return sender === "client" ? "justify-end" : "justify-start";
}

function getMessageStyle(sender) {
  switch (sender) {
    case "client":
      return "bg-primary text-white";
    case "operator":
      return "bg-gray-200 text-gray-800";
    case "system":
      return "bg-gray-100 text-gray-500 italic";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function showTypingIndicator(name) {
  // Remove existing typing indicator
  hideTypingIndicator();

  // Create new typing indicator
  const chatContent = document.getElementById("chat-content");
  const typingEl = document.createElement("div");
  typingEl.id = "typing-indicator";
  typingEl.className = "flex items-center text-xs text-gray-500 mb-2";
  typingEl.innerHTML = `
    <div class="bg-gray-100 rounded-lg px-3 py-2">
      <span>${name || "Operator"} is typing</span>
      <span class="dots">
        <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </span>
    </div>
  `;

  chatContent.appendChild(typingEl);
  chatContent.scrollTop = chatContent.scrollHeight;

  // Add animation to dots
  const style = document.createElement("style");
  style.id = "typing-style";
  style.textContent = `
    @keyframes blink {
      0% { opacity: 0.2; }
      20% { opacity: 1; }
      100% { opacity: 0.2; }
    }
    .dots .dot {
      animation: blink 1.4s infinite;
      animation-fill-mode: both;
    }
    .dots .dot:nth-child(2) { animation-delay: 0.2s; }
    .dots .dot:nth-child(3) { animation-delay: 0.4s; }
  `;
  document.head.appendChild(style);
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }

  const typingStyle = document.getElementById("typing-style");
  if (typingStyle) {
    typingStyle.remove();
  }
}
