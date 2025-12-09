let mockChannels = [
    { id: "general", name: "general", type: "channel", description: "General project chat", unreadCount: 2 },
    { id: "dev", name: "dev", type: "channel", description: "Development updates", unreadCount: 0 },
];

export const ChannelEntity = {
    async list() {
        return mockChannels;
    },
};
