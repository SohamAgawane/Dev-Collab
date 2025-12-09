import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  MessageSquare,
  Hash,
  Search,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  MoreVertical,
  Lock,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff,
  VideoOff,
  User as UserIcon,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProjectMemberProfile from "@/components/project/ProjectMemberProfile";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { format } from "date-fns";

const PAGE_WINDOW_SIZE = 40;

/** -------------------------------------------------
 *  In-memory store helper
 * ------------------------------------------------- */
function ensureStore() {
  if (!window.__DEV_COLLAB_CHAT_STORE__) {
    window.__DEV_COLLAB_CHAT_STORE__ = {
      messagesByChannel: {},
      dmChannels: [],
      enterpriseUsers: [],
      channels: [],
    };
  }
  return window.__DEV_COLLAB_CHAT_STORE__;
}

/**
 * Chat API abstraction layer
 * (plug real backend later)
 */
const chatApi = {
  async listChannels() {
    const store = ensureStore();

    // If channels already initialized, return them
    if (store.channels && store.channels.length > 0) {
      return store.channels;
    }

    // Initial seed channels (once)
    const initial = [
      {
        id: "general",
        name: "general",
        description: "Company-wide announcements",
        type: "channel",
        is_private: false,
        created_at: new Date().toISOString(),
        participant_ids: [],
        memberRoles: {},
      },
      {
        id: "dev",
        name: "dev",
        description: "Development discussions",
        type: "channel",
        is_private: false,
        created_at: new Date().toISOString(),
        participant_ids: [],
        memberRoles: {},
      },
    ];

    store.channels = initial;
    return initial;
  },

  async listMessages(channelId) {
    const store = ensureStore();
    return store.messagesByChannel[channelId] || [];
  },

  async sendMessage({ channelId, message }) {
    const store = ensureStore();
    if (!store.messagesByChannel[channelId]) {
      store.messagesByChannel[channelId] = [];
    }
    store.messagesByChannel[channelId].push(message);

    // Hook to real backend later:
    // await base44.entities.Message.create(...)
    return message;
  },

  async updateMessage(channelId, messageId, partial) {
    const store = ensureStore();
    const arr = store.messagesByChannel[channelId] || [];
    const idx = arr.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...partial };
    }
  },

  async deleteMessage(channelId, messageId) {
    const store = ensureStore();
    const arr = store.messagesByChannel[channelId] || [];
    store.messagesByChannel[channelId] = arr.filter((m) => m.id !== messageId);
  },

  async clearMessages(channelId) {
    const store = ensureStore();
    store.messagesByChannel[channelId] = [];
  },

  async uploadAttachments(files) {
    const uploads = Array.from(files || []).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    return uploads;
  },

  async ensureDmChannel(currentUser, targetUser) {
    const store = ensureStore();
    let existing = store.dmChannels.find(
      (ch) =>
        ch.type === "dm" &&
        ch.participant_ids?.includes(currentUser.id) &&
        ch.participant_ids?.includes(targetUser.id)
    );

    if (!existing) {
      existing = {
        id: `dm-${currentUser.id}-${targetUser.id}`,
        name: targetUser.name, // only other user's name
        description: `Direct messages with ${targetUser.name}`,
        type: "dm",
        participant_ids: [currentUser.id, targetUser.id],
        created_at: new Date().toISOString(),
      };
      store.dmChannels.push(existing);
    }

    return existing;
  },

  async listDmChannels() {
    const store = ensureStore();
    return store.dmChannels;
  },

  async listEnterpriseUsers() {
    const store = ensureStore();

    if (store.enterpriseUsers.length > 0) {
      return store.enterpriseUsers;
    }

    try {
      if (base44?.entities?.User?.list) {
        const list = await base44.entities.User.list();
        const mapped = list.map((u) => ({
          id: u.id,
          name: u.full_name || u.email || "User",
          email: u.email,
          role: "Member",
          status: "online",
          avatar_url: u.avatar_url,
        }));
        store.enterpriseUsers = mapped;
        return mapped;
      }
    } catch {
      // ignore, fall back below
    }

    const demo = [
      {
        id: "u1",
        name: "Soham Agawane",
        email: "soham@example.com",
        role: "Admin",
        status: "online",
      },
      {
        id: "u2",
        name: "Aditi Sharma",
        email: "aditi@example.com",
        role: "Developer",
        status: "online",
      },
      {
        id: "u3",
        name: "Rohit Verma",
        email: "rohit@example.com",
        role: "Tester",
        status: "away",
      },
      {
        id: "u4",
        name: "Neha Singh",
        email: "neha@example.com",
        role: "Developer",
        status: "offline",
      },
    ];
    store.enterpriseUsers = demo;
    return demo;
  },

  async searchUsers(query) {
    const all = await this.listEnterpriseUsers();
    const q = query.toLowerCase();
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  },

  updateChannelInStore(updatedChannel) {
    const store = ensureStore();
    store.channels = (store.channels || []).map((ch) =>
      ch.id === updatedChannel.id ? updatedChannel : ch
    );
  },

  addChannelToStore(newChannel) {
    const store = ensureStore();
    store.channels = [...(store.channels || []), newChannel];
  },
};

export default function Chat() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [dmChannels, setDmChannels] = useState([]);
  const [enterpriseUsers, setEnterpriseUsers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_WINDOW_SIZE);

  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [user, setUser] = useState(null);

  const [callMode, setCallMode] = useState(null); // "audio" | "video" | null
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [callError, setCallError] = useState("");

  const [sendErrorIds, setSendErrorIds] = useState(new Set());
  const [mutedChannelIds, setMutedChannelIds] = useState(new Set());

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [profileMember, setProfileMember] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelMembers, setNewChannelMembers] = useState([]);

  const [channelDetailsOpen, setChannelDetailsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);

  const dmTarget = location.state?.directMessageTo || null;
  const initialMode = location.state?.mode || "chat";

  // ------------------ Current user ------------------

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        // not logged in
      }
    };
    loadUser();
  }, []);

  // ------------------ Enterprise users ------------------

  useEffect(() => {
    const loadUsers = async () => {
      const list = await chatApi.listEnterpriseUsers();
      setEnterpriseUsers(list || []);
    };
    loadUsers();
  }, []);

  // ------------------ Channels & DMs ------------------

  useEffect(() => {
    const loadChannels = async () => {
      const list = await chatApi.listChannels();
      setChannels(list || []);

      const dms = await chatApi.listDmChannels();
      setDmChannels(dms || []);

      if (!selectedChannel && !dmTarget && list && list.length > 0) {
        setSelectedChannel(list[0]);
      }
    };
    loadChannels();
  }, [dmTarget]); // don't depend on selectedChannel, to avoid overwriting new channels

  // Ensure DM channel when coming from ProjectMemberProfile
  useEffect(() => {
    const ensureDm = async () => {
      if (!dmTarget || !user) return;

      const dmChannel = await chatApi.ensureDmChannel(user, dmTarget);
      setSelectedChannel(dmChannel);
      setVisibleCount(PAGE_WINDOW_SIZE);

      if (initialMode === "call") {
        setCallMode("audio");
      }
    };
    ensureDm();
  }, [dmTarget, user, initialMode]);

  // Periodically refresh dmChannels from store
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const dms = await chatApi.listDmChannels();
      if (mounted) setDmChannels(dms || []);
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // ------------------ Messages for selected channel ------------------

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChannel) return;
      const list = await chatApi.listMessages(selectedChannel.id);
      setMessages(list || []);
      setVisibleCount(PAGE_WINDOW_SIZE);
    };
    loadMessages();
  }, [selectedChannel]);

  const totalMessages = messages.length;

  const visibleMessages = useMemo(() => {
    if (totalMessages <= visibleCount) return messages;
    return messages.slice(totalMessages - visibleCount);
  }, [messages, totalMessages, visibleCount]);

  // ------------------ Scroll / infinite window ------------------

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 40 && visibleCount < totalMessages) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_WINDOW_SIZE, totalMessages)
      );
    }
  }, [visibleCount, totalMessages]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [visibleMessages.length, selectedChannel?.id]);

  // ------------------ Attachments ------------------

  const handleAttachClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openAttachment = (att) => {
    if (att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
    }
  };

  // ------------------ Sending / editing / deleting messages ------------------

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedChannel || !user) return;
    if (!messageInput.trim() && attachments.length === 0) return;

    const clientId = crypto.randomUUID();
    const now = new Date().toISOString();

    const uploadedAttachments = attachments.length
      ? await chatApi.uploadAttachments(attachments)
      : [];

    const newMessage = {
      id: clientId,
      clientId,
      channel_id: selectedChannel.id,
      sender_id: user.id,
      sender_name: user.full_name || "You",
      sender_avatar: user.avatar_url || null,
      created_date: now,
      content: messageInput.trim(),
      attachments: uploadedAttachments,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setAttachments([]);
    setShowEmojiPicker(false);

    try {
      await chatApi.sendMessage({
        channelId: selectedChannel.id,
        message: newMessage,
      });
    } catch (err) {
      setSendErrorIds((prev) => {
        const next = new Set(prev);
        next.add(clientId);
        return next;
      });
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (!selectedChannel) return;
    const confirmDelete = window.confirm("Delete this message for everyone?");
    if (!confirmDelete) return;

    await chatApi.deleteMessage(selectedChannel.id, msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditingValue(msg.content || "");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingValue("");
  };

  const handleSaveEdit = async (msg) => {
    if (!selectedChannel) return;
    const trimmed = editingValue.trim();
    if (!trimmed) return;

    await chatApi.updateMessage(selectedChannel.id, msg.id, {
      content: trimmed,
    });

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, content: trimmed } : m))
    );
    setEditingMessageId(null);
    setEditingValue("");
  };

  // ------------------ Header / DM helpers ------------------

  const isDm = selectedChannel?.type === "dm";

  const dmDisplayUser = useMemo(() => {
    if (!isDm) return null;
    if (dmTarget) return dmTarget;
    if (!selectedChannel) return null;

    const others = enterpriseUsers.filter((u) =>
      selectedChannel.participant_ids?.includes(u.id)
    );
    if (others.length === 1) return others[0];
    return others[0] || null;
  }, [isDm, dmTarget, selectedChannel, enterpriseUsers]);

  const headerTitle = isDm
    ? dmDisplayUser?.name || selectedChannel?.name
    : selectedChannel?.name;

  const headerSubtitle = isDm
    ? "Direct messages"
    : selectedChannel?.description || "Project channel";

  const headerIcon = () => {
    if (!selectedChannel) return null;
    if (isDm) {
      const name = headerTitle || "User";
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return (
        <Avatar className="w-10 h-10">
          {dmDisplayUser?.avatar_url ? (
            <AvatarImage src={dmDisplayUser.avatar_url} alt={name} />
          ) : (
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      );
    }
    return (
      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
        <Hash className="w-5 h-5" />
      </div>
    );
  };

  const goToUserProfileFromHeader = () => {
    if (!isDm) return;
    if (!dmDisplayUser) return;
    const member = {
      id: dmDisplayUser.id,
      name: dmDisplayUser.name,
      role: dmDisplayUser.role || "Member",
      status: dmDisplayUser.status || "online",
    };
    setProfileMember(member);
    setProfileOpen(true);
  };

  const openProfileFromMessage = (msg) => {
    const name = msg.sender_name || "User";
    const member = {
      id: msg.sender_id,
      name,
      role: "Member",
      status: "online",
    };
    setProfileMember(member);
    setProfileOpen(true);
  };

  // ------------------ Call media handling ------------------

  useEffect(() => {
    let cancelled = false;

    const startMedia = async () => {
      // When not in call, ensure tracks are stopped
      if (!callMode || !inCall) {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
        }
        setCallError("");
        return;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCallError("Your browser does not support media devices.");
          return;
        }

        const constraints =
          callMode === "video"
            ? { video: true, audio: true }
            : { audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setCallError("");

        if (callMode === "video" && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCallError(
          "Could not access camera/microphone. Check permissions in your browser."
        );
      }
    };

    startMedia();

    return () => {
      cancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [callMode, inCall]);

  const startCall = (mode) => {
    setCallMode(mode);
    setInCall(false); // show “Join call” banner first
  };

  const joinCall = () => setInCall(true);

  const endCall = () => {
    setCallMode(null);
    setInCall(false);
    setMuted(false);
    setCameraOn(true);
    setCallError("");
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      const stream = localStreamRef.current;
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleCamera = () => {
    setCameraOn((prev) => {
      const next = !prev;
      const stream = localStreamRef.current;
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  // ------------------ Channels split ------------------

  const normalChannels = useMemo(
    () => channels.filter((c) => c.type !== "dm"),
    [channels]
  );

  // ------------------ Search ------------------

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      const term = searchTerm.trim();
      if (!term) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await chatApi.searchUsers(term);
        if (active) {
          setSearchResults(results || []);
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    };

    const id = setTimeout(runSearch, 250);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [searchTerm]);

  const handleSearchUserClick = async (u) => {
    if (!user) return;
    const dmChannel = await chatApi.ensureDmChannel(user, u);
    setSelectedChannel(dmChannel);
    setVisibleCount(PAGE_WINDOW_SIZE);
    setSearchTerm("");
    setSearchResults([]);
  };

  // ------------------ Channel creation (group) ------------------

  const toggleChannelMember = (u) => {
    setNewChannelMembers((prev) => {
      if (prev.find((p) => p.id === u.id)) {
        return prev.filter((p) => p.id !== u.id);
      }
      return [...prev, u];
    });
  };

  const handleCreateChannel = () => {
    const name = newChannelName.trim();
    if (!name) return;
    const id = `ch-${crypto.randomUUID()}`;
    const memberIds = newChannelMembers.map((m) => m.id);
    const created_at = new Date().toISOString();

    const memberRoles = {};
    memberIds.forEach((mid) => {
      memberRoles[mid] = "Member";
    });

    const newChannel = {
      id,
      name,
      description: newChannelDesc.trim() || "Group channel",
      type: "channel",
      is_private: memberIds.length > 0,
      participant_ids: memberIds,
      created_at,
      memberRoles,
    };

    // Persist in in-memory store + local state
    chatApi.addChannelToStore(newChannel);
    setChannels((prev) => [...prev, newChannel]);
    setSelectedChannel(newChannel);
    setNewChannelName("");
    setNewChannelDesc("");
    setNewChannelMembers([]);
    setChannelModalOpen(false);
  };

  // ------------------ Channel header menu ------------------

  const toggleMuteChannel = () => {
    if (!selectedChannel) return;
    setMutedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(selectedChannel.id)) {
        next.delete(selectedChannel.id);
      } else {
        next.add(selectedChannel.id);
      }
      return next;
    });
  };

  const handleClearHistory = async () => {
    if (!selectedChannel) return;
    const confirmClear = window.confirm(
      "Clear chat history for everyone in this channel?"
    );
    if (!confirmClear) return;
    await chatApi.clearMessages(selectedChannel.id);
    setMessages([]);
  };

  const isMuted = selectedChannel && mutedChannelIds.has(selectedChannel.id);

  // ------------------ Emoji picker ------------------

  const handleEmojiSelect = (emoji) => {
    const symbol = emoji?.native || "";
    setMessageInput((prev) => prev + symbol);
  };

  // ------------------ Channel details modal helpers ------------------

  const openChannelDetails = () => {
    if (!isDm && selectedChannel) {
      setChannelDetailsOpen(true);
    }
  };

  const updateChannelState = (updated) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === updated.id ? updated : ch))
    );
    setSelectedChannel((prev) =>
      prev && prev.id === updated.id ? updated : prev
    );
    chatApi.updateChannelInStore(updated);
  };

  const currentChannelMembers = useMemo(() => {
    if (!selectedChannel) return [];
    if (!selectedChannel.participant_ids || selectedChannel.participant_ids.length === 0) {
      return [];
    }
    return enterpriseUsers.filter((u) =>
      selectedChannel.participant_ids.includes(u.id)
    );
  }, [enterpriseUsers, selectedChannel]);

  const isCurrentUserChannelAdmin = useMemo(() => {
    if (!selectedChannel || !user) return false;
    const roles = selectedChannel.memberRoles || {};
    if (roles[user.id]) {
      return roles[user.id] === "Admin";
    }
    // default: if no role map, treat current user as admin
    return true;
  }, [selectedChannel, user]);

  const handleChannelRoleChange = (memberId, role) => {
    if (!selectedChannel) return;
    const roles = { ...(selectedChannel.memberRoles || {}) };
    roles[memberId] = role;
    const updated = { ...selectedChannel, memberRoles: roles };
    updateChannelState(updated);
  };

  const handleChannelRemoveMember = (memberId) => {
    if (!selectedChannel) return;
    const confirmed = window.confirm("Remove this member from the channel?");
    if (!confirmed) return;
    const updated = {
      ...selectedChannel,
      participant_ids: (selectedChannel.participant_ids || []).filter(
        (id) => id !== memberId
      ),
    };
    updateChannelState(updated);
  };

  const handleChannelAddMember = (memberId) => {
    if (!selectedChannel) return;
    const current = selectedChannel.participant_ids || [];
    if (current.includes(memberId)) return;
    const updated = {
      ...selectedChannel,
      participant_ids: [...current, memberId],
    };
    updateChannelState(updated);
  };

  // ------------------ DM list helpers (no duplicates, correct status) ------------------

  const hasDmForTarget = useMemo(() => {
    if (!dmTarget) return false;
    return dmChannels.some(
      (ch) =>
        ch.type === "dm" &&
        ch.participant_ids?.includes(dmTarget.id) &&
        (!user || ch.participant_ids.includes(user.id))
    );
  }, [dmTarget, dmChannels, user]);

  const getStatusColor = (status) => {
    if (status === "online") return "bg-emerald-500";
    if (status === "away") return "bg-amber-400";
    return "bg-slate-300";
  };

  // ------------------ Render ------------------

  return (
    <>
      <div className="h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search channels or people..."
                className="pl-9 h-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm.trim() && (
              <div className="mt-3 rounded-md border border-slate-200 bg-white max-h-56 overflow-y-auto">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                    People
                  </span>
                  {searchLoading && (
                    <span className="text-[10px] text-slate-400">
                      Searching...
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2 space-y-1">
                  {searchResults.length === 0 && !searchLoading && (
                    <p className="text-[11px] text-slate-400 px-1 pb-1">
                      No users found.
                    </p>
                  )}
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                      onClick={() => handleSearchUserClick(u)}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{u.name}</p>
                        {u.email && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 py-4">
            {/* Channels */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Channels
                </h3>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                  onClick={() => setChannelModalOpen(true)}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {normalChannels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setCallMode(null);
                      setInCall(false);
                      setVisibleCount(PAGE_WINDOW_SIZE);
                    }}
                    className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                      selectedChannel?.id === channel.id
                        ? "bg-slate-200 text-slate-900 font-medium"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Hash className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="truncate">{channel.name}</span>
                    {channel.is_private && (
                      <Lock className="w-3 h-3 ml-1 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div className="px-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Direct Messages
              </h3>
              <div className="space-y-1">
                {/* Quick entry for dmTarget only if no DM channel exists yet */}
                {dmTarget && !hasDmForTarget && (
                  <button
                    key={`dm-target-${dmTarget.id}`}
                    onClick={async () => {
                      if (!user) return;
                      const dmChannel = await chatApi.ensureDmChannel(
                        user,
                        dmTarget
                      );
                      setSelectedChannel(dmChannel);
                      setCallMode(null);
                      setInCall(false);
                      setVisibleCount(PAGE_WINDOW_SIZE);
                    }}
                    className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                      isDm && headerTitle === dmTarget.name
                        ? "bg-slate-200 text-slate-900 font-medium"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {(() => {
                      const statusUser =
                        enterpriseUsers.find((u) => u.id === dmTarget.id) ||
                        dmTarget;
                      const color = getStatusColor(statusUser.status);
                      return (
                        <div className={`w-2 h-2 rounded-full ${color} mr-2`} />
                      );
                    })()}
                    <span className="truncate">{dmTarget.name}</span>
                  </button>
                )}

                {/* Persisted DM channels */}
                {dmChannels.map((channel) => {
                  const otherUser =
                    enterpriseUsers.find(
                      (u) =>
                        channel.participant_ids?.includes(u.id) &&
                        u.id !== user?.id
                    ) ||
                    (dmTarget &&
                    channel.participant_ids?.includes(dmTarget.id)
                      ? dmTarget
                      : null);

                  const displayName = otherUser?.name || channel.name;
                  const status = otherUser?.status || "offline";
                  const color = getStatusColor(status);

                  return (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        setCallMode(null);
                        setInCall(false);
                        setVisibleCount(PAGE_WINDOW_SIZE);
                      }}
                      className={`w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                        selectedChannel?.id === channel.id
                          ? "bg-slate-200 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${color} mr-2`}
                      />
                      <span className="truncate">{displayName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {selectedChannel ? (
            <>
              {/* Header */}
              <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={
                      isDm ? goToUserProfileFromHeader : openChannelDetails
                    }
                    className={isDm ? "flex items-center gap-3" : ""}
                  >
                    {headerIcon()}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="font-bold text-slate-900 flex items-center gap-2 truncate"
                        onClick={
                          isDm ? goToUserProfileFromHeader : openChannelDetails
                        }
                      >
                        {isDm ? headerTitle : `#${headerTitle}`}
                      </button>
                      {!isDm && selectedChannel.is_private && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          Private channel
                        </Badge>
                      )}
                      {isMuted && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          Muted
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {headerSubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  {isDm && (
                    <>
                      <Phone
                        className="w-5 h-5 cursor-pointer hover:text-slate-600"
                        onClick={() => startCall("audio")}
                      />
                      <Video
                        className="w-5 h-5 cursor-pointer hover:text-slate-600"
                        onClick={() => startCall("video")}
                      />
                      <div className="h-6 w-px bg-slate-200 mx-2" />
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Channel options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={toggleMuteChannel}
                      >
                        {isMuted ? "Unmute notifications" : "Mute notifications"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={handleClearHistory}
                      >
                        Clear chat history
                      </DropdownMenuItem>
                      {!isDm && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={openChannelDetails}
                          >
                            View channel details
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Call notification / surface */}
              {isDm && callMode && !inCall && (
                <div className="px-6 py-2 bg-indigo-50 text-indigo-900 text-xs flex items-center justify-between border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    {callMode === "audio" ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    <span>
                      {callMode === "audio"
                        ? `Audio call with ${headerTitle}`
                        : `Video call with ${headerTitle}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] border-indigo-200 text-indigo-900 bg-white hover:bg-indigo-50"
                      onClick={joinCall}
                    >
                      Join call
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[11px] text-slate-500 hover:text-slate-700"
                      onClick={endCall}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {isDm && callMode && inCall && (
                <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
                  <div className="w-full rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      {callMode === "video" ? (
                        <div className="w-full max-w-md aspect-video rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center">
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="w-20 h-20">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl">
                            {(headerTitle || "U")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900">
                          {headerTitle}
                        </p>
                        <p className="text-xs text-slate-500">
                          {callMode === "audio" ? "Audio call" : "Video call"} in
                          Dev Collab
                        </p>
                      </div>
                      {callError && (
                        <p className="text-[11px] text-red-500">{callError}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant={muted ? "outline" : "secondary"}
                          className="rounded-full h-10 w-10"
                          onClick={toggleMute}
                        >
                          {muted ? (
                            <MicOff className="w-5 h-5" />
                          ) : (
                            <Mic className="w-5 h-5" />
                          )}
                        </Button>
                        {callMode === "video" && (
                          <Button
                            size="icon"
                            variant={cameraOn ? "secondary" : "outline"}
                            className="rounded-full h-10 w-10"
                            onClick={toggleCamera}
                          >
                            {cameraOn ? (
                              <Video className="w-5 h-5" />
                            ) : (
                              <VideoOff className="w-5 h-5" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="rounded-full h-10 w-10"
                          onClick={endCall}
                        >
                          <Phone className="w-5 h-5 rotate-135" />
                        </Button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Call UI only – wire WebRTC / signalling backend later.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                {visibleMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}

                {visibleMessages.map((msg) => {
                  const isMe = msg.sender_id === user?.id;
                  const createdAt = msg.created_date
                    ? format(new Date(msg.created_date), "h:mm a")
                    : "";
                  const hasAttachments = Array.isArray(msg.attachments);
                  const failed = sendErrorIds.has(msg.clientId);
                  const isEditing = editingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        isMe ? "flex-row-reverse" : ""
                      } group`}
                    >
                      <button
                        type="button"
                        onClick={() => openProfileFromMessage(msg)}
                      >
                        <Avatar className="w-8 h-8 mt-1">
                          {msg.sender_avatar ? (
                            <AvatarImage
                              src={msg.sender_avatar}
                              alt={msg.sender_name}
                            />
                          ) : (
                            <AvatarFallback
                              className={
                                isMe
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-100 text-slate-600"
                              }
                            >
                              {msg.sender_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </button>

                      <div
                        className={`flex flex-col max-w-[70%] ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            type="button"
                            onClick={() => openProfileFromMessage(msg)}
                            className="text-sm font-medium text-slate-900"
                          >
                            {msg.sender_name}
                          </button>
                          <span className="text-xs text-slate-400">
                            {createdAt}
                          </span>
                          {failed && (
                            <span className="text-[10px] text-red-500">
                              Failed to send
                            </span>
                          )}
                        </div>

                        {/* Message bubble / edit mode */}
                        {isEditing && isMe ? (
                          <div className="flex flex-col items-stretch gap-1 w-full">
                            <Input
                              value={editingValue}
                              onChange={(e) =>
                                setEditingValue(e.target.value)
                              }
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end text-[11px]">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-indigo-600 hover:bg-indigo-700"
                                onClick={() => handleSaveEdit(msg)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {msg.content && (
                              <div
                                className={`relative p-3 rounded-lg text-sm whitespace-pre-wrap break-words ${
                                  isMe
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                                }`}
                              >
                                {msg.content}
                                {isMe && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/80 text-slate-500 shadow-sm"
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-40"
                                    >
                                      <DropdownMenuLabel>
                                        Message
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleStartEdit(msg)}
                                      >
                                        Edit message
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="cursor-pointer text-red-500"
                                        onClick={() =>
                                          handleDeleteMessage(msg)
                                        }
                                      >
                                        Delete for everyone
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            )}

                            {/* Attachments */}
                            {hasAttachments && msg.attachments.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {msg.attachments.map((att) => {
                                  const isImage =
                                    att.type &&
                                    att.type.startsWith("image/");
                                  const label =
                                    att.name ||
                                    (isImage ? "Image" : "File");

                                  if (isImage) {
                                    return (
                                      <button
                                        key={att.id}
                                        type="button"
                                        onClick={() => openAttachment(att)}
                                        className="border border-slate-200 rounded-lg overflow-hidden bg-white max-w-[200px] hover:border-indigo-300"
                                      >
                                        <div className="w-full h-32 overflow-hidden bg-slate-50 flex items-center justify-center">
                                          <img
                                            src={att.url}
                                            alt={att.name}
                                            className="object-cover w-full h-full"
                                          />
                                        </div>
                                        <div className="px-2 py-1 text-[11px] text-slate-600 text-left truncate">
                                          {label}
                                        </div>
                                      </button>
                                    );
                                  }

                                  return (
                                    <button
                                      key={att.id}
                                      type="button"
                                      onClick={() => openAttachment(att)}
                                      className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-indigo-300"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span className="max-w-[140px] truncate">
                                        {label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachments preview before send */}
              {attachments.length > 0 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50">
                  {attachments.map((file, idx) => {
                    const isImage = file.type.startsWith("image/");
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600"
                      >
                        {isImage ? (
                          <ImageIcon className="w-3 h-3 text-indigo-500" />
                        ) : (
                          <FileText className="w-3 h-3 text-slate-500" />
                        )}
                        <span className="max-w-[140px] truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400">
                          {Math.round(file.size / 1024)} KB
                        </span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => removeAttachment(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-24 right-6 z-40 bg-white border border-slate-200 rounded-lg shadow-lg">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                  />
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={handleAttachClick}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                  />
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      isDm
                        ? `Message ${headerTitle}...`
                        : `Message #${selectedChannel.name}...`
                    }
                    className="flex-1"
                    onFocus={() => setShowEmojiPicker(false)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-slate-600 relative"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      (!messageInput.trim() && attachments.length === 0) ||
                      !selectedChannel
                    }
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Select a channel or direct message to start chatting
            </div>
          )}
        </div>
      </div>

      {/* User profile popup (Teams-style, reusing existing component) */}
      {profileMember && (
        <ProjectMemberProfile
          open={profileOpen}
          onOpenChange={(open) => {
            setProfileOpen(open);
            if (!open) setProfileMember(null);
          }}
          member={profileMember}
          project={null}
        />
      )}

      {/* Channel creation modal */}
      {channelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20"
          onClick={() => setChannelModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Create channel
              </h2>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                onClick={() => setChannelModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Channel name
                </p>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. frontend-squad"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Description
                </p>
                <Input
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="What is this channel about?"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Members (optional)
                </p>
                <div className="border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                  {enterpriseUsers.map((u) => {
                    const selected = newChannelMembers.some(
                      (m) => m.id === u.id
                    );
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleChannelMember(u)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs ${
                          selected
                            ? "bg-indigo-50 text-indigo-900"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate flex-1 text-left">
                          {u.name}
                        </span>
                        {selected && (
                          <span className="text-[9px] text-indigo-600">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setChannelModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim()}
              >
                Create channel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Channel details modal */}
      {channelDetailsOpen && selectedChannel && !isDm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20"
          onClick={() => setChannelDetailsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  #{selectedChannel.name}
                  {selectedChannel.is_private && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      Private channel
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedChannel.description || "Channel details"}
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                onClick={() => setChannelDetailsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Created{" "}
                  {selectedChannel.created_at
                    ? format(
                        new Date(selectedChannel.created_at),
                        "MMM d, yyyy"
                      )
                    : "N/A"}
                </span>
                <span>
                  Members:{" "}
                  {selectedChannel.participant_ids
                    ? selectedChannel.participant_ids.length
                    : 0}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900 mb-1">
                  Members
                </p>
                {currentChannelMembers.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No specific members added. All workspace members may have
                    access.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-md max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {currentChannelMembers.map((m) => {
                      const roles = selectedChannel.memberRoles || {};
                      const role = roles[m.id] || "Member";
                      const isSelf = m.id === user?.id;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between px-2 py-1.5 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="w-6 h-6">
                              {m.avatar_url ? (
                                <AvatarImage
                                  src={m.avatar_url}
                                  alt={m.name}
                                />
                              ) : (
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">
                                  {m.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-slate-800">
                                {m.name} {isSelf && <span>(You)</span>}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {m.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrentUserChannelAdmin ? (
                              <select
                                value={role}
                                onChange={(e) =>
                                  handleChannelRoleChange(m.id, e.target.value)
                                }
                                className="border border-slate-200 rounded-md text-[10px] px-1 py-[1px] bg-white"
                              >
                                <option>Admin</option>
                                <option>Member</option>
                                <option>Viewer</option>
                              </select>
                            ) : (
                              <span className="text-[10px] text-slate-500">
                                {role}
                              </span>
                            )}
                            {isCurrentUserChannelAdmin && !isSelf && (
                              <button
                                type="button"
                                className="text-[11px] text-red-500 hover:underline"
                                onClick={() =>
                                  handleChannelRemoveMember(m.id)
                                }
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isCurrentUserChannelAdmin && (
                <div>
                  <p className="text-xs font-semibold text-slate-900 mb-1">
                    Add members
                  </p>
                  <div className="border border-slate-200 rounded-md max-h-32 overflow-y-auto">
                    {enterpriseUsers
                      .filter(
                        (u) =>
                          !selectedChannel.participant_ids ||
                          !selectedChannel.participant_ids.includes(u.id)
                      )
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleChannelAddMember(u.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-slate-50 text-slate-700"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px]">
                              {u.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate flex-1 text-left">
                            {u.name}
                          </span>
                        </button>
                      ))}
                    {enterpriseUsers.filter(
                      (u) =>
                        !selectedChannel.participant_ids ||
                        !selectedChannel.participant_ids.includes(u.id)
                    ).length === 0 && (
                      <p className="text-[11px] text-slate-400 px-2 py-2">
                        Everyone is already in this channel.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
