let mockMessages = [
    {
      id: "m1",
      channel_id: "general",
      content: "Welcome to Dev Collab 👋",
      sender_id: "demo-user",
      sender_name: "Demo User",
      created_date: new Date().toISOString(),
    },
  ];
  
  export const MessageEntity = {
    async filter({ channel_id }) {
      return mockMessages.filter((m) => m.channel_id === channel_id);
    },
  
    async create({ content, channel_id, sender_id, sender_name, sender_avatar }) {
      const newMsg = {
        id: `m_${Date.now()}`,
        content,
        channel_id,
        sender_id,
        sender_name,
        sender_avatar: sender_avatar || null,
        created_date: new Date().toISOString(),
      };
      mockMessages.push(newMsg);
      return newMsg;
    },
  };
  