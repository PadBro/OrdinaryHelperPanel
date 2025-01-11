export type TextChannel = {
  id: string;
  type: number;
  last_message_id: string;
  flags: number;
  guild_id: string;
  name: string;
  parent_id: string;
  rate_limit_per_user: number;
  topic?: string;
  position: number;
  permission_overwrites: Array<unknown>;
  nsfw: boolean;
};
