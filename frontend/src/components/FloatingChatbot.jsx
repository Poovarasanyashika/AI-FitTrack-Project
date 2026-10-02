import AiRichText from "./common/AiRichText";
import {
  Bot,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  chatbotService,
} from "../services/chatbotService";

export default function FloatingChatbot() {
    

  const chatbotRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        id: "welcome",
        role: "assistant",
        text:
          "Hi! I'm your AI FitTrack Gemini Fitness Assistant. Ask me about workouts, fitness guidance, recovery, or training tips.",
      },
    ]);

  /*
   * Close chatbot whenever
   * the route changes.
   */

  /*
   * Close chatbot when clicking
   * anywhere outside it.
   *
   * Capture phase makes this work
   * before navbar/buttons/router
   * handlers execute.
   */
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (
      event
    ) => {
      const container =
        chatbotRef.current;

      if (!container) {
        return;
      }

      if (
        !container.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      true
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /*
   * Scroll chatbot to newest
   * message.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [
    messages,
    sending,
    open,
  ]);

  const sendMessage = async (
    event
  ) => {
    event?.preventDefault();

    const text =
      message.trim();

    if (
      !text ||
      sending
    ) {
      return;
    }

    const userMessage = {
      id:
        `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setMessage("");
    setSending(true);
    setError("");

    try {
      const response =
        await chatbotService
          .sendMessage(text);

      const assistantText =
        response.data?.response;

      if (!assistantText) {
        throw new Error(
          "AI response was empty"
        );
      }

      setMessages(
        (current) => [
          ...current,
          {
            id:
              `assistant-${Date.now()}`,
            role:
              "assistant",
            text:
              assistantText,
          },
        ]
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
          "Unable to get AI response"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      ref={chatbotRef}
      className="floating-chatbot"
    >
      {open && (
        <section
          className="chatbot-panel"
          aria-label="AI FitTrack Assistant"
        >
          <header className="chatbot-header">
            <div className="chatbot-header-main">
              <div className="chatbot-header-icon">
                <Sparkles
                  size={17}
                />
              </div>

              <div>
                <strong>
                  Gemini Fitness AI
                </strong>

                <span>
                  AI FitTrack Assistant
                </span>
              </div>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close chatbot"
            >
              <X size={17} />
            </button>
          </header>

          <div className="chatbot-messages">
            {messages.map(
              (item) => (
                <div
                  key={item.id}
                  className={`chat-message ${
                    item.role ===
                    "user"
                      ? "user"
                      : "assistant"
                  }`}
                >
                  {item.role ===
                    "assistant" && (
                    <div className="chat-message-avatar">
                      <Bot
                        size={14}
                      />
                    </div>
                  )}

                  <div className="chat-message-bubble">
                    {item.role === "assistant" ? (
                      <AiRichText
                        text={item.text}
                      />
                    ) : (
                      item.text
                    )}
                  </div>
                </div>
              )
            )}

            {sending && (
              <div className="chat-message assistant">
                <div className="chat-message-avatar">
                  <Bot
                    size={14}
                  />
                </div>

                <div className="chat-message-bubble chatbot-typing">
                  <LoaderCircle
                    size={14}
                  />

                  Gemini is
                  thinking...
                </div>
              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </div>

          {error && (
            <div className="chatbot-error">
              {error}
            </div>
          )}

          <form
            className="chatbot-input-area"
            onSubmit={
              sendMessage
            }
          >
            <textarea
              rows="1"
              value={message}
              disabled={sending}
              placeholder="Ask about workouts, recovery..."
              onChange={(
                event
              ) =>
                setMessage(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  sendMessage(
                    event
                  );
                }
              }}
            />

            <button
              type="submit"
              disabled={
                sending ||
                !message.trim()
              }
              aria-label="Send message"
            >
              <Send
                size={16}
              />
            </button>
          </form>

          <footer className="chatbot-footer">
            <Sparkles
              size={11}
            />

            Powered by Google Gemini
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`chatbot-floating-button ${
          open
            ? "open"
            : ""
        }`}
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-label={
          open
            ? "Close AI chatbot"
            : "Open AI chatbot"
        }
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle
              size={23}
            />

            <span className="chatbot-ai-dot">
              AI
            </span>
          </>
        )}
      </button>
    </div>
  );
}
