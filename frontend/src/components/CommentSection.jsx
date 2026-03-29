import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function CommentNode({ node, depth, onReply, onLike, onDelete, userId, isAdmin }) {
  const u = node.user;
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div
      style={{
        marginLeft: depth ? Math.min(depth * 14, 56) : 0,
        padding: "0.65rem 0",
        borderLeft: depth ? "2px solid rgba(57,255,182,0.12)" : "none",
        paddingLeft: depth ? "0.75rem" : 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <span style={{ fontWeight: 700 }}>@{u?.username}</span>
          {u?.role === "admin" && (
            <span className="tag" style={{ marginLeft: "0.35rem" }}>
              admin
            </span>
          )}
          <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: "0.15rem" }}>
            {new Date(node.createdAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "flex-start" }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
            onClick={() => onLike(node._id)}
          >
            ♥ {node.likes?.length ?? 0}
          </button>
          {(isAdmin || u?._id === userId) && (
            <button
              type="button"
              className="btn btn-danger"
              style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
              onClick={() => onDelete(node._id)}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p style={{ margin: "0.45rem 0 0", whiteSpace: "pre-wrap" }}>{node.content}</p>
      {userId && (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: "0.5rem", padding: "0.35rem 0.65rem", fontSize: "0.8rem" }}
          onClick={() => setReplyOpen((v) => !v)}
        >
          Reply
        </button>
      )}
      {replyOpen && (
        <form
          style={{ marginTop: "0.5rem" }}
          onSubmit={async (e) => {
            e.preventDefault();
            await onReply(replyText, node._id);
            setReplyText("");
            setReplyOpen(false);
          }}
        >
          <textarea
            className="input"
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
          />
          <button type="submit" className="btn" style={{ marginTop: "0.5rem" }}>
            Post reply
          </button>
        </form>
      )}
      {node.replies?.length > 0 && (
        <div style={{ marginTop: "0.35rem" }}>
          {node.replies.map((ch) => (
            <CommentNode
              key={ch._id}
              node={ch}
              depth={depth + 1}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              userId={userId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ competitionId }) {
  const { user, isAdmin } = useAuth();
  const { notify } = useToast();
  const [tree, setTree] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/comments/competition/${competitionId}`);
      setTree(data.comments || []);
    } catch {
      notify("Could not load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [competitionId]);

  const post = async (text, parentId) => {
    if (!user) return;
    try {
      await api.post(`/comments/competition/${competitionId}`, {
        content: text,
        parentId: parentId || undefined,
      });
      await load();
    } catch (e) {
      notify(e.response?.data?.message || "Failed to post comment");
    }
  };

  const onLike = async (commentId) => {
    if (!user) return;
    try {
      await api.post(`/comments/${commentId}/like`);
      await load();
    } catch {
      notify("Could not like comment");
    }
  };

  const onDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      await load();
    } catch {
      notify("Could not delete comment");
    }
  };

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.15rem" }}>Signal thread</h3>
      {user ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!content.trim()) return;
            await post(content.trim());
            setContent("");
          }}
          style={{ marginTop: "0.75rem" }}
        >
          <textarea
            className="input"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Drop intel, feedback, or hype..."
          />
          <button type="submit" className="btn" style={{ marginTop: "0.6rem" }}>
            Transmit
          </button>
        </form>
      ) : (
        <p style={{ color: "var(--muted)" }}>Log in to join the thread.</p>
      )}
      {loading ? (
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>Loading thread...</p>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          {tree.map((n) => (
            <CommentNode
              key={n._id}
              node={n}
              depth={0}
              onReply={post}
              onLike={onLike}
              onDelete={onDelete}
              userId={user?.id}
              isAdmin={isAdmin}
            />
          ))}
          {!tree.length && (
            <p style={{ color: "var(--muted)" }}>Quiet channel — be the first to comment.</p>
          )}
        </div>
      )}
    </section>
  );
}
