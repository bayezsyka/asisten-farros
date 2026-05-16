import { promises as fs } from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "reminder-config.json");

export type ReminderConfig = {
  enabled: boolean;
  chatJid: string;
  timezone: string;
  reminderTime: string;
  autoSyncTime: string;
  updatedAt: string;
};

const DEFAULT_CONFIG: ReminderConfig = {
  enabled: false,
  chatJid: "",
  timezone: "Asia/Jakarta",
  reminderTime: "17:00",
  autoSyncTime: "16:55",
  updatedAt: new Date().toISOString(),
};

export async function saveReminderConfig(config: Partial<ReminderConfig>): Promise<ReminderConfig> {
  const current = await loadReminderConfig();
  const updated = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(updated, null, 2), "utf-8");

  return updated;
}

export async function loadReminderConfig(): Promise<ReminderConfig> {
  try {
    const content = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return { ...DEFAULT_CONFIG };
  }
}
