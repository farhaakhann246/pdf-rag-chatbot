import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        Upload a PDF and ask a question about it.
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
