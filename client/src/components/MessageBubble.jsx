export default function MessageBubble({ message }) {
  return (
    <div className={`message ${message.role}`}>
      <div className="message-role">
        {message.role === "user" ? "You" : "AI"}
      </div>

      <div className="message-content">{message.content}</div>
    </div>
  );
}
