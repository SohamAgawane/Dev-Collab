// src/api/entities/index.js
import { ChannelEntity } from "./channel";
import { MessageEntity } from "./message";
import { ProjectEntity } from "./project";
import { ActivityEntity } from "./activity";
import { DesignSpecEntity } from "./designSpec";
import { DiscussionEntity } from "./discussion";
import { DocumentEntity } from "./document";
import { SprintEntity } from "./sprint";
import { TaskEntity } from "./task";

export const entities = {
  Channel: ChannelEntity,
  Message: MessageEntity,
  Project: ProjectEntity,
  Activity: ActivityEntity,
  DesignSpec: DesignSpecEntity,
  Discussion: DiscussionEntity,
  Document: DocumentEntity,
  Sprint: SprintEntity,
  Task: TaskEntity,
};
