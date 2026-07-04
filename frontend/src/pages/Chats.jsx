import { useEffect, useMemo, useRef, useState } from 'react';
import API from '../utils/axios';
import { getSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from '../context/AuthContext';

const Chats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const token = useMemo(() => localStorage.getItem('token'), [user?._id]);
  const socket = useMemo(() => getSocket(token), [token]);
  const [showCreator, setShowCreator] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPublic, setNewGroupPublic] = useState(false);
  const [dmUserId, setDmUserId] = useState('');
  const [showPublic, setShowPublic] = useState(false);
  const [publicRooms, setPublicRooms] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Scroll to bottom ref
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await API.get('/chats');
      setChats(data);
    };
    if (user) load();
    setActiveChat(null);
    setMessages([]);
    disconnectSocket();
  }, [user]);

  useEffect(() => {
    const loadPublic = async () => {
      try {
        setLoadingPublic(true);
        const { data } = await API.get('/chats/public/list');
        setPublicRooms(data || []);
      } catch (e) {
        console.error('Failed to load public chats', e);
      } finally {
        setLoadingPublic(false);
      }
    };
    if (showPublic) loadPublic();
  }, [showPublic]);

  useEffect(() => {
    if (!activeChat) return;
    const join = async () => {
      socket.emit('chat:join', activeChat._id);
      const { data } = await API.get(`/chats/${activeChat._id}/messages`);
      setMessages(data);
    };
    join();

    const onMessage = (msg) => {
      if (msg.chatId === activeChat._id) {
        setMessages((m) => [...m, msg]);
        // Mark as read immediately since we're viewing it
        socket.emit('chat:read', { chatId: activeChat._id });
      }
    };

    const onRead = ({ chatId, messages: updatedMsgs }) => {
      if (chatId !== activeChat._id) return;
      setMessages((prev) =>
        prev.map((m) => {
          const updated = updatedMsgs.find((u) => u._id === m._id);
          if (updated) return { ...m, readBy: updated.readBy };
          return m;
        })
      );
    };

    const onEdit = ({ messageId, content, edited }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, content, edited } : m))
      );
    };

    const onDelete = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, deleted: true, content: '' } : m))
      );
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:read', onRead);
    socket.on('chat:message:edit', onEdit);
    socket.on('chat:message:delete', onDelete);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:read', onRead);
      socket.off('chat:message:edit', onEdit);
      socket.off('chat:message:delete', onDelete);
    };
  }, [activeChat, socket]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    const payload = { chatId: activeChat._id, content: input };
    socket.emit('chat:message', payload);
    setInput('');
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const submitEdit = (msg) => {
    if (!editContent.trim() || editContent === msg.content) {
      cancelEdit();
      return;
    }
    socket.emit('chat:message:edit', { messageId: msg._id, content: editContent });
    cancelEdit();
  };

  const deleteMsg = (msgId) => {
    if (!confirm('Delete this message?')) return;
    socket.emit('chat:message:delete', { messageId: msgId });
  };

  const onlineSet = useOnlineSet(socket);

  const participants = activeChat?.participants || [];

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-12 gap-4 bg-gray-50 dark:bg-dark-bg min-h-screen">
      {/* Sidebar */}
      <div className="col-span-4 border rounded-lg overflow-hidden">
        <div className="p-3 font-semibold border-b">
          <div className="flex items-center justify-between">
            <span>Chats</span>
            <button className="btn-outline text-sm" onClick={() => setShowCreator((v) => !v)}>New</button>
          </div>
          {showCreator && (
            <div className="mt-3 space-y-3">
              <div className="text-sm font-medium text-gray-700">Create Group</div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Group name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={newGroupPublic} onChange={(e) => setNewGroupPublic(e.target.checked)} />
                  Public
                </label>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    if (!newGroupName.trim()) return;
                    try {
                      const { data } = await API.post('/chats/group', { name: newGroupName, isPublic: newGroupPublic });
                      setChats((prev) => [data, ...prev]);
                      setActiveChat(data);
                      setNewGroupName('');
                      setNewGroupPublic(false);
                      setShowCreator(false);
                      if (newGroupPublic && showPublic) {
                        try { const res = await API.get('/chats/public/list'); setPublicRooms(res.data || []); } catch {}
                      }
                    } catch (e) { console.error('Failed to create group', e); }
                  }}
                >Create</button>
              </div>
              <div className="text-sm font-medium text-gray-700">Start DM</div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Recipient user ID" value={dmUserId} onChange={(e) => setDmUserId(e.target.value)} />
                <button
                  className="btn-outline"
                  onClick={async () => {
                    if (!dmUserId.trim()) return;
                    try {
                      const { data } = await API.post('/chats/dm', { userId: dmUserId.trim() });
                      setChats((prev) => [data, ...prev.filter((c) => c._id !== data._id)]);
                      setActiveChat(data);
                      setDmUserId('');
                      setShowCreator(false);
                    } catch (e) { console.error('Failed to start DM', e); }
                  }}
                >Start</button>
              </div>
            </div>
          )}
        </div>
        <ul>
          {chats.map((c) => {
            const otherUsers = (c.participants || []).filter((p) => p._id !== user?._id);
            const name = c.type === 'group' ? (c.name || 'Group') : (otherUsers[0]?.username || otherUsers[0]?._id || 'DM');
            const isOnline = otherUsers.some((p) => onlineSet.has(p._id));
            return (
              <li
                key={c._id}
                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-card ${activeChat?._id === c._id ? 'bg-gray-100 dark:bg-dark-card' : ''}`}
                onClick={() => setActiveChat(c)}
              >
                <span className="flex items-center gap-2">
                  <span className="truncate max-w-[140px]">{name}</span>
                  {c.type === 'group' && c.isPublic && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-700 shrink-0">Public</span>
                  )}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Chat panel */}
      <div className="col-span-8 border rounded-lg flex flex-col">
        <div className="p-3 border-b font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>{activeChat ? (activeChat.name || 'Conversation') : 'Select a chat'}</span>
            {activeChat?.type === 'group' && activeChat?.isPublic && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Public</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button className="btn-outline text-sm" onClick={() => setShowPublic((v) => !v)}>
              {showPublic ? 'Hide Public' : 'Browse Public'}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => {
            const mine = (m.senderId?._id || m.senderId) === user?._id;
            let username = m.senderName || m.senderId?.username;
            if (!username) {
              const senderIdStr = (typeof m.senderId === 'object' && m.senderId?._id) ? m.senderId._id : m.senderId;
              const found = participants.find((p) => p._id === senderIdStr);
              username = found?.username || (mine ? user?.username : 'Unknown');
            }

            // Read receipt: any participant other than the sender has read it
            const readByOthers = (m.readBy || []).some(
              (id) => String(id) !== String(m.senderId?._id || m.senderId)
            );

            const isEditing = editingMessageId === m._id;

            return (
              <div
                key={m._id}
                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredMessageId(m._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`relative group max-w-[70%]`}>
                  <div className={`rounded px-3 py-2 ${mine ? 'bg-proddit-orange text-white' : 'bg-gray-100 dark:bg-dark-card dark:text-dark-text'}`}>
                    <div className={`text-xs mb-1 ${mine ? 'text-orange-50' : 'text-gray-600 dark:text-dark-text-secondary'}`}>{username}</div>

                    {m.deleted ? (
                      <div className="italic opacity-60 text-sm">Message deleted</div>
                    ) : isEditing ? (
                      <div className="flex flex-col gap-1">
                        <input
                          autoFocus
                          className="input text-sm text-gray-900 w-full"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitEdit(m);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <div className="flex gap-1 justify-end mt-1">
                          <button className="text-xs text-orange-100 hover:text-white underline" onClick={() => submitEdit(m)}>Save</button>
                          <button className="text-xs text-orange-200 hover:text-white underline" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>{m.content}</div>
                    )}

                    {/* Edited indicator */}
                    {m.edited && !m.deleted && (
                      <div className={`text-[10px] mt-0.5 ${mine ? 'text-orange-100' : 'text-gray-400'}`}>(edited)</div>
                    )}
                  </div>

                  {/* Action buttons — own messages only, on hover */}
                  {mine && !m.deleted && !isEditing && hoveredMessageId === m._id && (
                    <div className={`absolute top-0 -left-16 flex gap-1 items-center`}>
                      <button
                        title="Edit"
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border text-gray-500 text-xs"
                        onClick={() => startEdit(m)}
                      >✏️</button>
                      <button
                        title="Delete"
                        className="p-1 rounded hover:bg-red-100 text-red-500 text-xs"
                        onClick={() => deleteMsg(m._id)}
                      >🗑️</button>
                    </div>
                  )}
                </div>

                {/* Read receipt ticks — only show on own messages */}
                {mine && !m.deleted && (
                  <div className="text-[10px] text-gray-400 mt-0.5 pr-1">
                    {readByOthers ? '✓✓' : '✓'}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {activeChat && (
          <form onSubmit={send} className="p-3 border-t flex gap-2">
            <input
              className="flex-1 input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
            />
            <button className="btn-primary" type="submit">Send</button>
          </form>
        )}

        {/* Delete chat */}
        {activeChat && activeChat.createdBy === user?._id && (
          <div className="p-3 border-t">
            <button
              className="text-red-600 hover:text-red-700 text-sm"
              onClick={async () => {
                if (!confirm('Delete this chat? This will remove all messages.')) return;
                try {
                  await API.delete(`/chats/${activeChat._id}`);
                  setChats((prev) => prev.filter((c) => c._id !== activeChat._id));
                  setActiveChat(null);
                  setMessages([]);
                } catch (e) { console.error('Failed to delete chat', e); }
              }}
            >Delete Chat</button>
          </div>
        )}
      </div>

      {/* Public rooms panel */}
      {showPublic && (
        <div className="col-span-4 border rounded-lg p-3 h-fit">
          <div className="font-semibold mb-2">Public Rooms</div>
          {loadingPublic ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <ul className="space-y-2">
              {publicRooms.length === 0 ? (
                <li className="text-sm text-gray-500 flex items-center justify-between">
                  <span>No public rooms yet.</span>
                  <button
                    className="btn-outline text-xs"
                    onClick={async () => {
                      try {
                        setLoadingPublic(true);
                        const { data } = await API.get('/chats/public/list');
                        setPublicRooms(data || []);
                      } catch (e) { console.error('Failed to refresh public chats', e); }
                      finally { setLoadingPublic(false); }
                    }}
                  >Refresh</button>
                </li>
              ) : publicRooms.map((r) => (
                <li key={r._id} className="flex items-center justify-between">
                  <span className="text-sm">{r.name}</span>
                  <button
                    className="btn-outline text-xs"
                    onClick={async () => {
                      try {
                        const res = await API.post(`/chats/public/${r._id}/join`);
                        setChats((prev) => [res.data, ...prev.filter((c) => c._id !== res.data._id)]);
                        setActiveChat(res.data);
                        setShowPublic(false);
                      } catch (e) { console.error('Failed to join public chat', e); }
                    }}
                  >Join</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const useOnlineSet = (socket) => {
  const [online, setOnline] = useState(new Set());
  useEffect(() => {
    const handler = (list) => setOnline(new Set(list));
    socket.on('presence:update', handler);
    return () => socket.off('presence:update', handler);
  }, [socket]);
  return online;
};

export default Chats;
